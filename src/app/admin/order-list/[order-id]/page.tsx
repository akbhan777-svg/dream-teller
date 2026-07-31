import { getAdminOrderDetail } from "@/app/actions/admin";
import AdminOrderDetailClient from "./admin-order-detail-client";
import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ "order-id": string }>;
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const orderId = resolvedParams["order-id"];
  
  const res = await getAdminOrderDetail(orderId);
  if (res.error === "Unauthorized" || res.error === "Not authenticated") {
    redirect("/");
  }

  let initialOrder = null;
  
  if (res.success && res.data) {
    const data = res.data;
    const user = data.users || {};
    const payment = Array.isArray(data.payments) ? (data.payments[0] || {}) : (data.payments || {});
    const dreamResult = Array.isArray(data.dream_results) ? (data.dream_results[0] || {}) : (data.dream_results || {});

    initialOrder = {
      id: data.id,
      orderNumber: data.order_number,
      tossPaymentKey: payment.payment_key || "-",
      createdAt: new Date(data.created_at).toLocaleString(),
      approvedAt: payment.approved_at ? new Date(payment.approved_at).toLocaleString() : "-",
      user: {
        nickname: user.nickname || "비회원",
        email: user.email || "-",
        phone: user.phone_number || data.guest_phone || "-",
        role: user.role || "게스트",
        provider: user.provider || "-",
      },
      payment: {
        status: data.payment_status,
        totalAmount: data.total_amount,
        method: payment.method || "-",
      },
      content: {
        dreamText: data.dream_content || "-",
        expertField: data.expert_field || "-",
        includesImage: data.includes_image || false,
      },
      result: {
        analysisStatus: dreamResult.analysis_status || "pending",
        analysisText: dreamResult.analysis_text || "분석 결과가 없습니다.",
        imageUrl: dreamResult.image_url || "",
      },
    };
  }

  return <AdminOrderDetailClient orderId={orderId} initialOrder={initialOrder} />;
}
