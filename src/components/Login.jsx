import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, isValidConfig } from '../firebase';
import { LogIn, Key, WifiOff, Settings } from 'lucide-react';

export default function Login({ onLoginSuccess, onOpenConfig }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValidConfig) {
      setError('Firebase chưa được cấu hình. Vui lòng chuyển sang Chế độ Ngoại tuyến hoặc thiết lập cấu hình.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      console.error(err);
      let errMsg = `Đăng nhập/Đăng ký thất bại: ${err.message} (${err.code})`;
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        errMsg = 'Email này đã được sử dụng.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Mật khẩu phải chứa ít nhất 6 ký tự.';
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = 'Phương thức đăng ký Email/Mật khẩu chưa được bật trên Firebase Console. Vui lòng truy cập Firebase Console > Authentication > Sign-in method và BẬT Email/Password.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Địa chỉ email không đúng định dạng.';
      } else {
        errMsg = `Lỗi hệ thống (${err.code}): ${err.message}`;
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleOfflineMode = () => {
    // Log in as dummy local user
    onLoginSuccess({
      uid: 'offline_local_user',
      email: 'offline@hydrotech.vn',
      displayName: 'Kỹ sư Ngoại tuyến'
    });
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo-container">
          <svg className="auth-logo" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoG" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#0072ff" />
              </linearGradient>
            </defs>
            <circle cx="256" cy="256" r="230" stroke="url(#logoG)" strokeWidth="16" opacity="0.3" />
            <path d="M256,120 C256,120 330,220 330,280 A74,74 0 1,1 182,280 C182,220 256,120 256,120 Z" fill="url(#logoG)" />
          </svg>
        </div>
        
        <h1 className="auth-title">HYDROTECH</h1>
        <p className="auth-subtitle">Hệ thống Trợ lý Nhật ký thi công & Biên bản hiện trường</p>

        {error && <div className="toast toast-error" style={{ position: 'relative', bottom: '0', right: '0', marginBottom: '20px', width: '100%' }}>{error}</div>}

        {isValidConfig ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ color: 'white' }}>Email kỹ sư</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@hydrotech.vn"
                value={email}
                onChange={(e) => setEmail(e.value || e.target.value)}
                required
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label" style={{ color: 'white' }}>Mật khẩu</label>
              <input
                type="password"
                className="form-control"
                placeholder="******"
                value={password}
                onChange={(e) => setPassword(e.value || e.target.value)}
                required
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.15)' }}
              />
            </div>

            <button type="submit" className="btn btn-accent btn-block" disabled={loading}>
              {loading ? <div className="spinner"></div> : 'Đăng nhập hệ thống'}
            </button>
          </form>
        ) : (
          <div style={{ padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', marginBottom: '24px', fontSize: '0.875rem', textAlign: 'left', lineHeight: '1.4' }}>
            <strong style={{ color: '#ef4444', display: 'block', marginBottom: '4px' }}>Firebase chưa được cấu hình:</strong>
            Hiện tại các biến môi trường cấu hình Firebase chưa được thiết lập. Bạn có thể sử dụng ứng dụng ở chế độ offline cục bộ (lưu trữ trên trình duyệt) hoặc bấm cấu hình dự án Firebase của bạn.
          </div>
        )}
      </div>
    </div>
  );
}
