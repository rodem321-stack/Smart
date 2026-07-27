import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { AiRecyclingAnalyzer } from './components/AiRecyclingAnalyzer';
import { CommunityBoard } from './components/CommunityBoard';
import { CategoryGuide } from './components/CategoryGuide';
import { FirebaseConfigModal } from './components/FirebaseConfigModal';
import { RecyclingAnalysisResult } from './types';
import { Leaf, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'analyzer' | 'board' | 'guide'>('analyzer');
  const [sharedAnalysis, setSharedAnalysis] = useState<RecyclingAnalysisResult | null>(null);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);

  const handleShareToBoard = (result: RecyclingAnalysisResult) => {
    setSharedAnalysis(result);
    setActiveTab('board');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7F5] text-slate-800 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'analyzer' && (
          <AiRecyclingAnalyzer onShareToBoard={handleShareToBoard} />
        )}

        {activeTab === 'board' && (
          <CommunityBoard
            sharedAnalysis={sharedAnalysis}
            onOpenFirebaseModal={() => setIsFirebaseModalOpen(true)}
          />
        )}

        {activeTab === 'guide' && <CategoryGuide />}
      </main>

      {/* Firebase Config Modal */}
      <FirebaseConfigModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-200">
            <Leaf className="h-4 w-4 text-emerald-600" />
            <span>스마트 분리수거 도우미 &bull; Smart Recycling Helper</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Gemini AI &amp; Firebase Firestore 기반 올바른 분리배출 자원순환 프로젝트
          </p>
        </div>
      </footer>
    </div>
  );
}
