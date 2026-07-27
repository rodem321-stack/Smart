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

export type PostCategory = '질문하기' | '나만의 분리수거 팁' | '업사이클링 공유' | '자유수다';

export interface BoardPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: PostCategory;
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
