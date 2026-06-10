import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw } from 'lucide-react';
import { getFirebaseConfig } from '../firebase';

export default function FirebaseConfigModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState('');
  const [authDomain, setAuthDomain] = useState('');
  const [projectId, setProjectId] = useState('');
  const [storageBucket, setStorageBucket] = useState('');
  const [messagingSenderId, setMessagingSenderId] = useState('');
  const [appId, setAppId] = useState('');

  useEffect(() => {
    const config = getFirebaseConfig();
    setApiKey(config.apiKey || '');
    setAuthDomain(config.authDomain || '');
    setProjectId(config.projectId || '');
    setStorageBucket(config.storageBucket || '');
    setMessagingSenderId(config.messagingSenderId || '');
    setAppId(config.appId || '');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    const config = {
      apiKey: apiKey.trim(),
      authDomain: authDomain.trim(),
      projectId: projectId.trim(),
      storageBucket: storageBucket.trim(),
      messagingSenderId: messagingSenderId.trim(),
      appId: appId.trim()
    };

    localStorage.setItem('hydrotech_firebase_config', JSON.stringify(config));
    alert('Đã lưu cấu hình Firebase mới! Ứng dụng sẽ tự động tải lại để áp dụng.');
    window.location.reload();
  };

  const handleReset = () => {
    if (window.confirm('Bạn có muốn xóa bỏ cấu hình tự chọn và quay lại cấu hình hệ thống mặc định?')) {
      localStorage.removeItem('hydrotech_firebase_config');
      window.location.reload();
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3 className="modal-title">Cấu hình liên kết dự án Firebase</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
              Nhập các khóa kết nối từ bảng điều khiển Firebase (Firebase Console) của bạn để lưu trữ nhật ký thi công trực tuyến. Nếu bỏ trống, ứng dụng sẽ chạy ở chế độ Ngoại tuyến (Local Mode) lưu trữ dữ liệu tại bộ nhớ cục bộ trình duyệt.
            </p>
            
            <div className="form-group">
              <label className="form-label">API Key</label>
              <input
                type="text"
                className="form-control"
                value={apiKey}
                onChange={(e) => setApiKey(e.value || e.target.value)}
                placeholder="AIzaSy..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Project ID</label>
              <input
                type="text"
                className="form-control"
                value={projectId}
                onChange={(e) => setProjectId(e.value || e.target.value)}
                placeholder="nktc-hydrotech..."
              />
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label">Auth Domain</label>
                <input
                  type="text"
                  className="form-control"
                  value={authDomain}
                  onChange={(e) => setAuthDomain(e.value || e.target.value)}
                  placeholder="nktc-hydrotech.firebaseapp.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Storage Bucket</label>
                <input
                  type="text"
                  className="form-control"
                  value={storageBucket}
                  onChange={(e) => setStorageBucket(e.value || e.target.value)}
                  placeholder="nktc-hydrotech.appspot.com"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label">Messaging Sender ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={messagingSenderId}
                  onChange={(e) => setMessagingSenderId(e.value || e.target.value)}
                  placeholder="123456789..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">App ID</label>
                <input
                  type="text"
                  className="form-control"
                  value={appId}
                  onChange={(e) => setAppId(e.value || e.target.value)}
                  placeholder="1:123456:web:abcd..."
                />
              </div>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" onClick={handleReset} className="btn btn-secondary">
              Khôi phục mặc định
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} /> Lưu & Khởi động lại
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
