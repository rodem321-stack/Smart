export interface MaterialItem {
  name: string;
  component: string;
  recyclable: boolean;
  icon: 'plastic' | 'paper' | 'vinyl' | 'metal' | 'glass' | 'styrofoam' | 'trash' | string;
}

export interface DisposalStep {
  step: number;
  title: string;
  description: string;
}

export interface RecyclingAnalysisResult {
  itemName: string;
  summary: string;
  primaryCategory: string;
  difficulty: string;
  materials: MaterialItem[];
  steps: DisposalStep[];
  precautions: string[];
  upcyclingTip?: string;
  ecoImpact?: string;
}

export type FeedbackCategory =
  | '서비스 개선 제안'
  | '분리수거 정보 오류 제보'
  | '새로운 품목 추가 요청'
  | '칭찬 및 응원'
  | '기타 의견';

export type FeedbackStatus = '검토 대기' | '검토 중' | '반영 완료';

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: FeedbackCategory | string;
  rating?: number; // 1 ~ 5 별점
  status?: FeedbackStatus;
  createdAt: any; // Firestore Timestamp or ISO string
  recyclingSummary?: string;
  likes: number;
  commentCount: number;
}

export interface FirebaseWebConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}
