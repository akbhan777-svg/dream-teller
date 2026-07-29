import { getAdminUsers } from "@/app/actions/admin";
import AdminUserListClient from "./admin-user-list-client";
import { redirect } from "next/navigation";

export default async function AdminUserListPage() {
  const result = await getAdminUsers(1, 100);

  if (result.error === "Unauthorized" || result.error === "Not authenticated") {
    redirect("/");
  }

  return <AdminUserListClient initialUsers={result.data || []} />;
}
