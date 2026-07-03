export type TenglvCardSection = "年卡权益" | "增值福利";

export type TenglvCardEnvironment = "indoor" | "outdoor" | "mixed" | "unknown";

export type TenglvCardClassificationStatus =
  | "inferred"
  | "unknown"
  | "confirmed";

export type TenglvCardUsageLimit = number | "不限" | "待确认" | "共享6次";

export interface TenglvCardItem {
  id: string;
  name: string;
  region: string;
  section: TenglvCardSection;
  websiteUrl?: string | null;
  marketPrice: number | null;
  rating: string | null;
  benefitText: string;
  usageLimit: TenglvCardUsageLimit;
  visitCount: number;
  environment: TenglvCardEnvironment;
  tags: string[];
  classificationStatus: TenglvCardClassificationStatus;
}

export interface TenglvCardData {
  cardId: "wuhan-tenglv-card";
  name: string;
  sourceDate: string;
  miniProgramShortLink?: string | null;
  miniProgramUrlLink?: string | null;
  items: TenglvCardItem[];
}
