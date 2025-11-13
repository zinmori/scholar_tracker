import { promises as fs } from "fs";
import path from "path";
import { Application, User } from "@/types";

const DATA_DIR = path.join(process.cwd(), "src", "data");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

// Applications
export async function getApplications(): Promise<Application[]> {
  try {
    const data = await fs.readFile(APPLICATIONS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading applications:", error);
    return [];
  }
}

export async function saveApplications(
  applications: Application[]
): Promise<void> {
  try {
    await fs.writeFile(
      APPLICATIONS_FILE,
      JSON.stringify(applications, null, 2)
    );
  } catch (error) {
    console.error("Error saving applications:", error);
    throw error;
  }
}

export async function getApplicationById(
  id: string
): Promise<Application | null> {
  const applications = await getApplications();
  return applications.find((app) => app.id === id) || null;
}

export async function createApplication(
  application: Omit<Application, "id" | "createdAt" | "updatedAt">
): Promise<Application> {
  const applications = await getApplications();
  const newApplication: Application = {
    ...application,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  applications.push(newApplication);
  await saveApplications(applications);
  return newApplication;
}

export async function updateApplication(
  id: string,
  updates: Partial<Application>
): Promise<Application | null> {
  const applications = await getApplications();
  const index = applications.findIndex((app) => app.id === id);

  if (index === -1) return null;

  applications[index] = {
    ...applications[index],
    ...updates,
    id, // S'assurer que l'ID ne change pas
    updatedAt: new Date().toISOString(),
  };

  await saveApplications(applications);
  return applications[index];
}

export async function deleteApplication(id: string): Promise<boolean> {
  const applications = await getApplications();
  const filtered = applications.filter((app) => app.id !== id);

  if (filtered.length === applications.length) return false;

  await saveApplications(filtered);
  return true;
}

// Users
export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading users:", error);
    return [];
  }
}

export async function validateUser(
  username: string,
  password: string
): Promise<boolean> {
  const users = await getUsers();
  return users.some(
    (user) => user.username === username && user.password === password
  );
}
