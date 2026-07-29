/**
 * 정보통신망법 준수 - 서버사이드 보안 및 유해 콘텐츠(NSFW / 프롬프트 인젝션) 필터링 모듈
 */

// 탈옥(Jailbreak) 및 시스템 프롬프트 탈취 시도키워드 패턴
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous\s+)?instructions/i,
  /forget\s+(all\s+)?(prior\s+)?prompts/i,
  /system\s+prompt/i,
  /developer\s+mode/i,
  /dan\s+mode/i,
  /reveal\s+(your\s+)?instructions/i,
  /show\s+me\s+the\s+system\s+prompt/i,
  /시스템\s*프롬프트/i,
  /지시문(을|\s)*출력/i,
  /이전\s*지시(사항|\s)*무시/i,
  /규칙(을|\s)*무시/i,
  /모드\s*변경/i,
];

// 극단적 유해어 및 NSFW 키워드 (정제용)
const HARMFUL_KEYWORDS = [
  /자살/g,
  /살해/g,
  /테러/g,
  /마약/g,
];

/**
 * 프롬프트 인젝션 시도 여부를 탐지합니다.
 */
export function checkPromptInjection(text: string): { isInjected: boolean; reason?: string } {
  if (!text) return { isInjected: false };

  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isInjected: true,
        reason: `보안 지침 위반 (프롬프트 인젝션 패턴 감지: ${pattern.source})`,
      };
    }
  }

  return { isInjected: false };
}

/**
 * 유해어 및 NSFW 표현을 정제합니다.
 */
export function sanitizeHarmfulContent(text: string): string {
  if (!text) return "";
  let sanitized = text;

  for (const keyword of HARMFUL_KEYWORDS) {
    sanitized = sanitized.replace(keyword, "***");
  }

  return sanitized;
}

/**
 * 해몽 프롬프트 전체 검증 및 정제를 수행합니다.
 */
export function validateAndSanitizeDreamPrompt(text: string): {
  isValid: boolean;
  sanitizedText: string;
  error?: string;
} {
  const injectionCheck = checkPromptInjection(text);
  if (injectionCheck.isInjected) {
    return {
      isValid: false,
      sanitizedText: "",
      error: "악의적인 프롬프트 인젝션 시도가 탐지되어 요청이 거부되었습니다.",
    };
  }

  const sanitized = sanitizeHarmfulContent(text);
  return {
    isValid: true,
    sanitizedText: sanitized,
  };
}
