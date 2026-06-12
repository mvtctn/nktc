import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager 
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Default config from environment variables
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Function to get config (env or localStorage override)
export const getFirebaseConfig = () => {
  const localConfigStr = localStorage.getItem('hydrotech_firebase_config');
  if (localConfigStr) {
    try {
      return JSON.parse(localConfigStr);
    } catch (e) {
      console.error('Lỗi phân tích cú pháp cấu hình Firebase từ localStorage', e);
    }
  }
  return envConfig;
};

// Check if we have at least apiKey and projectId to initialize
const config = getFirebaseConfig();
const isValidConfig = config.apiKey && config.projectId;

let app;
let db;
let auth;
let storage;

if (isValidConfig) {
  try {
    app = getApps().length === 0 ? initializeApp(config) : getApp();
    
    // Initialize Firestore with Persistent Offline Cache (v10+ style)
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
      experimentalAutoDetectLongPolling: true
    });
    
    auth = getAuth(app);
    storage = getStorage(app);
    
    console.log('[Firebase] Khởi tạo thành công với cấu hình:', config.projectId);
  } catch (error) {
    console.error('[Firebase] Khởi tạo thất bại:', error);
  }
} else {
  console.warn('[Firebase] Cấu hình không hợp lệ hoặc chưa được thiết lập. Vui lòng thiết lập cấu hình từ giao diện cài đặt.');
}

export { app, db, auth, storage, isValidConfig };
