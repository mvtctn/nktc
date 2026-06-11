import React, { useState, useEffect } from 'react';
import { updateProfile, updatePassword } from 'firebase/auth';
import { auth, isValidConfig } from '../firebase';
import { 
  User, 
  Lock, 
  Key, 
  Briefcase, 
  Mail, 
  Save, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function UserSettings({ user, onToast }) {
  const [displayName, setDisplayName] = useState('');
  const [position, setPosition] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const isOffline = user.uid === 'offline_local_user';
  const isSuperAdmin = user && user.email === 'maivantiem@gmail.com';

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      
      // Load position from LocalStorage
      const savedPosition = localStorage.getItem(`hydrotech_position_${user.uid}`);
      if (savedPosition) {
        setPosition(savedPosition);
      } else {
        setPosition(isOffline ? 'Kỹ sư Ngoại tuyến' : 'Kỹ sư hiện trường');
      }

      // Load Gemini Key
      const savedKey = localStorage.getItem('hydrotech_gemini_key');
      if (savedKey) {
        setGeminiKey(savedKey);
      }
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      if (isOffline || !isValidConfig) {
        // Local save
        const updatedUser = { ...user, displayName };
        localStorage.setItem('hydrotech_offline_user', JSON.stringify(updatedUser));
        localStorage.setItem(`hydrotech_position_${user.uid}`, position);
        onToast('Đã lưu thông tin cá nhân cục bộ!');
        
        // Reload page to apply changes to App state
        setTimeout(() => window.location.reload(), 1000);
      } else {
        // Firebase Auth save
        await updateProfile(auth.currentUser, {
          displayName: displayName
        });
        localStorage.setItem(`hydrotech_position_${user.uid}`, position);
        onToast('Cập nhật hồ sơ kỹ sư thành công!');
        
        // Reload to sync state
        setTimeout(() => window.location.reload(), 1000);
      }
      
      // Save Gemini key
      localStorage.setItem('hydrotech_gemini_key', geminiKey.trim());
    } catch (err) {
      console.error(err);
      onToast('Lỗi khi cập nhật thông tin cá nhân', true);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      onToast('Mật khẩu xác nhận không khớp', true);
      return;
    }
    if (newPassword.length < 6) {
      onToast('Mật khẩu phải dài ít nhất 6 ký tự', true);
      return;
    }

    setUpdatingPassword(true);
    try {
      if (isOffline) {
        onToast('Thay đổi mật khẩu thành công (Chế độ offline)!');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        await updatePassword(auth.currentUser, newPassword);
        onToast('Thay đổi mật khẩu Firebase thành công!');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/requires-recent-login') {
        onToast('Yêu cầu bảo mật: Vui lòng đăng xuất và đăng nhập lại để đổi mật khẩu', true);
      } else {
        onToast('Lỗi khi đổi mật khẩu', true);
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="dashboard-grid">
        {/* Profile Card & General Settings */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--primary-light)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={18} color="var(--secondary)" /> Thông tin Kỹ sư & Cấu hình AI
          </h3>
          
          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label"><Mail size={14} /> Email Kỹ sư</label>
              <input
                type="email"
                className="form-control"
                value={user.email || 'offline@hydrotech.vn'}
                disabled
                style={{ opacity: 0.6, background: 'rgba(255,255,255,0.03)' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label"><ShieldCheck size={14} /> Vai trò hệ thống</label>
              <div style={{
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: isSuperAdmin ? 'rgba(245, 158, 11, 0.08)' : 'rgba(0, 229, 255, 0.05)',
                border: isSuperAdmin ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(0, 229, 255, 0.2)',
                color: isSuperAdmin ? '#f59e0b' : 'var(--accent)',
                fontSize: '0.85rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                {isSuperAdmin ? (
                  <>🔑 Super Admin (Toàn quyền quản trị, chỉnh sửa và xóa dữ liệu)</>
                ) : (
                  <>👷 Kỹ sư thành viên (Chỉ xem và tạo mới, không được sửa/xóa dữ liệu đã lưu)</>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><User size={14} /> Họ và tên Kỹ sư</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nguyễn Văn A..."
                value={displayName}
                onChange={(e) => setDisplayName(e.value || e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label"><Briefcase size={14} /> Vị trí công việc (Chức vụ)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Kỹ sư hiện trường / Chỉ huy trưởng..."
                value={position}
                onChange={(e) => setPosition(e.value || e.target.value)}
                required
              />
            </div>

            {/* Gemini API Key */}
            <div className="form-group">
              <label className="form-label"><Key size={14} /> Cấu hình Gemini API Key</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showPass ? "text" : "password"}
                  className="form-control"
                  placeholder={import.meta.env.VITE_GEMINI_API_KEY ? "Đang dùng khóa mặc định trong .env - Nhập vào đây để ghi đè" : "Nhập Gemini API Key của bạn để bật tính năng AI..."}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.value || e.target.value)}
                  style={{ paddingRight: '40px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '10px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
                * Khóa API được lưu cục bộ an toàn trong trình duyệt của bạn để phân tích cú pháp nhật ký.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" disabled={updatingProfile} style={{ marginTop: '8px' }}>
              {updatingProfile ? <div className="spinner"></div> : <><Save size={16} /> Lưu thông tin cài đặt</>}
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--primary-light)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--secondary)" /> Đổi mật khẩu tài khoản
          </h3>

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.value || e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                className="form-control"
                placeholder="Xác nhận mật khẩu mới..."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.value || e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-secondary" disabled={updatingPassword} style={{ marginTop: '8px', width: '100%', display: 'flex', justifyContent: 'center' }}>
              {updatingPassword ? <div className="spinner" style={{ borderTopColor: 'var(--text-primary)' }}></div> : <><ShieldCheck size={16} /> Cập nhật mật khẩu mới</>}
            </button>
          </form>

          {isOffline && (
            <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(0,180,216,0.05)', border: '1px solid rgba(0,180,216,0.1)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              <strong>Lưu ý:</strong> Ở chế độ Ngoại tuyến (Local Mode), đổi mật khẩu chỉ mang tính chất mô phỏng và lưu thông tin phiên làm việc cục bộ.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
