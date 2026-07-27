import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  Firestore,
} from 'firebase/firestore';
import { BoardPost, FirebaseWebConfig } from '../types';

const CONFIG_STORAGE_KEY = 'smart_recycling_firebase_web_config';

// Default firebase web config provided by user
export const defaultFirebaseConfig: FirebaseWebConfig = {
  apiKey: "AIzaSyBKvlEEr76xTwoGcsCMjcWHGCcPRb6bddc",
  authDomain: "smart-aa748.firebaseapp.com",
  projectId: "smart-aa748",
  storageBucket: "smart-aa748.firebasestorage.app",
  messagingSenderId: "273081950031",
  appId: "1:273081950031:web:368daf10220bea1aec6f3a",
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function getStoredFirebaseConfig(): FirebaseWebConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse saved firebase config', e);
  }
  return defaultFirebaseConfig;
}

export function saveFirebaseConfig(config: FirebaseWebConfig): boolean {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    // Re-initialize
    initFirebase(config);
    return true;
  } catch (e) {
    console.error('Failed to save firebase config', e);
    return false;
  }
}

export function initFirebase(config?: FirebaseWebConfig | null): { app: FirebaseApp | null; db: Firestore | null } {
  const cfg = config || getStoredFirebaseConfig();
  if (!cfg || !cfg.apiKey || !cfg.projectId) {
    dbInstance = null;
    appInstance = null;
    return { app: null, db: null };
  }

  try {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(cfg);
    }
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, db: dbInstance };
  } catch (err) {
    console.error('Firebase initialization error:', err);
    dbInstance = null;
    appInstance = null;
    return { app: null, db: null };
  }
}

// Initial boot check
initFirebase();

export function isFirebaseConnected(): boolean {
  return dbInstance !== null;
}

// Local mock storage key for fallback when firebaseConfig is not set yet
const LOCAL_POSTS_KEY = 'smart_recycling_local_posts';

const initialMockPosts: BoardPost[] = [
  {
    id: 'demo-1',
    title: '아이스팩 버리는 방법 AI 가이드 안내가 명확해서 아주 좋습니다!',
    content: '젤 타입 아이스팩 배출 방법이 헷갈렸는데 종량제 봉투 배출 지침을 명확히 알려주어서 유용했습니다.',
    author: '환경사랑러',
    category: '칭찬 및 응원',
    rating: 5,
    status: '반영 완료',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    recyclingSummary: '[AI 분석 결과] 젤 형태 아이스팩: 통째로 종량제(일반쓰레기) 배출',
    likes: 8,
    commentCount: 2,
  },
  {
    id: 'demo-2',
    title: '배달 용기 오염 비닐류 추가 세척 팁에 대한 의견 제안',
    content: '고추장 양념이 착색된 스티로폼 용기 검색 시 햇빛 건조 세척 팁도 같이 안내되면 더욱 완성도가 높아질 것 같아요!',
    author: '에코노매드',
    category: '서비스 개선 제안',
    rating: 4,
    status: '검토 중',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    likes: 12,
    commentCount: 4,
  },
  {
    id: 'demo-3',
    title: '신규 폐기물(소형 전자제품/배터리) 카테고리 추가 요청',
    content: '보조배터리나 충전용 케이블선 수거함 위치나 분리수거 지침도 검색 결과에 나올 수 있게 업데이트 요청드립니다.',
    author: '그린라이프',
    category: '새로운 품목 추가 요청',
    rating: 5,
    status: '검토 대기',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    likes: 15,
    commentCount: 3,
  },
];

function getLocalPosts(): BoardPost[] {
  try {
    const raw = localStorage.getItem(LOCAL_POSTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load local posts', e);
  }
  return initialMockPosts;
}

function saveLocalPosts(posts: BoardPost[]) {
  try {
    localStorage.setItem(LOCAL_POSTS_KEY, JSON.stringify(posts));
  } catch (e) {
    console.warn('Failed to save local posts', e);
  }
}

// Add post function (Saves to Firestore if connected, otherwise local storage)
export async function addPostToFirestore(postData: {
  title: string;
  content: string;
  author: string;
  category: string;
  rating?: number;
  recyclingSummary?: string;
}): Promise<BoardPost> {
  const timestamp = new Date().toISOString();

  if (dbInstance) {
    try {
      const docRef = await addDoc(collection(dbInstance, 'posts'), {
        title: postData.title,
        content: postData.content,
        author: postData.author || '익명',
        category: postData.category || '기타 의견',
        rating: postData.rating || 5,
        status: '검토 대기',
        recyclingSummary: postData.recyclingSummary || null,
        createdAt: serverTimestamp(),
        likes: 0,
        commentCount: 0,
      });

      return {
        id: docRef.id,
        title: postData.title,
        content: postData.content,
        author: postData.author || '익명',
        category: postData.category as any,
        rating: postData.rating || 5,
        status: '검토 대기',
        recyclingSummary: postData.recyclingSummary,
        createdAt: timestamp,
        likes: 0,
        commentCount: 0,
      };
    } catch (err) {
      console.error('Firestore 저장 오류:', err);
      // Fallback to local
    }
  }

  // Local fallback
  const localPosts = getLocalPosts();
  const newPost: BoardPost = {
    id: 'local-' + Date.now(),
    title: postData.title,
    content: postData.content,
    author: postData.author || '익명',
    category: postData.category as any,
    rating: postData.rating || 5,
    status: '검토 대기',
    recyclingSummary: postData.recyclingSummary,
    createdAt: timestamp,
    likes: 0,
    commentCount: 0,
  };
  const updated = [newPost, ...localPosts];
  saveLocalPosts(updated);
  return newPost;
}

// Subscribe/Fetch posts from Firestore ordered by createdAt desc (최신순)
export function subscribeToFirestorePosts(
  onUpdate: (posts: BoardPost[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (dbInstance) {
    try {
      const postsQuery = query(collection(dbInstance, 'posts'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(
        postsQuery,
        (snapshot) => {
          const list: BoardPost[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            let createdTime = new Date().toISOString();
            if (data.createdAt && typeof data.createdAt.toDate === 'function') {
              createdTime = data.createdAt.toDate().toISOString();
            } else if (typeof data.createdAt === 'string') {
              createdTime = data.createdAt;
            }

            list.push({
              id: docSnap.id,
              title: data.title || '',
              content: data.content || '',
              author: data.author || '익명',
              category: data.category || '기타 의견',
              rating: data.rating || 5,
              status: data.status || '검토 대기',
              createdAt: createdTime,
              recyclingSummary: data.recyclingSummary || undefined,
              likes: data.likes || 0,
              commentCount: data.commentCount || 0,
            });
          });

          // Ensure latest sorted if timestamp resolution differs
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

          onUpdate(list);
        },
        (err) => {
          console.warn('Firestore onSnapshot error, falling back to local posts:', err);
          if (onError) onError(err);
          onUpdate(getLocalPosts());
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscription failed, returning local posts:', err);
    }
  }

  // Fallback if not connected
  onUpdate(getLocalPosts());
  return () => {};
}

// Like post
export async function likePost(postId: string): Promise<void> {
  if (dbInstance && !postId.startsWith('local-') && !postId.startsWith('demo-')) {
    try {
      const postRef = doc(dbInstance, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1),
      });
      return;
    } catch (e) {
      console.warn('Failed to like post in Firestore:', e);
    }
  }

  // Local fallback
  const posts = getLocalPosts();
  const updated = posts.map((p) => (p.id === postId ? { ...p, likes: p.likes + 1 } : p));
  saveLocalPosts(updated);
}
