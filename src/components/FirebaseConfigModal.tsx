import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle, AlertTriangle, X, Code, ExternalLink } from 'lucide-react';
import { FirebaseWebConfig } from '../types';
import { getStoredFirebaseConfig, saveFirebaseConfig, isFirebaseConnected } from '../lib/firebase';

interface FirebaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectedStatusChange?: () => void;
}

export const FirebaseConfigModal: React.FC<FirebaseConfigModalProps> = ({
  isOpen,
  onClose,
  onConnectedStatusChange,
}) => {
  const [configText, setConfigText] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = getStoredFirebaseConfig();
      if (saved) {
        setConfigText(JSON.stringify(saved, null, 2));
      } else {
        setConfigText(
          `{\n  "apiKey": "",\n  "authDomain": "",\n  "projectId": "",\n  "storageBucket": "",\n  "messagingSenderId": "",\n  "appId": ""\n}`
        );
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    try {
      let parsedConfig: FirebaseWebConfig;

      // Check if user pasted JS const declaration e.g. const firebaseConfig = { ... };
      let textToParse = configText.trim();
      if (textToParse.includes('=')) {
        const match = textToParse.match(/\{[\s\S]*\}/);
        if (match) {
          textToParse = match[0];
        }
      }

      // Replace JS object keys without quotes if user pasted JS object
      textToParse = textToParse
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')
        .replace(/,\s*([}\]])/g, '$1');

      parsedConfig = JSON.parse(textToParse);

      if (!parsedConfig.apiKey || !parsedConfig.projectId) {
        throw new Error('apiKey와 projectId가 올바르지 않습니다.');
      }

      const success = saveFirebaseConfig(parsedConfig);
      if (success) {
        setStatusMsg({
          type: 'success',
          text: '✅ Firebase WebConfig가 저장되었습니다! Firestore와 연결되었습니다.',
        });
        if (onConnectedStatusChange) onConnectedStatusChange();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        throw new Error('Firebase 설정 저장 실패');
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        text: `❌ 올바른 firebaseConfig 형식(JSON/JS 객체)을 입력해 주세요. (${err.message})`,
      });
    }
  };

  const handleClear = () => {
    localStorage.removeItem('smart_recycling_firebase_web_config');
    setStatusMsg({ type: 'info', text: 'Firebase 설정이 초기화되었습니다.' });
    if (onConnectedStatusChange) onConnectedStatusChange();
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-950/50 dark:text-orange-400">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Firebase Config 설정</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                게시판 데이터를 Firestore에 연결합니다 (서비스 계정 키 불필요)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50">
            <div className="flex items-start gap-2.5">
              <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <p className="font-semibold">Firebase 콘솔에서 웹 설정값 가져오는 방법:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-emerald-800 dark:text-emerald-300">
                  <li>
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-medium hover:text-emerald-600 inline-flex items-center gap-1"
                    >
                      Firebase 콘솔 <ExternalLink className="h-3 w-3" />
                    </a>
                     접속 후 프로젝트 선택
                  </li>
                  <li>프로젝트 설정 ⚙️ &gt; [일반] &gt; [내 앱] 에서 웹 앱(&lt;/&gt;) 설정 확인</li>
                  <li><code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-950 dark:bg-emerald-900">const firebaseConfig = &#123; ... &#125;</code> 코드를 붙여넣기</li>
                </ol>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Firebase 웹 설정값 (firebaseConfig)</span>
              <span className="text-slate-400 font-normal">JSON 또는 JavaScript 객체</span>
            </label>
            <textarea
              rows={8}
              value={configText}
              onChange={(e) => setConfigText(e.target.value)}
              placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-project.firebaseapp.com",\n  "projectId": "my-project",\n  "storageBucket": "my-project.appspot.com",\n  "messagingSenderId": "123456789",\n  "appId": "1:123456789:web:abcdef"\n}`}
              className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200"
            />
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                  : statusMsg.type === 'error'
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
              }`}
            >
              {statusMsg.type === 'error' && <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />}
              {statusMsg.type === 'success' && <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-500 hover:text-rose-700 font-medium hover:underline"
          >
            설정 초기화
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl dark:text-slate-300 dark:hover:bg-slate-800"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              저장 및 Firestore 연결
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
