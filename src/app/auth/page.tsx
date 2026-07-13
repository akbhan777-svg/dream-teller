import { Metadata } from "next";
import AuthClientPage from "./auth-client-page";

export const metadata: Metadata = {
  title: "로그인 | Dream Teller",
  description: "구글 또는 카카오 계정으로 간편하게 로그인하고 꿈 해몽 서비스를 만나보세요.",
};

export default function AuthPage() {
  return <AuthClientPage />;
}
