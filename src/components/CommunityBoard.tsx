import React, { useState, useEffect } from 'react';
import {
  MessageSquareHeart,
  Send,
  Flame,
  ThumbsUp,
  Search,
  Sparkles,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  Star,
  CheckCircle,
  Clock3,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { BoardPost, FeedbackCategory, FeedbackStatus, RecyclingAnalysisResult } from '../types';
import {
  addPostToFirestore,
  subscribeToFirestorePosts,
  likePost,
  isFirebaseConnected,
} from '../lib/firebase';

interface CommunityBoardProps {
  sharedAnalysis?: RecyclingAnalysisResult | null;
  onOpenFirebaseModal: () => void;
}

const CATEGORIES: FeedbackCategory[] = [
  '서비스 개선 제안',
  '분리수거 정보 오류 제보',
  '새로운 품목 추가 요청',
  '칭찬 및 응원',
  '기타 의견',
];

export const CommunityBoard: React.FC<CommunityBoardProps> = ({
  sharedAnalysis,
  onOpenFirebaseModal,
}) => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // New post form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('지구지키미');
  const [category, setCategory] = useState<FeedbackCategory>('서비스 개선 제안');
  const [rating, setRating] = useState<number>(5);
  const [attachedSummary, setAttachedSummary] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);

  const connected = isFirebaseConnected();

  // Attach shared analysis if passed from analyzer tab
  useEffect(() => {
    if (sharedAnalysis) {
      setTitle(`[피드백 제안] ${sharedAnalysis.itemName} AI 분리수거 분석 결과 관련 의견`);
      setAttachedSummary(`[AI 분석 결과 요약]
- 품목: ${sharedAnalysis.itemName} (${sharedAnalysis.primaryCategory})
- 핵심 요약: ${sharedAnalysis.summary}
- 난이도: ${sharedAnalysis.difficulty}`);
      setContent(`AI 분석 결과 가이드를 이용하고 아래 의견을 공유합니다.\n\n`);
    }
  }, [sharedAnalysis]);

  // Subscribe to Firestore posts ordered by createdAt desc (최신순)
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToFirestorePosts(
      (updatedPosts) => {
        setPosts(updatedPosts);
        setIsLoading(false);
      },
      (err) => {
        console.warn('Subscription error', err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    setSubmitSuccessMsg(null);

    try {
      await addPostToFirestore({
        title: title.trim(),
        content: content.trim(),
        author: author.trim() || '익명 피드백 작성자',
        category,
        rating,
        recyclingSummary: attachedSummary || undefined,
      });

      setTitle('');
      setContent('');
      setAttachedSummary(null);
      setRating(5);
      setSubmitSuccessMsg('✨ 소중한 사용자 의견이 Firebase Firestore에 정상 등록되었습니다!');
      setTimeout(() => setSubmitSuccessMsg(null), 3500);
    } catch (err: any) {
      alert('의견 등록 중 오류가 발생했습니다: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  const formatRelativeTime = (dateStr: string) => {
    if (!dateStr) return '방금 전';
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return '방금 전';
    const diff = Math.floor((Date.now() - time) / 1000);

    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  const getStatusBadge = (status?: FeedbackStatus) => {
    switch (status) {
      case '반영 완료':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" /> 반영 완료
          </span>
        );
      case '검토 중':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950 dark:text-blue-300">
            <Clock3 className="h-3 w-3" /> 검토 중
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950 dark:text-amber-300">
            <HelpCircle className="h-3 w-3" /> 검토 대기
          </span>
        );
    }
  };

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    const matchesCategory = selectedCategory === '전체' || p.category === selectedCategory;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Firebase Status Alert Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Flame className="h-5 w-5 fill-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold">Firebase Firestore 사용자 피드백 연동</h3>
              {connected ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="h-3 w-3" /> 연동됨 (smart-aa748)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <AlertCircle className="h-3 w-3" /> Config 설정 필요
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              사용자분들의 소중한 의견이 Firestore 데이터베이스에 실시간으로 등록 및 저장됩니다.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenFirebaseModal}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 active:scale-95 text-white transition-all shadow-md shrink-0"
        >
          {connected ? '⚙️ Firebase Config 정보' : '🔥 Firebase WebConfig 붙여넣기'}
        </button>
      </div>

      {/* Feedback Submission Writer Form */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xs border border-slate-200/80 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
          <MessageSquareHeart className="h-5 w-5 text-emerald-600" />
          사용자 의견 및 피드백 보내기
        </h2>

        {attachedSummary && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900 text-xs">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> 첨부된 AI 분리수거 분석 가이드
              </span>
              <button
                type="button"
                onClick={() => setAttachedSummary(null)}
                className="text-[11px] text-rose-500 hover:underline"
              >
                첨부 취소
              </button>
            </div>
            <pre className="font-sans whitespace-pre-wrap text-[11px] text-emerald-800 dark:text-emerald-200 bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
              {attachedSummary}
            </pre>
          </div>
        )}

        <form onSubmit={handleSubmitPost} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                의견 카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FeedbackCategory)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-medium focus:bg-white focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                작성자 닉네임
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="닉네임 입력"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-medium focus:bg-white focus:border-emerald-500"
              />
            </div>

            {/* Rating Selector */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                서비스 사용 만족도
              </label>
              <div className="flex items-center gap-1 p-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-5 w-5 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-500 ml-1">{rating}점</span>
              </div>
            </div>

            <div className="sm:col-span-12">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                의견 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 입력해 주세요 (예: 추가되었으면 하는 기능, 정보 오류 관련 내용...)"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs font-medium focus:bg-white focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              상세 의견 및 건의 내용
            </label>
            <textarea
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="스마트 분리수거 서비스 이용 중 불편하셨던 점, 추가되었으면 하는 기능, 응원의 한마디를 자유롭게 적어주세요!"
              className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 text-xs sm:text-sm focus:bg-white focus:border-emerald-500"
            />
          </div>

          {submitSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5"
            >
              <Send className="h-4 w-4" />
              <span>{isSubmitting ? 'Firestore 저장 중...' : '피드백 전달하기'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Board List Controls (Category filter & Search) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
            {['전체', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="의견 검색..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-xs focus:border-emerald-500"
            />
          </div>
        </div>

        {/* List Header */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>총 <strong>{filteredPosts.length}</strong>개의 등록된 사용자 의견 (최신순)</span>
        </div>

        {/* Posts List */}
        {isLoading ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <div className="inline-block animate-spin h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-slate-500">Firestore에서 사용자 피드백을 불러오는 중...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
            <MessageSquareHeart className="h-10 w-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              등록된 피드백 의견이 없습니다.
            </p>
            <p className="text-[11px] text-slate-400 mt-1">첫 번째 사용자 의견을 자유롭게 작성해 보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-200 transition-all shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900">
                      {post.category}
                    </span>
                    {getStatusBadge(post.status)}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Rating display */}
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= (post.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-800'
                          }`}
                        />
                      ))}
                    </div>

                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <User className="h-3 w-3" /> {post.author}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {formatRelativeTime(post.createdAt)}
                    </span>
                  </div>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {post.title}
                </h3>

                {post.recyclingSummary && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 dark:bg-slate-800/60 dark:border-slate-700/60 text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                    {post.recyclingSummary}
                  </div>
                )}

                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => handleLike(post.id)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-semibold"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    <span>공감해요 {post.likes}</span>
                  </button>

                  <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>댓글 {post.commentCount}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
