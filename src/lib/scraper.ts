import connectDB from "./mongodb";
import Opportunity from "@/models/Opportunity";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface ScrapedOpportunity {
  name: string;
  program?: string;
  type: "Université" | "Bourse";
  country: string;
  deadline: Date;
  amount?: number;
  website: string;
  notes?: string;
  source: string;
  scrapedAt: Date;
}

interface AIExtractedOpportunity {
  name: string;
  program?: string;
  type?: "Université" | "Bourse";
  country?: string;
  deadline?: string; // ISO string or "YYYY-MM-DD"
  amount?: number;
  notes?: string;
}

// ──────────────────────────────────────────────
// Config
// ──────────────────────────────────────────────
const SITES = [
  {
    name: "Bright Scholarship",
    baseUrl: "https://brightscholarship.com",
    listUrl: "https://brightscholarship.com/",
    defaultType: "Bourse" as const,
    defaultCountry: "International",
  },
  {
    name: "Greatyop",
    baseUrl: "https://greatyop.com",
    listUrl: "https://greatyop.com/",
    defaultType: "Bourse" as const,
    defaultCountry: "International",
  },
];

const MAX_ARTICLES_PER_SITE = 10;
const FETCH_TIMEOUT_MS = 15000;
const OPENROUTER_MODEL = "google/gemini-2.5-flash";

// ──────────────────────────────────────────────
// HTML helpers
// ──────────────────────────────────────────────

/** Strip all HTML tags and decode basic entities */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, "-")
    .replace(/&#8230;/g, "...")
    .replace(/\s{2,}/g, " ")
    .trim();
}

/** Fetch with timeout and a browser-like User-Agent */
async function fetchWithTimeout(url: string, timeoutMs = FETCH_TIMEOUT_MS): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9,fr;q=0.8",
    },
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

// ──────────────────────────────────────────────
// Link extraction
// ──────────────────────────────────────────────

/**
 * Extract article/post URLs from a listing page.
 * We look for <a href="..."> elements whose href looks like a single post
 * (contains a long slug, not a category/tag/page path).
 */
function extractArticleLinks(html: string, baseUrl: string): string[] {
  const seen = new Set<string>();
  const links: string[] = [];

  // Match all anchor hrefs
  const hrefRegex = /href=["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;

  while ((m = hrefRegex.exec(html)) !== null) {
    let href = m[1].trim();

    // Skip anchors, mailto, etc.
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("javascript:")) {
      continue;
    }

    // Handle protocol-relative URLs (//domain.com/path)
    if (href.startsWith("//")) {
      href = "https:" + href;
    }

    // Make absolute for relative paths
    if (href.startsWith("/") && !href.startsWith("//")) {
      href = baseUrl.replace(/\/$/, "") + href;
    } else if (!href.startsWith("http")) {
      continue;
    }

    // Must belong to the same domain
    try {
      const urlObj = new URL(href);
      const baseObj = new URL(baseUrl);
      if (urlObj.hostname !== baseObj.hostname) continue;

      // Filter out generic pages (home, categories, tags, pages, authors, feeds)
      const path = urlObj.pathname;
      if (
        path === "/" ||
        path === "" ||
        /\/(tag|category|author|page|feed|search|wp-content|wp-admin|wp-json)\//i.test(path) ||
        path.endsWith(".xml") ||
        path.endsWith(".css") ||
        path.endsWith(".js") ||
        path.endsWith(".png") ||
        path.endsWith(".jpg")
      ) {
        continue;
      }

      // Prefer paths that look like posts (have a meaningful slug)
      const slug = path.replace(/^\/|\/$/g, "");
      if (slug.split("/").pop()!.length < 8) continue; // too short to be an article slug

      const canonical = urlObj.origin + urlObj.pathname;
      if (!seen.has(canonical)) {
        seen.add(canonical);
        links.push(canonical);
      }
    } catch {
      // Invalid URL
    }
  }

  return links;
}

// ──────────────────────────────────────────────
// OpenRouter AI extraction
// ──────────────────────────────────────────────

