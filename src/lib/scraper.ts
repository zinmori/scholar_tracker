import connectDB from "./mongodb";
import Opportunity from "@/models/Opportunity";

export async function scrapeOpportunities() {
  await connectDB();

  const opportunities: any[] = [];

  // RSS feeds requested by the user
  const feeds = [
    {
      name: "Bright Scholarship",
      url: "https://brightscholarship.com/feed/",
      type: "Bourse" as const,
      defaultCountry: "International"
    },
    {
      name: "Greatyop",
      url: "https://greatyop.com/feed/",
      type: "Bourse" as const,
      defaultCountry: "International"
    }
  ];

  for (const feed of feeds) {
    try {
      console.log(`[Scraper] Fetching feed from ${feed.name}: ${feed.url}`);
      const response = await fetch(feed.url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        },
        signal: AbortSignal.timeout(12000) // 12 seconds timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const xmlText = await response.text();

      // Simple regex-based parsing of RSS items to avoid library dependencies
      const itemRegex = /<item>([\s\S]*?)<\/item>/g;
      let match;
      let count = 0;

      while ((match = itemRegex.exec(xmlText)) !== null && count < 12) {
        const itemContent = match[1];

        // Match title, link, description, pubDate
        const titleMatch = itemContent.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/) || itemContent.match(/<title>([\s\S]*?)<\/title>/);
        const linkMatch = itemContent.match(/<link><!\[CDATA\[([\s\S]*?)\]\]><\/link>/) || itemContent.match(/<link>([\s\S]*?)<\/link>/);
        const descMatch = itemContent.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) || itemContent.match(/<description>([\s\S]*?)<\/description>/);
        const dateMatch = itemContent.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

        if (titleMatch && linkMatch) {
          let title = titleMatch[1].trim();
          const link = linkMatch[1].trim();
          const rawDesc = descMatch ? descMatch[1] : "";
          
          // Clean title and description from HTML tags and unescape entities
          title = title
            .replace(/<[^>]*>/g, "")
            .replace(/&#8217;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&#8230;/g, "...")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

          let desc = rawDesc
            .replace(/<[^>]*>/g, "")
            .replace(/\s+/g, " ")
            .trim();
          
          desc = desc
            .replace(/&#8217;/g, "'")
            .replace(/&#8211;/g, "-")
            .replace(/&#8230;/g, "...")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

          const pubDate = dateMatch ? new Date(dateMatch[1]) : new Date();

          // Extract category tags to construct the program field
          const categories: string[] = [];
          let catMatch;
          const catRegex = /<category>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/category>/g;
          while ((catMatch = catRegex.exec(itemContent)) !== null) {
            const catName = catMatch[1].trim();
            if (catName && !categories.includes(catName)) {
              categories.push(catName);
            }
          }

          const program = categories
            .filter(
              (c) =>
                !c.toLowerCase().includes("scholarship") &&
                !c.toLowerCase().includes("recommended") &&
                !c.toLowerCase().includes("fully funded")
            )
            .slice(0, 3)
            .join(", ") || feed.name;

          // Deduce country from title/description
          let country = feed.defaultCountry;
          const searchArea = (title + " " + desc + " " + categories.join(" ")).toLowerCase();
          
          if (searchArea.includes("turkey") || searchArea.includes("turquie")) country = "Turquie";
          else if (searchArea.includes("germany") || searchArea.includes("allemagne")) country = "Allemagne";
          else if (searchArea.includes("france")) country = "France";
          else if (searchArea.includes("swiss") || searchArea.includes("suisse") || searchArea.includes("switzerland")) country = "Suisse";
          else if (searchArea.includes("belgium") || searchArea.includes("belgique")) country = "Belgique";
          else if (searchArea.includes("united states") || searchArea.includes("usa") || searchArea.includes("états-unis") || searchArea.includes("american")) country = "États-Unis";
          else if (searchArea.includes("united kingdom") || searchArea.includes("uk ") || searchArea.includes("royaume-uni") || searchArea.includes("british")) country = "Royaume-Uni";
          else if (searchArea.includes("canada") || searchArea.includes("québec") || searchArea.includes("canadian")) country = "Canada";
          else if (searchArea.includes("china") || searchArea.includes("chine") || searchArea.includes("chinese")) country = "Chine";
          else if (searchArea.includes("taiwan") || searchArea.includes("taïwan")) country = "Taïwan";
          else if (searchArea.includes("romania") || searchArea.includes("roumanie")) country = "Roumanie";
          else if (searchArea.includes("italy") || searchArea.includes("italie") || searchArea.includes("italian")) country = "Italie";
          else if (searchArea.includes("japan") || searchArea.includes("japon") || searchArea.includes("japanese")) country = "Japon";
          else if (searchArea.includes("australia") || searchArea.includes("australie") || searchArea.includes("australian")) country = "Australie";
          else if (searchArea.includes("europe")) country = "Europe";

          // Simulate a deadline: 45 days after publication.
          // If the calculated deadline is in the past, push it to 60 days from now 
          // to keep the opportunity active for user tracking.
          let deadline = new Date(pubDate);
          deadline.setDate(deadline.getDate() + 45);
          if (deadline < new Date()) {
            deadline = new Date();
            deadline.setDate(deadline.getDate() + 60);
          }

          // Try to extract a financial amount from title/description
          let amount: number | undefined = undefined;
          const amountMatch = (title + " " + desc).match(/(?:[€$£]|USD|EUR)\s*([0-9]{1,3}(?:[ ,][0-9]{3})*)|([0-9]{1,3}(?:[ ,][0-9]{3})*)\s*(?:[€$£]|USD|EUR|euros|dollars)/i);
          if (amountMatch) {
            const rawVal = amountMatch[1] || amountMatch[2];
            const parsedVal = parseInt(rawVal.replace(/[\s,]/g, ""), 10);
            if (!isNaN(parsedVal) && parsedVal >= 100 && parsedVal <= 250000) {
              amount = parsedVal;
            }
          }

          const notes = desc.length > 280 ? desc.substring(0, 277) + "..." : desc;

          opportunities.push({
            name: title.length > 120 ? title.substring(0, 117) + "..." : title,
            program,
            type: feed.type,
            country,
            deadline,
            amount,
            website: link,
            notes: notes || "Consultez le site officiel pour en savoir plus sur cette opportunité.",
            source: feed.name,
            scrapedAt: new Date()
          });
          count++;
        }
      }
    } catch (error: any) {
      console.warn(`[Scraper] Failed to scrape ${feed.name}:`, error.message || error);
    }
  }

  let addedCount = 0;
  let updatedCount = 0;

  for (const oppData of opportunities) {
    const existing = await Opportunity.findOne({ name: oppData.name, source: oppData.source });
    if (!existing) {
      await Opportunity.create(oppData);
      addedCount++;
    } else {
      // Update values to keep them fresh
      existing.deadline = oppData.deadline;
      existing.website = oppData.website;
      existing.notes = oppData.notes;
      existing.program = oppData.program || existing.program;
      existing.amount = oppData.amount || existing.amount;
      existing.scrapedAt = new Date();
      await existing.save();
      updatedCount++;
    }
  }

  console.log(`[Scraper] Finished. Added ${addedCount} new, updated ${updatedCount} opportunities. Total processed: ${opportunities.length}`);

  return {
    success: true,
    addedCount,
    updatedCount,
    totalProcessed: opportunities.length
  };
}
