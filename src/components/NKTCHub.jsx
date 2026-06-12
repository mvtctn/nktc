import React from 'react';
import { Briefcase, FileSpreadsheet, Plus, ArrowRight, Calendar } from 'lucide-react';

export default function NKTCHub({ 
  projects, 
  diaries, 
  activeProjectId, 
  setActiveProjectId, 
  onOpenDiary, 
  onNewDiary 
}) {
  const activeProject = projects.find(p => p.id === activeProjectId);
  const projectDiaries = diaries.filter(d => d.projectId === activeProjectId);

  const getInitials = (name) => {
    if (!name) return 'PJ';
    const clean = name.replace(/Công ty|TNHH|CP|Cổ phần|Dự án/gi, '').trim();
    return clean.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'PJ';
  };

  return (
    <div className="container-fluid" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileSpreadsheet size={22} color="var(--accent)" /> Nhật ký Thi công
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', margin: '2px 0 0' }}>
            Quản lý và ghi chép nhật ký hàng ngày cho các dự án
          </p>
        </div>
        {activeProjectId && (
          <button 
            onClick={onNewDiary}
            className="btn btn-accent btn-sm" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
          >
            <Plus size={16} /> Tạo mới Nhật ký
          </button>
        )}
      </div>

      {!activeProjectId ? (
        <div className="glass-card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Chọn dự án để bắt đầu</h3>
          <div className="dashboard-grid">
            {projects.map(proj => (
              <div 
                key={proj.id}
                className="glass-card clickable"
                onClick={() => setActiveProjectId(proj.id)}
                style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  cursor: 'pointer',
                  border: '1px solid var(--border)' 
                }}
              >
                <div style={{ 
                  width: '40px', height: '40px', borderRadius: '8px', 
                  background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontWeight: 'bold' 
                }}>
                  {getInitials(proj.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {proj.name}
                  </h4>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                    <Briefcase size={12} /> {proj.investor || 'Không có CĐT'}
                  </div>
                </div>
                <ArrowRight size={16} color="var(--text-light)" />
              </div>
            ))}
            {projects.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: 'var(--text-light)' }}>
                Chưa có dự án nào. Vui lòng tạo dự án mới ở Dashboard.
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setActiveProjectId('')} 
              className="btn btn-secondary btn-sm"
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              ← Trở về danh sách dự án
            </button>
            <div style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--accent)' }}>
              Dự án: {activeProject?.name}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Danh sách Nhật ký đã tạo ({projectDiaries.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {projectDiaries.map(diary => (
                <div 
                  key={diary.id}
                  className="glass-card clickable"
                  onClick={() => onOpenDiary(diary)}
                  style={{ 
                    padding: '12px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    cursor: 'pointer',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div style={{
                    flexShrink: 0,
                    width: '50px', height: '42px', borderRadius: '8px',
                    background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '700', whiteSpace: 'nowrap' }}>Ngày TC</span>
                    <span style={{ fontSize: '1rem', color: '#10b981', fontWeight: '800', lineHeight: 1 }}>{diary.trang || '1'}</span>
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <Calendar size={12} color="var(--text-light)" />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{diary.ngay}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {diary.vi_tri ? `${diary.vi_tri}: ` : ''}{diary.su_viec || 'Chưa nhập nội dung'}
                    </p>
                  </div>
                  <ArrowRight size={16} color="var(--text-light)" style={{ flexShrink: 0 }} />
                </div>
              ))}

              {projectDiaries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                  <FileSpreadsheet size={40} color="var(--border)" style={{ marginBottom: '12px', opacity: 0.5 }} />
                  <p>Dự án này chưa có nhật ký nào.</p>
                  <button 
                    onClick={onNewDiary}
                    className="btn btn-accent btn-sm" 
                    style={{ marginTop: '12px' }}
                  >
                    Tạo mới Nhật ký
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
