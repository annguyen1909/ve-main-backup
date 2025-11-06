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
      title: "작업 의뢰",
      subtitles: ["예산 및 일정 상담", "장면 및 구도 / 범위 상담"],
    },
    {
      title: "작업 기획",
      subtitles: ["프로젝트 컨셉 기획", "3D 작업"],
    },
    {
      title: "시안 공유 및 수정",
      subtitles: ["1차 시안 전달", "2차 시안 전달", "최종 고해상도 이미지 전달"],
    },
    {
      title: "최종 검토 및 납품",
      subtitles: ["최종 검토", "최종 결제 및 라이선스 이전"],
    },
  ],
};

export function itemsForLocale(locale: string | undefined): WorkProcessItem[] {
  if (!locale) return defaultItems;
  return localizedItems[locale] ?? defaultItems;
}