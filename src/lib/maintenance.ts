import { db } from "@/lib/db";

export async function checkMaintenance(): Promise<{ enabled: boolean; eta: string | null }> {
  try {
    const setting = await db.setting.findUnique({ where: { key: "maintenance_mode" } });
    const etaSetting = await db.setting.findUnique({ where: { key: "maintenance_eta" } });
    return {
      enabled: setting?.value === "true",
      eta: etaSetting?.value || null,
    };
  } catch {
    return { enabled: false, eta: null };
  }
}
