import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  FileText, 
  FileSpreadsheet, 
  Settings, 
  PlusCircle, 
  Users, 
  TrendingUp, 
  Activity, 
  ArrowRight,
  Clock,
  Eye,
  MoreVertical
} from 'lucide-react';

export default function Dashboard({
  user,
  projects,
  activeProjectId,
  setActiveProjectId,
  diaries,
  minutes,
  setCurrentTab,
  setSettingsSubTab,
  onSelectDiary,
  onSelectMinute,
  onToast,
  onViewProject,
  onNewDiary
}) {
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Filter out diaries and minutes that belong to deleted projects
  const validProjectIds = new Set(projects.map(p => p.id));
  const validDiaries = diaries.filter(d => validProjectIds.has(d.projectId));
  const validMinutes = minutes.filter(m => validProjectIds.has(m.projectId));

  // 1. Calculate General Stats
  const totalProjects = projects.length;
  const totalDiaries = validDiaries.length;
  const totalMinutes = validMinutes.length;
  
  // Calculate average worker count from recent diaries
  const recentDiariesWithWorkers = validDiaries.filter(d => parseInt(d.so_luong_cong_nhan, 10) > 0);
  const averageWorkers = recentDiariesWithWorkers.length > 0 
    ? Math.round(recentDiariesWithWorkers.reduce((acc, curr) => acc + (parseInt(curr.so_luong_cong_nhan, 10) || 0), 0) / recentDiariesWithWorkers.length)
    : 0;

  // 2. Prepare Recent Activities
  const mergedActivities = [
    ...validDiaries.map(d => ({
      id: d.id,
      type: 'nktc',
      date: d.ngay,
      updatedAt: d.updated_at || d.created_at,
      projectId: d.projectId,
      title: `Nhật ký thi công (Ngày thi công ${d.trang || '1'})`,
      desc: d.tien_trinh_cong_viec && d.tien_trinh_cong_viec[0] 
        ? d.tien_trinh_cong_viec[0] 
        : 'Ghi nhận tiến trình thi công trong ngày.',
      raw: d
    })),
    ...validMinutes.map(m => ({
      id: m.id,
      type: 'bbps',
      date: m.ngay,
      updatedAt: m.updated_at || m.created_at,
      projectId: m.projectId,
      title: 'Biên bản hiện trường / phát sinh',
      desc: m.su_viec ? `Vị trí: ${m.vi_tri || 'Hiện trường'} - ${m.su_viec}` : 'Ghi nhận sự việc phát sinh tại công trường.',
      raw: m
    }))
  ];

  // Sort by updatedAt descending
  const sortedActivities = mergedActivities
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5); // top 5 recent activities

  // 3. Helper to switch module
  const handleQuickModule = (projId, tabName) => {
    setActiveProjectId(projId);
    setCurrentTab(tabName);
    if (tabName === 'settings') {
      setSettingsSubTab('project');
    }
    onToast(`Đã chuyển sang dự án: ${projects.find(p => p.id === projId)?.name}`);
  };

  // 4. Helper to handle click on recent activity
  const handleActivityClick = (activity) => {
    setActiveProjectId(activity.projectId);
    if (activity.type === 'nktc') {
      onSelectDiary(activity.raw);
      setCurrentTab('nktc');
      onToast('Đã tải Nhật ký thi công gần đây');
    } else {
      onSelectMinute(activity.raw);
      setCurrentTab('bbps');
      onToast('Đã tải Biên bản phát sinh gần đây');
    }
  };

  // Get project initials for badge icon
  const getInitials = (name) => {
    if (!name) return 'PJ';
    const clean = name.replace(/Nhà máy|Dự án|Công trình/gi, '').trim();
    return clean.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'PJ';
  };

  return (
    <div className="container-fluid" id="dashboard-panel">
      {/* Top Header: Title and Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px', 
        flexWrap: 'wrap', 
        gap: '12px' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={22} color="var(--accent)" /> Danh sách Dự án Đang Quản lý
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.8rem', margin: '2px 0 0' }}>
            Xin chào, Kỹ sư {user.displayName || 'Hydrotech'}! Chọn dự án của bạn để xem và quản lý
          </p>
        </div>
        
        <div className="dashboard-header-actions">
          <button 
            onClick={() => {
              if (projects.length === 0) {
                onToast('Vui lòng tạo dự án mới trước khi ghi nhật ký', true);
                return;
              }
              const activeProj = projects.find(p => p.id === activeProjectId);
              if (activeProj) {
                onToast(`Ghi nhật ký mới cho dự án: ${activeProj.name}`);
              }
              onNewDiary();
            }}
            className="btn btn-accent btn-sm" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              minHeight: '38px',
              background: '#10b981',
              borderColor: '#10b981',
              color: '#ffffff',
              fontWeight: '700'
            }}
          >
            <FileText size={15} /> Ghi Nhật Ký Mới
          </button>

          <button 
            onClick={() => {
              setCurrentTab('settings');
              setSettingsSubTab('project');
            }}
            className="btn btn-secondary btn-sm" 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              minHeight: '38px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontWeight: '600'
            }}
          >
            <PlusCircle size={15} /> Tạo Dự án Mới
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Chưa có dự án nào được cài đặt. Vui lòng bấm vào "Tạo Dự án Mới" ở góc phải để bắt đầu cấu hình.
        </div>
      ) : (
        <div className="project-grid" style={{ marginBottom: '24px' }}>
          {projects.map(proj => {
            // Find diaries and minutes for this project
            const projectDiaries = diaries.filter(d => d.projectId === proj.id);
            const projectMinutes = minutes.filter(m => m.projectId === proj.id);
            const isActive = activeProjectId === proj.id;

            return (
              <div 
                key={proj.id} 
                className={`glass-card clickable ${isActive ? 'active' : ''}`}
                onClick={() => onViewProject && onViewProject(proj)}
                style={{ 
                  padding: '20px',
                  borderLeft: isActive ? '5px solid var(--secondary)' : '1px solid var(--border)',
                  background: isActive ? 'rgba(0, 180, 216, 0.02)' : 'var(--bg-card)',
                  transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; setActiveDropdown(null); }}
              >
                {/* Header Row: Logo, Name, Menu */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
                    {/* Logo */}
                    <div style={{ 
                      width: '46px', height: '46px', borderRadius: '10px', 
                      background: isActive ? 'linear-gradient(135deg, var(--secondary), #0077b6)' : 'linear-gradient(135deg, var(--primary-light), var(--primary))', 
                      color: 'white', fontWeight: '800', fontSize: '1rem',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      {getInitials(proj.name)}
                    </div>

                    {/* Name & Address */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {proj.name}
                        {isActive && (
                          <span style={{ fontSize: '0.65rem', padding: '2px 8px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent)', borderRadius: '20px', fontWeight: '700', letterSpacing: '0.5px' }}>
                            ĐANG CHỌN
                          </span>
                        )}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        <MapPin size={12} style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span style={{ 
                          display: '-webkit-box', 
                          WebkitLineClamp: 2, 
                          WebkitBoxOrient: 'vertical', 
                          overflow: 'hidden',
                          lineHeight: '1.4'
                        }}>
                          {proj.address || 'Chưa cấu hình địa chỉ'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Context Menu Button */}
                  <div style={{ position: 'relative' }}>
                    <button 
                      className="btn-icon" 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setActiveDropdown(activeDropdown === proj.id ? null : proj.id); 
                      }}
                      style={{ padding: '4px', margin: '-4px -4px 0 0' }}
                      title="Tùy chọn khác"
                    >
                      <MoreVertical size={20} />
                    </button>
                    
                    {activeDropdown === proj.id && (
                      <div style={{ 
                        position: 'absolute', right: 0, top: '100%', marginTop: '4px',
                        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        zIndex: 10, minWidth: '180px', padding: '6px'
                      }}>
                        <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleQuickModule(proj.id, 'nktc'); }}>
                          <FileText size={14} color="#10b981" /> Viết Nhật ký
                        </button>
                        <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleQuickModule(proj.id, 'bbps'); }}>
                          <FileSpreadsheet size={14} color="#ef4444" /> Biên bản phát sinh
                        </button>
                        <div style={{ height: '1px', background: 'var(--border)', margin: '4px 0' }}></div>
                        <button className="dropdown-item" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleQuickModule(proj.id, 'settings'); }}>
                          <Settings size={14} color="var(--accent)" /> Cài đặt dự án
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats Badges */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <FileText size={14} /> {projectDiaries.length} Nhật ký
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <FileSpreadsheet size={14} /> {projectMinutes.length} Phát sinh
                  </div>
                </div>
              </div>
            );
          })}


        </div>
      )}

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="avatar-circle">
            <Briefcase size={22} color="var(--accent)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tổng Số Dự Án</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{totalProjects}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="avatar-circle">
            <FileText size={22} color="#10b981" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Nhật Ký Thi Công</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{totalDiaries}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="avatar-circle">
            <FileSpreadsheet size={22} color="#ef4444" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Biên Bản Phát Sinh</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{totalMinutes}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 193, 7, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} className="avatar-circle">
            <Users size={22} color="#ffc107" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Nhân Công TB</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{averageWorkers} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-light)' }}>người</span></h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Activity Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div className="panel-header" style={{ marginBottom: '0' }}>
            <h3 className="panel-title"><Clock size={18} /> Hoạt động gần đây nhất</h3>
          </div>
          
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sortedActivities.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Chưa ghi nhận hoạt động nào gần đây. Hãy bắt đầu viết Nhật ký hoặc Biên bản hiện trường!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '8px' }}>
                {sortedActivities.map((act, index) => {
                  const actProj = projects.find(p => p.id === act.projectId);
                  return (
                    <div 
                      key={act.id} 
                      onClick={() => handleActivityClick(act)}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        cursor: 'pointer',
                        position: 'relative',
                        paddingBottom: index !== sortedActivities.length - 1 ? '14px' : '0',
                        borderBottom: index !== sortedActivities.length - 1 ? '1px dashed var(--border)' : 'none'
                      }}
                      className="activity-item"
                    >
                      {/* Bullet Marker */}
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: act.type === 'nktc' ? '#10b981' : '#ef4444',
                        boxShadow: act.type === 'nktc' ? '0 0 8px rgba(16, 185, 129, 0.4)' : '0 0 8px rgba(239, 68, 68, 0.4)',
                        marginTop: '6px',
                        flexShrink: 0
                      }}></div>

                      {/* Content text */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {act.title}
                          </h5>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', whiteSpace: 'nowrap' }}>
                            {act.date}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.725rem', color: 'var(--text-light)', marginBottom: '4px', fontWeight: '600' }}>
                          Dự án: {actProj ? actProj.name : 'N/A'}
                        </p>
                        <p style={{ 
                          fontSize: '0.775rem', 
                          color: 'var(--text-secondary)', 
                          margin: '0', 
                          whiteSpace: 'nowrap', 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis' 
                        }}>
                          {act.desc}
                        </p>
                      </div>
                      
                      {/* Go arrow */}
                      <div style={{ alignSelf: 'center', color: 'var(--text-light)' }} className="go-arrow">
                        <ArrowRight size={14} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Performance Analytics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div className="panel-header" style={{ marginBottom: '0' }}>
            <h3 className="panel-title"><Activity size={18} /> Phân tích Hiệu suất & An toàn</h3>
          </div>
          
          <div className="glass-card" style={{ 
            background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.05) 0%, rgba(17, 34, 64, 0.1) 100%)',
            border: '1px solid var(--border)',
            padding: '20px'
          }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)' }}>
              <TrendingUp size={14} color="var(--secondary)" /> Thông số Vận hành & An toàn
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.8rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Độ phủ Nhật ký công trình</span>
                  <strong>{totalProjects > 0 ? Math.round((totalDiaries / (totalProjects * 5)) * 100) : 0}%</strong>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${totalProjects > 0 ? Math.min(Math.round((totalDiaries / (totalProjects * 5)) * 100), 100) : 0}%`, 
                    height: '100%', 
                    background: 'linear-gradient(90deg, var(--secondary), var(--accent))' 
                  }}></div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Chỉ số An toàn lao động (Tốt)</span>
                  <strong>{totalDiaries > 0 ? Math.round((validDiaries.filter(d => d.an_toan_lao_dong === 'Tốt').length / totalDiaries) * 100) : 100}%</strong>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${totalDiaries > 0 ? Math.round((validDiaries.filter(d => d.an_toan_lao_dong === 'Tốt').length / totalDiaries) * 100) : 100}%`, 
                    height: '100%', 
                    background: '#10b981' 
                  }}></div>
                </div>
              </div>

              <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Chỉ số Vệ sinh môi trường (Tốt)</span>
                  <strong>{totalDiaries > 0 ? Math.round((validDiaries.filter(d => d.ve_sinh_moi_truong === 'Tốt').length / totalDiaries) * 100) : 100}%</strong>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ 
                    width: `${totalDiaries > 0 ? Math.round((validDiaries.filter(d => d.ve_sinh_moi_truong === 'Tốt').length / totalDiaries) * 100) : 100}%`, 
                    height: '100%', 
                    background: '#00b4d8' 
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
