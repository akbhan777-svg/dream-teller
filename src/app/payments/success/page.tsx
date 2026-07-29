import SuccessClient from "./success-client";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SuccessPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const paymentKey = typeof resolvedSearchParams?.paymentKey === "string" ? resolvedSearchParams.paymentKey : null;
  const orderId = typeof resolvedSearchParams?.orderId === "string" ? resolvedSearchParams.orderId : null;
  const amount = typeof resolvedSearchParams?.amount === "string" ? resolvedSearchParams.amount : null;

  return <SuccessClient paymentKey={paymentKey} orderId={orderId} amount={amount} />;
}

