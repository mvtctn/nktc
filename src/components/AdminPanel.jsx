import React, { useState } from 'react';
import { ShieldCheck, Database, Users, Check, X, Award, Activity, Lock, Unlock, FileText, FileSpreadsheet, Briefcase, Plus, UserPlus, Edit2, Trash2, KeyRound, Send } from 'lucide-react';

export default function AdminPanel({ 
  user, 
  projects = [], 
  diaries = [], 
  minutes = [], 
  members = [], 
  onCreateMember,
  onUpdateMember,
  onDeleteMember,
  onChangePassword,
}) {
  // Local Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [position, setPosition] = useState('Kỹ sư hiện trường');
  const [formLoading, setFormLoading] = useState(false);

  // Filter out diaries and minutes that belong to deleted projects
  const validProjectIds = new Set(projects.map(p => p.id));
  const validDiaries = diaries.filter(d => validProjectIds.has(d.projectId));
  const validMinutes = minutes.filter(m => validProjectIds.has(m.projectId));

  // Edit Member States
  const [editingMember, setEditingMember] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editRole, setEditRole] = useState('Kỹ sư hiện trường');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const startEdit = (eng) => {
    setEditingMember(eng);
    setEditName(eng.displayName || '');
    setEditPosition(eng.position || '');
    setEditRole(eng.role || 'Kỹ sư hiện trường');
    setEditNewPassword('');
    setPwLoading(false);
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setEditNewPassword('');
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editPosition.trim()) return;
    const success = await onUpdateMember(editingMember.id || editingMember.uid, {
      displayName: editName.trim(),
      position: editPosition.trim(),
      role: editRole
    });
    if (success) {
      setEditingMember(null);
      setEditNewPassword('');
    }
  };

  const handleSendPasswordReset = async () => {
    if (!editingMember) return;
    setPwLoading(true);
    await onChangePassword(editingMember.email);
    setPwLoading(false);
  };

  const confirmDelete = async (eng) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản của kỹ sư ${eng.displayName || eng.email} không? Hành động này không thể hoàn tác.`)) {
      await onDeleteMember(eng.id || eng.uid);
    }
  };

  const handleSubmitMember = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !displayName.trim() || !position.trim()) return;
    if (password.length < 6) {
      alert('Mật khẩu khởi tạo phải chứa ít nhất 6 ký tự.');
      return;
    }

    setFormLoading(true);
    const success = await onCreateMember(
      email.trim(),
      password.trim(),
      displayName.trim(),
      position.trim()
    );
    setFormLoading(false);

    if (success) {
      setEmail('');
      setPassword('');
      setDisplayName('');
      setPosition('Kỹ sư hiện trường');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. Header Card: Super Admin Status */}
      <div className="glass-card" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(15, 23, 42, 0.4) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShieldCheck size={28} color="#f59e0b" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Bảng quản trị Hệ thống
              </h3>
              <span style={{
                padding: '2px 8px',
                borderRadius: '20px',
                background: '#f59e0b',
                color: '#0f172a',
                fontSize: '0.65rem',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 0 10px rgba(245, 158, 11, 0.4)'
              }}>
                SUPER ADMIN
              </span>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Đang đăng nhập bằng tài khoản quản trị: <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong>
            </p>
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)', padding: '6px 12px', borderRadius: '6px', border: '1px dashed rgba(245, 158, 11, 0.2)' }}>
          🔒 Security Level: <strong>Full Access (Level 5)</strong>
        </div>
      </div>

      {/* 2. System Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Stat 1: Projects */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(0, 180, 216, 0.1)',
            border: '1px solid rgba(0, 180, 216, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Briefcase size={20} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.2 }}>{projects.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Tổng số Dự án hiện hữu</div>
          </div>
        </div>

        {/* Stat 2: Diaries */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileText size={20} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.2 }}>{validDiaries.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Nhật ký thi công đã ghi</div>
          </div>
        </div>

        {/* Stat 3: Minutes */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FileSpreadsheet size={20} color="#ef4444" />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-primary)', lineHeight: 1.2 }}>{validMinutes.length}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Biên bản hiện trường lập</div>
          </div>
        </div>
      </div>

      {/* 3. Create Member Form (New Section) */}
      <div className="glass-card">
        <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={16} color="var(--accent)" /> Tạo tài khoản thành viên kỹ sư mới
        </h4>

        <form onSubmit={handleSubmitMember} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Họ và tên kỹ sư *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Nguyễn Văn A..."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Email đăng nhập *</label>
            <input
              type="email"
              className="form-control"
              placeholder="email@hydrotech.vn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Mật khẩu khởi tạo *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Tối thiểu 6 ký tự..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Chức vụ kỹ sư *</label>
            <input
              type="text"
              className="form-control"
              placeholder="Kỹ sư hiện trường / Giám sát..."
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={formLoading} 
            style={{ 
              height: '42px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '6px',
              padding: '10px 16px'
            }}
          >
            {formLoading ? (
              <div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--text-primary)' }}></div>
            ) : (
              <>
                <Plus size={16} /> Tạo tài khoản
              </>
            )}
          </button>
        </form>
      </div>

      {/* 4. Permissions Matrix & Active Engineers */}
      <div className="dashboard-grid">
        {/* Left Column: Permission Matrix Table */}
        <div className="glass-card">
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={16} color="var(--accent)" /> Ma trận Phân quyền Hệ thống
          </h4>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '8px 4px', color: 'var(--text-secondary)' }}>Vai trò</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-secondary)', textAlign: 'center' }}>Xem</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-secondary)', textAlign: 'center' }}>Tạo mới</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-secondary)', textAlign: 'center' }}>Sửa đã lưu</th>
                  <th style={{ padding: '8px 4px', color: 'var(--text-secondary)', textAlign: 'center' }}>Xóa bỏ</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: '700', color: '#f59e0b' }}>Super Admin</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '10px 4px', fontWeight: '700', color: 'var(--accent)' }}>Kỹ sư thành viên</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><X size={14} color="#ef4444" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><X size={14} color="#ef4444" /></td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 4px', fontWeight: '700', color: 'var(--text-secondary)' }}>Guest / Offline mode</td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><Check size={14} color="#10b981" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><X size={14} color="#ef4444" /></td>
                  <td style={{ padding: '10px 4px', textAlign: 'center' }}><X size={14} color="#ef4444" /></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '16px', padding: '10px', background: 'rgba(0, 180, 216, 0.03)', border: '1px solid var(--border)', borderRadius: '6px', fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            💡 <strong>Quy tắc bảo vệ:</strong> Các nút Sửa và Xóa trong toàn bộ chương trình sẽ bị ẩn đối với Kỹ sư thành viên để tránh ghi đè dữ liệu lịch sử thi công quan trọng. Các yêu cầu ghi đè và dọn dẹp chỉ được phê duyệt qua tài khoản Super Admin.
          </div>
        </div>

        {/* Right Column: Registered Engineers / Contributors */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={16} color="#10b981" /> Danh sách kỹ sư ({members.length})
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '280px', flex: 1 }}>
            {members.length === 0 ? (
              <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>
                Chưa có tài khoản kỹ sư nào được ghi nhận.
              </span>
            ) : (
              members.map((eng) => (
                <div key={eng.id || eng.uid} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '0.78rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? 'rgba(245,158,11,0.1)' : 'rgba(0,180,216,0.1)',
                      border: eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? '1px solid rgba(245,158,11,0.2)' : '1px solid rgba(0,180,216,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      flexShrink: 0,
                      color: eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? '#f59e0b' : 'var(--accent)'
                    }}>
                      {eng.displayName ? eng.displayName[0]?.toUpperCase() : 'K'}
                    </div>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: '8px' }}>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eng.displayName || 'Chưa đặt tên'}</div>
                      <div style={{ fontSize: '0.675rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{eng.email}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        background: eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? 'rgba(245,158,11,0.1)' : 'rgba(255,255,255,0.05)',
                        color: eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? '#f59e0b' : 'var(--text-secondary)',
                        border: eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? '1px solid rgba(245,158,11,0.2)' : '1px solid var(--border)'
                      }}>
                        {eng.role === 'Super Admin' || eng.email === 'maivantiem@gmail.com' ? 'Super Admin' : 'Kỹ sư'}
                      </span>
                      <span style={{ fontSize: '0.625rem', color: 'var(--text-light)', opacity: 0.8 }}>
                        {eng.position || 'Thành viên'}
                      </span>
                    </div>

                    {/* Actions: Edit & Delete buttons */}
                    <div style={{ display: 'flex', gap: '4px', borderLeft: '1px solid var(--border)', paddingLeft: '8px' }}>
                      <button
                        type="button"
                        onClick={() => startEdit(eng)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--accent)',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Chỉnh sửa & Phân quyền"
                      >
                        <Edit2 size={14} />
                      </button>
                      
                      {eng.email !== 'maivantiem@gmail.com' && eng.email !== user.email && (
                        <button
                          type="button"
                          onClick={() => confirmDelete(eng)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Xóa tài khoản"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Edit Member Modal */}
      {editingMember && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(10, 25, 47, 0.75)',
          backdropFilter: 'blur(4px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '450px',
            width: '100%',
            background: 'var(--primary-light)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-xl)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Edit2 size={18} color="var(--accent)" /> Cấu hình & Phân quyền thành viên
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-light)', margin: 0 }}>
              Đang chỉnh sửa: <strong>{editingMember.email}</strong>
            </p>

            <div className="form-group">
              <label className="form-label">Họ và tên kỹ sư *</label>
              <input
                type="text"
                className="form-control"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Nguyễn Văn A..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Chức vụ kỹ sư *</label>
              <input
                type="text"
                className="form-control"
                value={editPosition}
                onChange={(e) => setEditPosition(e.target.value)}
                placeholder="Kỹ sư hiện trường, Chỉ huy phó..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Vai trò phân quyền hệ thống</label>
              <select 
                className="form-control" 
                value={editRole} 
                onChange={(e) => setEditRole(e.target.value)}
                disabled={editingMember.email === 'maivantiem@gmail.com' || editingMember.email === user.email}
              >
                <option value="Kỹ sư hiện trường">Kỹ sư thành viên (Xem & Tạo mới)</option>
                <option value="Super Admin">Super Admin (Toàn bộ quyền Sửa/Xóa)</option>
              </select>
              {(editingMember.email === 'maivantiem@gmail.com' || editingMember.email === user.email) && (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', marginTop: '4px', display: 'block', fontStyle: 'italic' }}>
                  * Không thể tự đổi vai trò của bản thân hoặc của tài khoản admin mặc định.
                </span>
              )}
            </div>

            <div style={{
              borderTop: '1px solid var(--border)',
              paddingTop: '14px',
              marginTop: '4px',
            }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <KeyRound size={14} color="#f59e0b" /> Đặt lại mật khẩu
              </label>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 10px 0', lineHeight: '1.4' }}>
                Hệ thống sẽ gửi email hướng dẫn đặt lại mật khẩu tới địa chỉ email của kỹ sư.
                Yêu cầu kỹ sư kiểm tra hộp thư (kể cả thư rác).
              </p>
              <button
                type="button"
                onClick={handleSendPasswordReset}
                disabled={pwLoading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '9px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(245,158,11,0.08)',
                  border: '1px solid rgba(245,158,11,0.3)',
                  color: '#f59e0b',
                  cursor: pwLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  opacity: pwLoading ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {pwLoading ? (
                  <div className="spinner" style={{ width: '14px', height: '14px', borderTopColor: '#f59e0b' }} />
                ) : (
                  <Send size={14} />
                )}
                {pwLoading ? 'Đang gửi...' : `Gửi email đặt lại mật khẩu`}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={cancelEdit}>
                Hủy
              </button>
              <button type="button" className="btn btn-accent" style={{ flex: 1 }} onClick={saveEdit}>
                Lưu cấu hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
