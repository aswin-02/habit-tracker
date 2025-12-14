import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function ProfilePage() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) redirect("/login");

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="space-y-2 text-sm">
        <p>
          <span className="font-medium">Email:</span>{" "}
          {session.user.email}
        </p>
        <p>
          <span className="font-medium">User ID:</span>{" "}
          {session.user.id}
        </p>
      </div>
    </main>
  );
}
