import FailClient from "./fail-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FailPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const code = typeof resolvedSearchParams?.code === "string" ? resolvedSearchParams.code : "UNKNOWN_ERROR";
  const message = typeof resolvedSearchParams?.message === "string" ? resolvedSearchParams.message : "결제 중 알 수 없는 오류가 발생했습니다.";
  const orderId = typeof resolvedSearchParams?.orderId === "string" ? resolvedSearchParams.orderId : null;

  return <FailClient code={code} message={message} orderId={orderId} />;
}

