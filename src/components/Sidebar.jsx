import React from 'react';
import { 
  FileText, 
  Settings, 
  LogOut, 
  Sun, 
  Moon, 
  Database,
  FileSpreadsheet,
  PlusCircle,
  FolderOpen,
  X,
  LayoutDashboard,
  Kanban
} from 'lucide-react';

export default function Sidebar({
  user,
  onLogout,
  currentTab,
  setCurrentTab,
  theme,
  toggleTheme,
  projects,
  activeProjectId,
  setActiveProjectId,
  diaries,
  activeDiaryId,
  onSelectDiary,
  onNewDiary,
  minutes,
  activeMinuteId,
  onSelectMinute,
  onNewMinute,
  mobileOpen,
  onCloseMobile
}) {
  const activeProject = projects.find(p => p.id === activeProjectId);

  return (
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div 
          onClick={() => {
            setCurrentTab('dashboard');
            onCloseMobile && onCloseMobile();
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flexGrow: 1 }}
          title="Về trang chủ Dashboard"
        >
          <svg className="sidebar-logo" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoS" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00f0ff" />
                <stop offset="100%" stopColor="#0072ff" />
              </linearGradient>
            </defs>
            <circle cx="256" cy="256" r="230" stroke="url(#logoS)" strokeWidth="20" opacity="0.3" />
            <path d="M256,120 C256,120 330,220 330,280 A74,74 0 1,1 182,280 C182,220 256,120 256,120 Z" fill="url(#logoS)" />
          </svg>
          <div className="sidebar-logo-text" style={{ margin: 0 }}>HYDROTECH</div>
        </div>
        <button 
          onClick={onCloseMobile} 
          className="sidebar-close-mobile-btn"
          style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'none', padding: '4px' }}
          title="Đóng menu"
        >
          <X size={20} />
        </button>
      </div>


      {/* Active Project Selector */}
      <div className="sidebar-project-selector" style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '8px' }}>
        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.5px' }}>
          Dự án hoạt động
        </div>
        {projects.length === 0 ? (
          <div 
            onClick={() => {
              setCurrentTab('settings');
              setActiveProjectId('');
              onCloseMobile && onCloseMobile();
            }} 
            style={{ 
              padding: '8px 12px', 
              borderRadius: '6px', 
              background: 'rgba(239, 68, 68, 0.1)', 
              border: '1px dashed rgba(239, 68, 68, 0.3)', 
              color: '#ef4444', 
              fontSize: '0.775rem', 
              cursor: 'pointer',
              textAlign: 'center',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            className="btn-create-project-pulse"
          >
            + Cài đặt Dự án Mới
          </div>
        ) : (
          <select
            className="form-control"
            style={{ 
              background: 'rgba(255, 255, 255, 0.05)', 
              border: '1px solid rgba(255, 255, 255, 0.15)', 
              color: '#00e5ff', 
              width: '100%', 
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.825rem',
              cursor: 'pointer',
              outline: 'none',
              fontWeight: '600',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              overflow: 'hidden'
            }}
            value={activeProjectId}
            onChange={(e) => setActiveProjectId(e.target.value)}
          >
            <option value="" disabled style={{ background: '#0f172a', color: 'rgba(255,255,255,0.5)' }}>
              -- Chọn Dự án --
            </option>
            {projects.map(p => (
              <option key={p.id} value={p.id} style={{ background: '#0f172a', color: 'white' }}>
                {p.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-menu">
        <div className="menu-item" style={{ cursor: 'default', padding: '4px 8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase' }}>
          Phân hệ chức năng
        </div>
        
        <div 
          className={`menu-item ${currentTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('dashboard'); onCloseMobile && onCloseMobile(); }}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard Dự án</span>
        </div>

        <div 
          className={`menu-item ${currentTab === 'nktc' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('nktc'); onCloseMobile && onCloseMobile(); }}
        >
          <FileText size={18} />
          <span>Nhật ký thi công (NKTC)</span>
        </div>

        <div 
          className={`menu-item ${currentTab === 'bbps' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('bbps'); onCloseMobile && onCloseMobile(); }}
        >
          <FileSpreadsheet size={18} />
          <span>Biên bản phát sinh (BBPS)</span>
        </div>

        <div 
          className={`menu-item ${currentTab === 'tasks' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('tasks'); onCloseMobile && onCloseMobile(); }}
        >
          <Kanban size={18} />
          <span>Quản lý Tiến độ</span>
        </div>

        <div 
          className={`menu-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => { setCurrentTab('settings'); onCloseMobile && onCloseMobile(); }}
        >
          <Settings size={18} />
          <span>Quản lý Dự án</span>
        </div>

        {/* History List */}
        {currentTab === 'nktc' && (
          <div className="history-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="history-title">Lịch sử Nhật ký</span>
              <button 
                onClick={onNewDiary} 
                style={{ background: 'transparent', border: 'none', color: '#00e5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}
              >
                <PlusCircle size={14} /> Mới
              </button>
            </div>
            <div className="history-list">
              {diaries.filter(d => d.projectId === activeProjectId || !activeProjectId).length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', padding: '12px', textAlign: 'center' }}>
                  Chưa có nhật ký nào
                </div>
              ) : (
                diaries
                  .filter(d => d.projectId === activeProjectId || !activeProjectId)
                  .map(d => (
                    <div 
                      key={d.id} 
                      className={`history-card ${activeDiaryId === d.id ? 'active' : ''}`}
                      onClick={() => onSelectDiary(d)}
                    >
                      <div className="history-card-header">
                        <span>Ngày thi công {d.trang || '1'}</span>
                        <span>{d.ngay}</span>
                      </div>
                      <div className="history-card-desc">
                        {d.tien_trinh_cong_viec && d.tien_trinh_cong_viec[0] ? d.tien_trinh_cong_viec[0] : 'Chưa nhập công việc'}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {currentTab === 'bbps' && (
          <div className="history-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="history-title">Danh sách Biên bản</span>
              <button 
                onClick={onNewMinute} 
                style={{ background: 'transparent', border: 'none', color: '#00e5ff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: '700' }}
              >
                <PlusCircle size={14} /> Mới
              </button>
            </div>
            <div className="history-list">
              {minutes.filter(m => m.projectId === activeProjectId || !activeProjectId).length === 0 ? (
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', padding: '12px', textAlign: 'center' }}>
                  Chưa có biên bản nào
                </div>
              ) : (
                minutes
                  .filter(m => m.projectId === activeProjectId || !activeProjectId)
                  .map(m => (
                    <div 
                      key={m.id} 
                      className={`history-card ${activeMinuteId === m.id ? 'active' : ''}`}
                      onClick={() => onSelectMinute(m)}
                    >
                      <div className="history-card-header">
                        <span>Biên bản</span>
                        <span>{m.ngay}</span>
                      </div>
                      <div className="history-card-desc">
                        {m.vi_tri || 'Chưa nhập vị trí'} - {m.su_viec || 'Chưa nhập nội dung'}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar Footer */}
      <footer className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: user.uid === 'offline_local_user' ? '#ef4444' : '#10b981' }} title={user.uid === 'offline_local_user' ? 'Ngoại tuyến' : 'Trực tuyến'}></div>
            <span style={{ fontSize: '0.75rem', fontWeight: '600' }} title={user.email}>
              {user.displayName || (user.email ? user.email.split('@')[0] : 'Kỹ sư')}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            <button 
              onClick={toggleTheme} 
              style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
              title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        <button onClick={onLogout} className="btn btn-secondary btn-block btn-sm" style={{ borderColor: 'rgba(255,255,255,0.15)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <LogOut size={12} /> Đăng xuất
        </button>
      </footer>
    </aside>
  );
}
