import { getAdminOrders } from "@/app/actions/admin";
import AdminOrderListClient from "./admin-order-list-client";
import { redirect } from "next/navigation";

export default async function AdminOrderListPage() {
  const result = await getAdminOrders(1, 100, "all");

  if (result.error === "Unauthorized" || result.error === "Not authenticated") {
    redirect("/");
  }

  return <AdminOrderListClient initialOrders={result.data || []} />;
}
