import { createFileRoute } from "@tanstack/react-router";

const demo = [
  ["00000000-0000-4000-8000-000000000001", "admin@myproperty.id", "admin123"],
  ["00000000-0000-4000-8000-000000000002", "andi@seller.id", "seller123"],
  ["00000000-0000-4000-8000-000000000003", "siti@seller.id", "seller123"],
  ["00000000-0000-4000-8000-000000000004", "budi@seller.id", "seller123"],
  ["00000000-0000-4000-8000-000000000005", "rina@buyer.id", "buyer123"],
  ["00000000-0000-4000-8000-000000000006", "dimas@buyer.id", "buyer123"],
] as const;

// Temporary one-time setup for demo accounts; idempotent.
export const Route = createFileRoute("/api/public/setup-demo")({
  server: {
    handlers: {
      POST: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const results: string[] = [];
        for (const [id, email, password] of demo) {
          const { error } = await supabaseAdmin.auth.admin.createUser({
            id,
            email,
            password,
            email_confirm: true,
          } as never);
          results.push(`${email}: ${error ? error.message : "ok"}`);
        }
        return Response.json(results);
      },
    },
  },
});
