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

// Default / standard sample firebase web config structure
export const defaultFirebaseConfig: FirebaseWebConfig = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;

export function getStoredFirebaseConfig(): FirebaseWebConfig | null {
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
  return null;
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
    title: '배달음식 플라스틱 용기에 고추장 양념이 착색되었을 땐 어떻게 하나요?',
    content: '배달 떡볶이나 족발 용기를 물로 깨끗이 씻어도 빨간 기름때가 안 지워져요. 이 상태로 플라스틱으로 배출해도 되나요?',
    author: '에코비기너',
    category: '질문하기',
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    recyclingSummary: '팁: 주방세제와 햇빛(유기색소 분해)을 이용하면 고추장 양념 착색이 깨끗해집니다. 심하게 오염되어 지워지지 않으면 일반쓰레기(종량제)로 배출하세요.',
    likes: 5,
    commentCount: 2,
  },
  {
    id: 'demo-2',
    title: '택배 종이상자 올바른 분리배출 꿀팁 3가지!',
    content: '1. 운송장 스티커와 비닐 테이프는 반드시 제거하기!\n2. 상자는 납작하게 접어서 배출하기\n3. 이물질이 묻은 종이는 일반쓰레기로 고고~ 작은 실천이 재활용률을 20% 올려줍니다!',
    author: '환경보호왕',
    category: '나만의 분리수거 팁',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    likes: 12,
    commentCount: 4,
  },
  {
    id: 'demo-3',
    title: '버려지는 유리잼병으로 예쁜 감성 양초 용기 만들기',
    content: '다 먹은 딸기잼 유리를 뜨거운 물로 스티커 제거하고 말린 뒤 소이왁스를 부어 홈메이드 캔들을 만들었습니다. 디저트 카페 느낌 나고 정말 만족스러워요!',
    author: '업사이클러',
    category: '업사이클링 공유',
    createdAt: new Date(Date.now() - 1000 * 60 * 600).toISOString(),
    likes: 18,
    commentCount: 7,
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
  recyclingSummary?: string;
}): Promise<BoardPost> {
  const timestamp = new Date().toISOString();

  if (dbInstance) {
    try {
      const docRef = await addDoc(collection(dbInstance, 'posts'), {
        title: postData.title,
        content: postData.content,
        author: postData.author || '익명',
        category: postData.category || '자유수다',
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
              category: data.category || '자유수다',
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
