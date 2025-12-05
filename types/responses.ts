import { IntelligenceTier } from './game';

export interface ResponseTemplate {
  tier: IntelligenceTier;
  keywords: string[];
  responses: string[];
}

export interface KeywordMatch {
  keyword: string;
  priority: number;
}

export interface KeywordCategory {
  name: string;
  keywords: string[];
  priority: number;
}
