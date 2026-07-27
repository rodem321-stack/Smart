import React from 'react';
import { Recycle, Sparkles, MessageSquareText, BookOpen, Flame, CheckCircle2 } from 'lucide-react';
import { isFirebaseConnected } from '../lib/firebase';

interface NavbarProps {
  activeTab: 'analyzer' | 'board' | 'guide';
  setActiveTab: (tab: 'analyzer' | 'board' | 'guide') => void;
  onOpenFirebaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenFirebaseModal,
}) => {
  const connected = isFirebaseConnected();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs dark:bg-slate-900/95 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div
          onClick={() => setActiveTab('analyzer')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Recycle className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-slate-800 tracking-tight dark:text-white">
                Smart Recycling AI
              </span>
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-2.5 w-2.5" /> 도우미
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden md:flex items-center p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 dark:bg-slate-800 dark:border-slate-700/60">
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'analyzer'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            AI 분석기
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'board'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <MessageSquareText className="h-3.5 w-3.5" />
            사용자 의견 게시판
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guide'
                ? 'bg-white text-emerald-600 shadow-xs dark:bg-slate-900 dark:text-emerald-400'
                : 'text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            분리배출 가이드북
          </button>
        </nav>

        {/* Firebase Config Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenFirebaseModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              connected
                ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 dark:bg-orange-950/40 dark:border-orange-900 dark:text-orange-300'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
            title="Firebase Firestore 설정"
          >
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
            <span className="hidden sm:inline">
              {connected ? 'Firestore 연결됨' : 'Firebase 설정'}
            </span>
            {connected && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
          </button>
        </div>
      </div>

      {/* Mobile Tab Navigation Bar */}
      <div className="flex md:hidden border-t border-slate-100 bg-slate-50/80 px-2 py-1.5 dark:bg-slate-900 dark:border-slate-800 justify-around">
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
            activeTab === 'analyzer'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> AI 가이드
        </button>
        <button
          onClick={() => setActiveTab('board')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
            activeTab === 'board'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <MessageSquareText className="h-3.5 w-3.5" /> 게시판
        </button>
        <button
          onClick={() => setActiveTab('guide')}
          className={`flex-1 py-1.5 px-2 text-center text-xs font-bold rounded-lg flex items-center justify-center gap-1 ${
            activeTab === 'guide'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" /> 품목별 요령
        </button>
      </div>
    </header>
  );
};
