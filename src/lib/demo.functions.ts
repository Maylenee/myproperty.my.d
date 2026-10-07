import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Fixed demo accounts whose profile rows are seeded in the database.
const DEMO_ACCOUNTS: Record<string, { id: string; password: string }> = {
  "admin@myproperty.id": { id: "00000000-0000-4000-8000-000000000001", password: "admin123" },
  "andi@seller.id": { id: "00000000-0000-4000-8000-000000000002", password: "seller123" },
  "siti@seller.id": { id: "00000000-0000-4000-8000-000000000003", password: "seller123" },
  "budi@seller.id": { id: "00000000-0000-4000-8000-000000000004", password: "seller123" },
  "rina@buyer.id": { id: "00000000-0000-4000-8000-000000000005", password: "buyer123" },
  "dimas@buyer.id": { id: "00000000-0000-4000-8000-000000000006", password: "buyer123" },
};

export function isDemoCredential(email: string, password: string) {
  return DEMO_ACCOUNTS[email.trim().toLowerCase()]?.password === password;
}

/** Creates a seeded demo login account on first use. Only works for the fixed demo list. */
export const ensureDemoAccount = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ email: z.string().email().max(100) }).parse(data))
  .handler(async ({ data }) => {
    const account = DEMO_ACCOUNTS[data.email.trim().toLowerCase()];
    if (!account) return { ok: false };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.createUser({
      id: account.id,
      email: data.email.trim().toLowerCase(),
      password: account.password,
      email_confirm: true,
    } as Parameters<typeof supabaseAdmin.auth.admin.createUser>[0]);
    return { ok: !error || /already/i.test(error.message) };
  });
