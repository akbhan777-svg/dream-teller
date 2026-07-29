import { cache } from "react";
import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { fetchOrderAndResultBypass } from "@/app/actions/order-action";
import DreamResultClient from "./dream-result-client";

// cache() to deduplicate data fetching between generateMetadata and the page
const getOrderData = cache(async (orderId: string, userId?: string) => {
  return await fetchOrderAndResultBypass(orderId, userId);
});

export async function generateMetadata({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ "order-id": string }>, 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedParams["order-id"];
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const user = authData?.user || null;

  const unauthorizedQuery = resolvedSearchParams?.unauthorized === "true";
  if (unauthorizedQuery) {
    return { title: "Dream Teller - 권한 없음" };
  }

  try {
    const { order } = await getOrderData(orderId, user?.id);
    if (!order) return { title: "Dream Teller - 찾을 수 없는 리포트" };

    const resultObj = Array.isArray(order.dream_results) ? order.dream_results[0] : order.dream_results;
    
    if (resultObj && resultObj.analysis_status === "completed" && resultObj.is_public) {
      const expertNameMap: Record<string, string> = {
        freud: "프로이트",
        jung: "칼 융",
        neuroscience: "신경과학",
        gestalt: "게슈탈트"
      };
      const expertName = expertNameMap[order.expert_field] || "전문가";
      const title = resultObj.analysis_title || `${expertName} 관점 무의식 심층 해몽`;
      const description = order.dream_content ? order.dream_content.substring(0, 80) + "..." : "나의 꿈 해몽 리포트";
      
      return {
        title: title + " | Dream Teller",
        description,
        openGraph: {
          title,
          description,
          images: resultObj.image_url ? [resultObj.image_url] : [],
        },
      };
    }
  } catch (e) {
    console.error(e);
  }

  return { title: "Dream Teller - 해몽 결과" };
}

export default async function DreamResultPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ "order-id": string }>, 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const orderId = resolvedParams["order-id"];
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }));
  const user = authData?.user || null;

  let initialOrderData = null;
  let initialResultData = null;
  let initialIsForbidden = false;

  const unauthorizedQuery = resolvedSearchParams?.unauthorized === "true";

  if (unauthorizedQuery) {
    initialIsForbidden = true;
  } else {
    try {
      const { order, error } = await getOrderData(orderId, user?.id);
      if (!order) {
        initialIsForbidden = true;
      } else {
        initialOrderData = order;
        initialResultData = Array.isArray(order.dream_results) ? order.dream_results[0] : order.dream_results;
      }
    } catch (e) {
      console.error("Server fetch error:", e);
      initialIsForbidden = true;
    }
  }

  return (
    <DreamResultClient 
      orderId={orderId}
      initialOrderData={initialOrderData}
      initialResultData={initialResultData}
      initialIsForbidden={initialIsForbidden}
      unauthorizedQuery={unauthorizedQuery}
    />
  );
}