async function extractWithAI(
  articleUrl: string,
  articleText: string,
  siteName: string,
  defaultType: "Université" | "Bourse",
  defaultCountry: string
): Promise<AIExtractedOpportunity | null> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.warn("[Scraper] OPENROUTER_API_KEY not set, skipping AI extraction.");
    return null;
  }

  // Truncate content to avoid huge token usage (~4000 chars ≈ 1000 tokens)
  const content = articleText.substring(0, 4000);

  const systemPrompt = `You are a scholarship/opportunity data extractor. 
Given the text of a scholarship or academic opportunity article, extract structured information.
Respond ONLY with a valid JSON object. No markdown, no explanation.

JSON schema:
{
  "name": "string (scholarship/opportunity title, max 120 chars)",
  "program": "string (field of study or program name, optional)",
  "type": "Université" | "Bourse",
  "country": "string (host country in French, e.g. Allemagne, France, États-Unis, Royaume-Uni, International)",
  "deadline": "string (ISO date YYYY-MM-DD, or null if not found)",
  "amount": number | null (scholarship amount in USD/EUR as integer, or null),
  "notes": "string (2-3 sentence summary in French, max 280 chars)"
}`;

  const userPrompt = `Source: ${siteName}
URL: ${articleUrl}

Article content:
${content}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://scholar-tracker.vercel.app",
        "X-Title": "Scholar Tracker",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 512,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn(`[Scraper] OpenRouter API error ${response.status}: ${errText}`);
      return null;
    }

    const data = await response.json();
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "";

    // Extract JSON from response (handle possible markdown code fences)
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(`[Scraper] No JSON found in AI response for ${articleUrl}`);
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIExtractedOpportunity;
    return parsed;
  } catch (err: any) {
    console.warn(`[Scraper] AI extraction failed for ${articleUrl}: ${err.message}`);
    return null;
  }
}

// ──────────────────────────────────────────────
// Deadline helpers
// ──────────────────────────────────────────────

function resolveDeadline(deadlineStr: string | null | undefined): Date {
  if (deadlineStr) {
    const parsed = new Date(deadlineStr);
    if (!isNaN(parsed.getTime()) && parsed > new Date()) {
      return parsed;
    }
  }
  // Fallback: 90 days from now
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 90);
  return fallback;
}

// ──────────────────────────────────────────────
// Main scraper
// ──────────────────────────────────────────────

export async function scrapeOpportunities() {
  await connectDB();

  const opportunities: ScrapedOpportunity[] = [];

  for (const site of SITES) {
    try {
      console.log(`[Scraper] Fetching listing page: ${site.listUrl}`);
      const listingHtml = await fetchWithTimeout(site.listUrl);

      const articleLinks = extractArticleLinks(listingHtml, site.baseUrl);
      const topLinks = articleLinks.slice(0, MAX_ARTICLES_PER_SITE);

      console.log(
        `[Scraper] Found ${articleLinks.length} candidate links on ${site.name}, processing top ${topLinks.length}`
      );

      for (const link of topLinks) {
        try {
          console.log(`[Scraper]  → Fetching article: ${link}`);
          const articleHtml = await fetchWithTimeout(link, 12000);
          const articleText = stripHtml(articleHtml);

          const extracted = await extractWithAI(
            link,
            articleText,
            site.name,
            site.defaultType,
            site.defaultCountry
          );

          if (!extracted || !extracted.name) {
            console.warn(`[Scraper]  ✗ AI returned no usable data for ${link}`);
            continue;
          }

          const opp: ScrapedOpportunity = {
            name: extracted.name.substring(0, 120),
            program: extracted.program || site.name,
            type: extracted.type || site.defaultType,
            country: extracted.country || site.defaultCountry,
            deadline: resolveDeadline(extracted.deadline),
            amount:
              extracted.amount && extracted.amount >= 100 && extracted.amount <= 300000
                ? extracted.amount
                : undefined,
            website: link,
            notes:
              extracted.notes ||
              "Consultez le site officiel pour plus d'informations sur cette opportunité.",
            source: site.name,
            scrapedAt: new Date(),
          };

          opportunities.push(opp);
          console.log(`[Scraper]  ✓ Extracted: "${opp.name}" (${opp.country})`);
        } catch (articleErr: any) {
          console.warn(`[Scraper]  ✗ Failed to process ${link}: ${articleErr.message}`);
        }
      }
    } catch (siteErr: any) {
      console.warn(`[Scraper] Failed to scrape ${site.name}: ${siteErr.message}`);
    }
  }

  // Persist to DB
  let addedCount = 0;
  let updatedCount = 0;

  for (const oppData of opportunities) {
    try {
      const existing = await Opportunity.findOne({ website: oppData.website });
      if (!existing) {
        await Opportunity.create(oppData);
        addedCount++;
      } else {
        existing.name = oppData.name;
        existing.program = oppData.program || existing.program;
        existing.type = oppData.type;
        existing.country = oppData.country;
        existing.deadline = oppData.deadline;
        existing.amount = oppData.amount ?? existing.amount;
        existing.notes = oppData.notes || existing.notes;
        existing.scrapedAt = new Date();
        await existing.save();
        updatedCount++;
      }
    } catch (dbErr: any) {
      console.warn(`[Scraper] DB error for "${oppData.name}": ${dbErr.message}`);
    }
  }

  console.log(
    `[Scraper] Done. Added ${addedCount}, updated ${updatedCount}. Total processed: ${opportunities.length}`
  );

  return {
    success: true,
    addedCount,
    updatedCount,
    totalProcessed: opportunities.length,
  };
}
