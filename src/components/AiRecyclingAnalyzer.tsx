import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Trash2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Share2,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  ShieldAlert,
  Leaf,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { RecyclingAnalysisResult } from '../types';

interface AiRecyclingAnalyzerProps {
  onShareToBoard: (result: RecyclingAnalysisResult) => void;
}

const QUICK_SAMPLES = [
  { label: '🥤 아이스 아메리카노 컵 세트', query: '투명 플라스틱 컵, 빨대, 컵홀더, 뚜껑' },
  { label: '🍱 배달용기 & 비닐 포장', query: '플라스틱 배달 용기, 양념 묻은 비닐 덮개, 나무젓가락' },
  { label: '📦 택배 상자', query: '종이 택배 박스, 비닐 테이프, 송장 스티커' },
  { label: '🍾 유리 음료수 병', query: '유리병 본체, 금속 뚜껑, 라벨 비닐' },
  { label: '🍜 컵라면 용기', query: '양념 때 묻은 스티로폼 라면 용기, 비닐 뚜껑' },
  { label: '🧴 세제 용기', query: '플라스틱 본체, 압축 펌프 스프레이, 비닐 라벨' },
];

export const AiRecyclingAnalyzer: React.FC<AiRecyclingAnalyzerProps> = ({ onShareToBoard }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMime, setImageMime] = useState<string>('image/jpeg');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<RecyclingAnalysisResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg('이미지 파일 크기는 8MB 이하로 업로드해 주세요.');
        return;
      }
      setImageMime(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedImage) {
      setErrorMsg('분석할 쓰레기 사진을 업로드하거나 쓰레기 이름을 입력해 주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/generate.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: inputText.trim(),
          image: selectedImage,
          mimeType: imageMime,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `분석 중 오류가 발생했습니다. (상태 코드: ${response.status})`);
      }

      const data: RecyclingAnalysisResult = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMsg(err.message || 'AI 서버 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    if (category.includes('플라스틱')) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    if (category.includes('종이')) return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300';
    if (category.includes('비닐')) return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
    if (category.includes('캔') || category.includes('금속')) return 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-200';
    if (category.includes('유리')) return 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300';
    if (category.includes('일반쓰레기')) return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300';
    return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            Gemini AI 기반 초정밀 쓰레기 재질 분석
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            어떻게 버려야 할지 헷갈리는 쓰레기, <br />
            사진이나 이름만 넣으세요!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100 leading-relaxed">
            두 가지 이상 물질이 결합된 복합 쓰레기도 AI가 각 부위별 주요 재질을 파악해 올바른 배출 방법과 순서를 알려드립니다.
          </p>
        </div>
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none">
          <Leaf className="w-72 h-72" />
        </div>
      </div>

      {/* Main Input Form Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-100 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <Layers className="h-5 w-5 text-emerald-600" />
          쓰레기 사진 업로드 &amp; 내용 입력
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Image Upload Area */}
          <div className="md:col-span-5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              📸 사진 첨부 (선택)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="h-48 sm:h-56 rounded-2xl border-2 border-dashed border-emerald-200 dark:border-slate-700 bg-emerald-50/40 dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors flex flex-col items-center justify-center p-4 cursor-pointer text-center group"
              >
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                  쓰레기 사진 올리기 또는 드래그
                </p>
                <p className="text-[11px] text-slate-400 mt-1">카메라 촬영 / 갤러리 이미지 선택</p>
              </div>
            ) : (
              <div className="relative h-48 sm:h-56 rounded-2xl overflow-hidden border border-emerald-200 dark:border-slate-700 bg-slate-900 group">
                <img
                  src={selectedImage}
                  alt="업로드된 쓰레기 사진"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-full shadow-lg hover:bg-rose-700 transition-colors"
                  title="사진 삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2.5 py-1 rounded-full backdrop-blur-xs">
                  사진 첨부됨
                </div>
              </div>
            )}
          </div>

          {/* Text Input & Quick Examples */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                ✍️ 쓰레기 이름 또는 특징 상세 입력
              </label>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="예: 두 가지 이상 물질이 들어간 포장재, 고추장 묻은 비닐, 유리병과 금속 뚜껑, 아이스 아메리카노 컵..."
                className="w-full p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500" /> 자주 묻는 복합 쓰레기 예시 (클릭):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SAMPLES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputText(sample.query);
                      setErrorMsg(null);
                    }}
                    className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200/80 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 transition-all"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:pointer-events-none transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Gemini AI가 재질 및 분리수거 지침을 분석 중입니다...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-amber-300" />
                <span>AI 분리수거 가이드 분석하기</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Bento Grid Section */}
      {analysisResult && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              Gemini AI 분석 결과 (Bento Grid)
            </h3>
            <button
              type="button"
              onClick={() => onShareToBoard(analysisResult)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-700 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-emerald-400 text-xs font-bold transition-all shadow-2xs"
            >
              <Share2 className="h-3.5 w-3.5" />
              게시판에 이 가이드 공유하기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Bento Card 1: Main Classification Header (Span 12) */}
            <div className="md:col-span-12 bg-emerald-600 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between text-white shadow-md gap-4 relative overflow-hidden">
              <div className="relative z-10 space-y-1">
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest">
                  IDENTIFICATION RESULT &bull; {analysisResult.difficulty} 난이도
                </p>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {analysisResult.itemName}
                </h2>
              </div>
              <div className="relative z-10 px-4 py-2 bg-white/20 backdrop-blur-md rounded-2xl text-xs sm:text-sm font-bold border border-white/30 text-white shrink-0">
                {analysisResult.primaryCategory}
              </div>
              <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
                <Leaf className="w-56 h-56" />
              </div>
            </div>

            {/* Bento Card 2: Quick Mandatory Summary (Span 6) */}
            <div className="md:col-span-6 bg-emerald-50/90 dark:bg-emerald-950/40 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/60 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl shadow-2xs flex items-center justify-center mb-3 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <h4 className="text-emerald-950 dark:text-emerald-200 font-bold text-base sm:text-lg leading-tight mb-2">
                  핵심 분리배출 요약
                </h4>
                <p className="text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>
            </div>

            {/* Bento Card 3: Material Content Breakdown (Span 6) */}
            <div className="md:col-span-6 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-emerald-500" /> Material Breakdown (구성 재질)
              </h3>
              <div className="space-y-3">
                {analysisResult.materials.map((mat, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-200">
                        {mat.component} ({mat.name})
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-bold ${
                          mat.recyclable
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {mat.recyclable ? '재활용 가능' : '종량제 배출'}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          mat.recyclable ? 'bg-emerald-500' : 'bg-rose-400'
                        }`}
                        style={{ width: `${Math.max(35, 100 - idx * 20)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Card 4: Step-by-Step Disposal Guide (Span 7) */}
            <div className="md:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Step-by-Step Disposal (단계별 배출 가이드)
              </h3>
              <div className="space-y-3.5">
                {analysisResult.steps.map((stepItem) => (
                  <div key={stepItem.step} className="flex gap-3.5 items-start">
                    <div className="w-6 h-6 bg-slate-800 dark:bg-slate-100 dark:text-slate-900 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {stepItem.step}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {stepItem.title}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {stepItem.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bento Card 5 & 6 Stacked Column (Span 5) */}
            <div className="md:col-span-5 flex flex-col gap-5">
              {/* Environmental Impact Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between flex-1">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Leaf className="h-3.5 w-3.5 text-emerald-500" /> Environmental Impact
                  </h3>
                  <div className="flex items-end gap-2 my-2">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white">
                      -45g
                    </span>
                    <span className="text-xs text-slate-400 pb-1">탄소배출 절감 예상</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {analysisResult.ecoImpact || '올바른 분리배출을 통해 귀중한 자원이 재활용됩니다.'}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-emerald-100 dark:bg-emerald-950 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold uppercase">Positive Contribution</span>
                </div>
              </div>

              {/* Indigo Pro Tip / Upcycling Card */}
              <div className="bg-indigo-600 rounded-3xl p-6 text-white flex flex-col justify-center overflow-hidden relative shadow-md">
                <div className="relative z-10 space-y-1">
                  <p className="text-xs font-bold text-indigo-200 uppercase tracking-wider">
                    PRO TIP &amp; 업사이클링
                  </p>
                  <p className="text-xs sm:text-sm font-medium leading-relaxed text-indigo-50">
                    {analysisResult.upcyclingTip || '다회용 용기를 활용하여 일회용 폐기물을 근본적으로 줄여보세요!'}
                  </p>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 pointer-events-none">
                  <Lightbulb className="w-24 h-24" />
                </div>
              </div>
            </div>

            {/* Precautions Card (Span 12) */}
            {analysisResult.precautions && analysisResult.precautions.length > 0 && (
              <div className="md:col-span-12 bg-amber-50/90 dark:bg-amber-950/30 rounded-3xl p-6 border border-amber-200/80 dark:border-amber-900/50">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600" /> 주의사항 &amp; 필수 체크
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs text-amber-900 dark:text-amber-300">
                  {analysisResult.precautions.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
