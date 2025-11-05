export interface WorkProcessItem {
  title: string;
  subtitles: string[];
}

export const defaultItems: WorkProcessItem[] = [
  {
    title: "BUDGET CONSULATION",
    subtitles: [
      "BUDGET & SCHEDULE CONSULTATION",
      "VIEW LOCK / IMAGE RANGE CONSULTATION"
    ]
  },
  {
    title: "PLANNING & WORK",
    subtitles: [
      "3D WORK & PROJECT PLANNING START"
    ]
  },
  {
    title: "DRAFT & REVISIONS",
    subtitles: [
      "FIRST DRAFT DELIVERY",
      "SECOND DRAFT DELIVERY",
      "FINAL IMAGE HIGH RESOLUTION"
    ]
  },
  {
    title: "FINAL INSPECTION",
    subtitles: [
      "CONTRACT TERMINATION",
      "VIEW LOCK / IMAGE RANGE CONSULTATION",
      "FINAL PAYMENT TRANSFER / LICENSE TRANSFER"
    ]
  }
];

// Localized variants for quick fallback when translations aren't provided by i18n.
export const localizedItems: Record<string, WorkProcessItem[]> = {
  ko: [
    {
      title: "예산 상담",
      subtitles: ["예산 및 일정 상담", "계약서 서명 및 결제"],
    },
    {
      title: "기획 및 작업",
      subtitles: ["3D 작업 및 프로젝트 계획 시작"],
    },
    {
      title: "초안 및 수정",
      subtitles: ["첫 번째 초안 전달", "두 번째 초안 전달", "최종 고해상도 이미지 전달"],
    },
    {
      title: "최종 검수",
      subtitles: ["계약 종료", "뷰락 / 이미지 범위 상담", "최종 결제 송금 / 라이선스 이전"],
    },
  ],
};

export function itemsForLocale(locale: string | undefined): WorkProcessItem[] {
  if (!locale) return defaultItems;
  return localizedItems[locale] ?? defaultItems;
}