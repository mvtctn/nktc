import React from 'react';
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
  Sparkles
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
  onToast
}) {
  // 1. Calculate General Stats
  const totalProjects = projects.length;
  const totalDiaries = diaries.length;
  const totalMinutes = minutes.length;
  
  // Calculate average worker count from recent diaries
  const recentDiariesWithWorkers = diaries.filter(d => d.so_luong_cong_nhan > 0);
  const averageWorkers = recentDiariesWithWorkers.length > 0 
    ? Math.round(recentDiariesWithWorkers.reduce((acc, curr) => acc + curr.so_luong_cong_nhan, 0) / recentDiariesWithWorkers.length)
    : 0;

  // 2. Prepare Recent Activities
  const mergedActivities = [
    ...diaries.map(d => ({
      id: d.id,
      type: 'nktc',
      date: d.ngay,
      updatedAt: d.updated_at || d.created_at,
      projectId: d.projectId,
      title: `Nhật ký thi công (Trang ${d.trang || '1'})`,
      desc: d.tien_trinh_cong_viec && d.tien_trinh_cong_viec[0] 
        ? d.tien_trinh_cong_viec[0] 
        : 'Ghi nhận tiến trình thi công trong ngày.',
      raw: d
    })),
    ...minutes.map(m => ({
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
      {/* Welcome Banner */}
      <div className="glass-card" style={{ 
        marginBottom: '24px', 
        padding: '24px 30px', 
        background: 'linear-gradient(135deg, rgba(15, 43, 72, 0.9) 0%, rgba(0, 180, 216, 0.2) 100%)',
        border: '1px solid rgba(0, 229, 255, 0.15)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: '800', margin: '0', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff' }}>
            Xin chào, Kỹ sư {user.displayName || 'Hydrotech'}! <Sparkles size={20} color="var(--accent)" />
          </h2>
          <p style={{ color: 'var(--text-light)', fontSize: '0.875rem', marginTop: '6px', maxWidth: '600px' }}>
            Hệ thống Quản lý Nhật ký thi công & Biên bản hiện trường Hydrotech. Chọn một dự án bên dưới hoặc chuyển đổi nhanh giữa các phân hệ quản lý để bắt đầu làm việc.
          </p>
        </div>
        
        {/* Quick Action Button */}
        <button 
          onClick={() => {
            setCurrentTab('settings');
            setSettingsSubTab('project');
          }}
          className="btn btn-accent" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <PlusCircle size={16} /> Tạo Dự án Mới
        </button>
      </div>

      {/* Stats Summary Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(0, 229, 255, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }} className="avatar-circle">
            <Briefcase size={22} color="var(--accent)" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Tổng Số Dự Án</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{totalProjects}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }} className="avatar-circle">
            <FileText size={22} color="#10b981" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Nhật Ký Thi Công</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{totalDiaries}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }} className="avatar-circle">
            <FileSpreadsheet size={22} color="#ef4444" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Biên Bản Phát Sinh</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{totalMinutes}</h3>
          </div>
        </div>

        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255, 193, 7, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', flexShrink: 0 }} className="avatar-circle">
            <Users size={22} color="#ffc107" />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase' }}>Lực Lượng Nhân Công TB</span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', margin: '2px 0 0' }}>{averageWorkers} <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-light)' }}>người</span></h3>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="dashboard-grid">
        {/* Left Side: Projects Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div className="panel-header" style={{ marginBottom: '0' }}>
            <h3 className="panel-title"><Briefcase size={18} /> Danh sách Dự án Đang Quản lý</h3>
          </div>

          {projects.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Chưa có dự án nào được cài đặt. Vui lòng bấm vào "Tạo Dự án Mới" ở banner trên để bắt đầu cấu hình.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {projects.map(proj => {
                // Find diaries and minutes for this project
                const projectDiaries = diaries.filter(d => d.projectId === proj.id);
                const projectMinutes = minutes.filter(m => m.projectId === proj.id);
                const isActive = activeProjectId === proj.id;

                return (
                  <div 
                    key={proj.id} 
                    className={`glass-card ${isActive ? 'active' : ''}`}
                    style={{ 
                      padding: '20px',
                      borderLeft: isActive ? '5px solid var(--secondary)' : '1px solid var(--border)',
                      background: isActive ? 'rgba(0, 180, 216, 0.02)' : 'var(--bg-card)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      {/* Project Logo Initial Bubble */}
                      <div style={{ 
                        width: '50px', 
                        height: '50px', 
                        borderRadius: '10px', 
                        background: isActive ? 'linear-gradient(135deg, var(--secondary), #0077b6)' : 'linear-gradient(135deg, var(--primary-light), var(--primary))', 
                        color: 'white',
                        fontWeight: '800',
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        {getInitials(proj.name)}
                      </div>

                      {/* Project Information */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          {proj.name}
                          {isActive && (
                            <span style={{ fontSize: '0.625rem', padding: '2px 8px', background: 'rgba(0, 229, 255, 0.15)', color: 'var(--accent)', border: '1px solid rgba(0, 229, 255, 0.25)', borderRadius: '20px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                              Đang chọn
                            </span>
                          )}
                        </h4>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
                          <MapPin size={13} style={{ flexShrink: 0 }} />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proj.address || 'Chưa cấu hình địa chỉ'}
                          </span>
                        </div>

                        {/* Project Statistics Counts */}
                        <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-light)', marginBottom: '16px' }}>
                          <span><strong>Nhật ký:</strong> {projectDiaries.length} bản ghi</span>
                          <span>•</span>
                          <span><strong>Phát sinh:</strong> {projectMinutes.length} biên bản</span>
                        </div>

                        {/* Module Buttons Grid */}
                        <div style={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', 
                          gap: '10px' 
                        }}>
                          <button 
                            onClick={() => handleQuickModule(proj.id, 'nktc')}
                            className="btn btn-secondary btn-sm" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                          >
                            <FileText size={14} color="#10b981" />
                            Nhật ký
                          </button>

                          <button 
                            onClick={() => handleQuickModule(proj.id, 'bbps')}
                            className="btn btn-secondary btn-sm" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                          >
                            <FileSpreadsheet size={14} color="#ef4444" />
                            Phát sinh
                          </button>

                          <button 
                            onClick={() => handleQuickModule(proj.id, 'settings')}
                            className="btn btn-secondary btn-sm" 
                            style={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              fontSize: '0.8rem',
                              fontWeight: '600'
                            }}
                          >
                            <Settings size={14} color="var(--accent)" />
                            Cài đặt
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Activity & Weather Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
          {/* Recent Activity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                            <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-light)', margin: '0', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

          {/* Quick Insights Widget */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="panel-header" style={{ marginBottom: '0' }}>
              <h3 className="panel-title"><Activity size={18} /> Phân tích Hiệu suất & An toàn</h3>
            </div>
            
            <div className="glass-card" style={{ 
              background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.05) 0%, rgba(17, 34, 64, 0.1) 100%)',
              border: '1px solid var(--border)',
              padding: '20px'
            }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)' }}>
                <TrendingUp size={14} /> Thông số Vận hành & An toàn
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
                    <strong>{totalDiaries > 0 ? Math.round((diaries.filter(d => d.an_toan_lao_dong === 'Tốt').length / totalDiaries) * 100) : 100}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${totalDiaries > 0 ? Math.round((diaries.filter(d => d.an_toan_lao_dong === 'Tốt').length / totalDiaries) * 100) : 100}%`, 
                      height: '100%', 
                      background: '#10b981' 
                    }}></div>
                  </div>
                </div>

                <div style={{ borderTop: '1px dashed var(--border)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Chỉ số Vệ sinh môi trường (Tốt)</span>
                    <strong>{totalDiaries > 0 ? Math.round((diaries.filter(d => d.ve_sinh_moi_truong === 'Tốt').length / totalDiaries) * 100) : 100}%</strong>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: `${totalDiaries > 0 ? Math.round((diaries.filter(d => d.ve_sinh_moi_truong === 'Tốt').length / totalDiaries) * 100) : 100}%`, 
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
    </div>
  );
}
