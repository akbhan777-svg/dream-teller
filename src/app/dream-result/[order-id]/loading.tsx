import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function DreamResultLoading() {
  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto py-8">
      {/* 1. 결과 요약 섹션 스켈레톤 */}
      <Card className="border-dream-purple/20 bg-background/50 backdrop-blur-sm shadow-xl">
        <CardHeader className="text-center pb-2">
          <Skeleton className="h-6 w-32 mx-auto mb-2" />
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <div className="flex items-center justify-center gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mt-8 flex justify-center">
            <div className="relative">
              <Skeleton className="w-full max-w-sm aspect-[4/3] rounded-xl" />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 rounded-xl gap-3">
                <Loader2 className="w-10 h-10 text-dream-purple animate-spin" />
                <span className="text-sm font-medium text-slate-400">꿈을 해석하고 있습니다...</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. 상세 해석 섹션 스켈레톤 */}
      <Card className="border-border/50 bg-background/50">
        <CardHeader>
          <Skeleton className="h-7 w-48 mb-2" />
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-10/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-9/12" />
        </CardContent>
      </Card>
      
      {/* 3. 하단 액션 버튼 스켈레톤 */}
      <div className="flex justify-center gap-4 pt-4">
        <Skeleton className="h-12 w-36 rounded-xl" />
        <Skeleton className="h-12 w-36 rounded-xl" />
      </div>
    </div>
  );
}
