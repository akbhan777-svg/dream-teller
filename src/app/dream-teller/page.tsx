import DreamTellerForm from "@/components/dream-teller/dream-teller-form";

export const metadata = {
  title: "나만의 꿈 해석 | Dream Teller",
  description: "프로이트부터 신경과학까지, 4가지 전문 관점으로 당신의 꿈을 분석합니다.",
};

const DreamTellerPage = () => {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden pt-24 pb-20">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-dream-purple/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-dream-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[60%] h-[20%] bg-dream-pink/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container relative z-10 px-4 md:px-6 mx-auto">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
            <span className="w-2 h-2 rounded-full bg-dream-blue animate-pulse" />
            <span className="text-sm font-medium text-slate-300">AI 심층 꿈 분석</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight leading-tight">
            당신의 무의식이 보내는<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-dream-pink via-dream-purple to-dream-blue">
              비밀스러운 메시지
            </span>
          </h1>
          <p className="text-lg text-slate-400">
            원하는 전문 관점을 선택하고 어젯밤 꿈을 이야기해주세요.<br className="hidden md:block" />
            단 3분 만에 당신만을 위한 완벽한 해석 리포트가 완성됩니다.
          </p>
        </div>

        {/* Form Component */}
        <DreamTellerForm />
      </div>
    </main>
  );
};

export default DreamTellerPage;
