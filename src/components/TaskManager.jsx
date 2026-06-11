import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users,
  ArrowLeft,
  MapPin,
  FolderOpen,
  Calendar
} from 'lucide-react';

export default function TaskManager({
  user,
  projects,
  activeProjectId,
  setActiveProjectId,
  jobs,
  tasks,
  members,
  onSaveJob,
  onSaveTask,
  onDeleteJob,
  onDeleteTask,
  onToast,
  isOffline,
  isSuperAdmin
}) {
  const [currentView, setCurrentView] = useState('project-list'); 
  // 'project-list' | 'list' | 'job-detail' | 'job-form' | 'task-form'
  
  const [activeJobId, setActiveJobId] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editingTask, setEditingTask] = useState(null);

  // Form states for Job
  const [jobFormData, setJobFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'Chưa bắt đầu',
    progress: 0
  });

  // Form states for Task
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    startDate: '',
    endDate: '',
    status: 'Chưa bắt đầu',
    progress: 0,
    assignees: [] // Array of member UIDs
  });

  const activeProject = projects.find(p => p.id === activeProjectId);
  const activeProjectJobs = jobs.filter(j => j.projectId === activeProjectId);
  const activeJob = jobs.find(j => j.id === activeJobId);
  const activeJobTasks = tasks.filter(t => t.jobId === activeJobId);

  const getInitials = (name) => {
    if (!name) return 'PJ';
    const clean = name.replace(/Nhà máy|Dự án|Công trình/gi, '').trim();
    return clean.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'PJ';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành': return '#4caf50'; // Green
      case 'Đang thực hiện': return '#2196f3'; // Blue
      default: return '#ff9800'; // Orange
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Hoàn thành': return <CheckCircle size={14} />;
      case 'Đang thực hiện': return <Clock size={14} />;
      default: return <AlertCircle size={14} />;
    }
  };

  const calculateJobProgress = (jobId) => {
    const jobTasks = tasks.filter(t => t.jobId === jobId);
    if (jobTasks.length === 0) return 0;
    const totalProgress = jobTasks.reduce((sum, task) => sum + Number(task.progress), 0);
    return Math.round(totalProgress / jobTasks.length);
  };

  // Job Handlers
  const handleOpenJobForm = (job = null) => {
    if (!activeProjectId) {
      onToast('Vui lòng chọn hoặc tạo dự án trước.', true);
      return;
    }
    if (job) {
      setEditingJob(job);
      setJobFormData({
        name: job.name || '',
        startDate: job.startDate || '',
        endDate: job.endDate || '',
        status: job.status || 'Chưa bắt đầu',
        progress: job.progress || 0
      });
    } else {
      setEditingJob(null);
      setJobFormData({ name: '', startDate: '', endDate: '', status: 'Chưa bắt đầu', progress: 0 });
    }
    setCurrentView('job-form');
  };

  const handleSubmitJob = (e) => {
    e.preventDefault();
    if (!jobFormData.name.trim()) {
      onToast('Vui lòng nhập tên công việc', true);
      return;
    }
    const data = { ...jobFormData, id: editingJob ? editingJob.id : null, projectId: activeProjectId };
    onSaveJob(data);
    
    // Return to appropriate view
    if (editingJob && activeJobId === editingJob.id) {
      setCurrentView('job-detail');
    } else {
      setCurrentView('list');
    }
  };

  // Task Handlers
  const handleOpenTaskForm = (jobId, task = null) => {
    if (!jobId) return;
    setActiveJobId(jobId);
    if (task) {
      setEditingTask(task);
      setTaskFormData({
        name: task.name || '',
        startDate: task.startDate || '',
        endDate: task.endDate || '',
        status: task.status || 'Chưa bắt đầu',
        progress: task.progress || 0,
        assignees: task.assignees || []
      });
    } else {
      setEditingTask(null);
      setTaskFormData({ name: '', startDate: '', endDate: '', status: 'Chưa bắt đầu', progress: 0, assignees: [] });
    }
    setCurrentView('task-form');
  };

  const handleSubmitTask = (e) => {
    e.preventDefault();
    if (!taskFormData.name.trim()) {
      onToast('Vui lòng nhập tên task', true);
      return;
    }
    const data = { 
      ...taskFormData, 
      id: editingTask ? editingTask.id : null,
      jobId: activeJobId,
      projectId: activeProjectId
    };
    onSaveTask(data);
    setCurrentView('job-detail');
  };

  const handleToggleAssignee = (uid) => {
    setTaskFormData(prev => {
      const isAssigned = prev.assignees.includes(uid);
      if (isAssigned) {
        return { ...prev, assignees: prev.assignees.filter(id => id !== uid) };
      } else {
        return { ...prev, assignees: [...prev.assignees, uid] };
      }
    });
  };

  const renderProgressBar = (progress) => {
    const p = Math.min(Math.max(Number(progress), 0), 100);
    let color = '#f44336'; // Red for low progress
    if (p >= 30 && p < 70) color = '#ff9800'; // Orange
    if (p >= 70) color = '#4caf50'; // Green

    return (
      <div className="progress-bar-bg" style={{ width: '100%', backgroundColor: '#333', borderRadius: '4px', height: '8px', marginTop: '8px', overflow: 'hidden' }}>
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${p}%`, 
            backgroundColor: color, 
            height: '100%', 
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }}
        ></div>
      </div>
    );
  };

  // ============================================================================
  // TẦNG 1: TRANG CHỦ - DANH SÁCH DỰ ÁN (PROJECT LIST)
  // ============================================================================
  if (currentView === 'project-list') {
    return (
      <div className="container-fluid task-manager" id="task-manager-panel">
        <div className="section-header" style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle className="icon-blue" size={22} color="var(--accent)" />
            Dự án đang triển khai
          </h2>
        </div>

        {projects.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Chưa có dự án nào. Vui lòng tạo dự án mới ở phần Cài đặt.
          </div>
        ) : (
          <div className="project-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {projects.map(proj => {
              const projJobs = jobs.filter(j => j.projectId === proj.id);
              const projTasks = tasks.filter(t => t.projectId === proj.id);
              return (
                <div 
                  key={proj.id} 
                  className="glass-card clickable"
                  onClick={() => {
                    setActiveProjectId(proj.id);
                    setCurrentView('list');
                  }}
                  style={{ 
                    padding: '20px',
                    borderLeft: '5px solid var(--secondary)',
                    background: 'var(--bg-card)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ 
                      width: '46px', 
                      height: '46px', 
                      borderRadius: '10px', 
                      background: 'linear-gradient(135deg, var(--secondary), #0077b6)', 
                      color: 'white',
                      fontWeight: '800',
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getInitials(proj.name)}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
                        {proj.name}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '8px' }}>
                        <MapPin size={12} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.4' }}>
                          {proj.address || 'Chưa cấu hình địa chỉ'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', fontSize: '0.75rem', color: 'var(--text-light)', background: 'rgba(255,255,255,0.05)', padding: '6px 10px', borderRadius: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FolderOpen size={12} /> <strong>{projJobs.length}</strong> Công việc</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> <strong>{projTasks.length}</strong> Task con</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ============================================================================
  // TẦNG 2: CHI TIẾT DỰ ÁN & DANH SÁCH CÔNG VIỆC (JOB LIST)
  // ============================================================================
  if (currentView === 'list') {
    return (
      <div className="container-fluid task-manager" id="task-manager-panel">
        {/* Header and Back Button */}
        <div className="section-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-icon" 
            onClick={() => setCurrentView('project-list')} 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
            title="Quay lại danh sách dự án"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Chi tiết Dự án
          </h2>
        </div>

        {/* Project Information Card */}
        {activeProject ? (
          <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '46px', height: '46px', borderRadius: '10px', 
                background: 'linear-gradient(135deg, var(--secondary), #0077b6)', 
                color: 'white', fontWeight: '800', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                {getInitials(activeProject.name)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ margin: '0 0 6px 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '700' }}>
                  {activeProject.name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                  <MapPin size={12} style={{ flexShrink: 0, marginTop: '3px' }} />
                  <span style={{ 
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden', lineHeight: '1.4'
                  }}>
                    {activeProject.address || 'Chưa có địa chỉ'}
                  </span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid var(--border)' }}>
                <FolderOpen size={14} color="var(--accent)" /> {activeProjectJobs.length} Công việc
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', border: '1px solid var(--border)' }}>
                <CheckCircle size={14} color="#10b981" /> {tasks.filter(t => t.projectId === activeProject.id).length} Task con
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
            Dự án không tồn tại hoặc đã bị xóa.
          </div>
        )}

        {/* Jobs Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderOpen className="icon-blue" size={18} />
            Các công việc đang triển khai
          </h3>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => handleOpenJobForm()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} /> <span className="hide-on-mobile">Thêm mới</span>
          </button>
        </div>

        {/* Job List */}
        <div className="job-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {activeProjectJobs.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Chưa có công việc nào trong dự án này.
            </div>
          ) : (
            activeProjectJobs.map(job => {
              const jobTasks = tasks.filter(t => t.jobId === job.id);
              const displayProgress = jobTasks.length > 0 ? calculateJobProgress(job.id) : job.progress;

              return (
                <div 
                  key={job.id} 
                  className="glass-card clickable" 
                  onClick={() => {
                    setActiveJobId(job.id);
                    setCurrentView('job-detail');
                  }}
                  style={{ 
                    padding: '20px', 
                    cursor: 'pointer', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.borderColor = 'var(--secondary)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{job.name}</h3>
                        <span className="status-badge" style={{ backgroundColor: getStatusColor(job.status) + '22', color: getStatusColor(job.status), padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', border: `1px solid ${getStatusColor(job.status)}55` }}>
                          {getStatusIcon(job.status)} {job.status}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={14} /> {job.startDate || '--'} đến {job.endDate || '--'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle size={14} /> {jobTasks.length} task con
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenJobForm(job); }} title="Sửa công việc">
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); if(window.confirm('Xóa công việc này và tất cả task con?')) onDeleteJob(job.id); }} title="Xóa công việc">
                        <Trash2 size={16} />
                      </button>
                      <div style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)', marginLeft: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 'bold', marginRight: '4px' }}>Chi tiết</span>
                        <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>{renderProgressBar(displayProgress)}</div>
                    <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-primary)', width: '40px', textAlign: 'right' }}>{displayProgress}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // TẦNG 3: CHI TIẾT CÔNG VIỆC & DANH SÁCH TASK (JOB DETAIL)
  // ============================================================================
  if (currentView === 'job-detail') {
    if (!activeJob) {
      return (
        <div className="container-fluid task-manager" id="task-manager-panel">
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('list')}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
            Công việc không tồn tại.
          </div>
        </div>
      );
    }

    const jobTasks = tasks.filter(t => t.jobId === activeJob.id);
    const displayProgress = jobTasks.length > 0 ? calculateJobProgress(activeJob.id) : activeJob.progress;

    return (
      <div className="container-fluid task-manager" id="task-manager-panel">
        {/* Header and Back Button */}
        <div className="section-header" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-icon" 
            onClick={() => setCurrentView('list')} 
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}
            title="Quay lại Chi tiết Dự án"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
            Chi tiết Công việc
          </h2>
        </div>

        {/* Job Information Section */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.4rem' }}>{activeJob.name}</h3>
                <span className="status-badge" style={{ backgroundColor: getStatusColor(activeJob.status) + '22', color: getStatusColor(activeJob.status), padding: '6px 12px', borderRadius: '12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', border: `1px solid ${getStatusColor(activeJob.status)}55` }}>
                  {getStatusIcon(activeJob.status)} {activeJob.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', color: 'var(--text-secondary)', fontSize: '0.95rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> <strong>Bắt đầu:</strong> {activeJob.startDate || 'Chưa định'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} /> <strong>Kết thúc:</strong> {activeJob.endDate || 'Chưa định'}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-secondary" onClick={() => handleOpenJobForm(activeJob)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Edit size={16} /> Chỉnh sửa
              </button>
            </div>
          </div>

          <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>Tiến độ tổng thể</span>
              <span style={{ color: 'var(--accent)', fontWeight: 'bold' }}>{displayProgress}%</span>
            </div>
            {renderProgressBar(displayProgress)}
          </div>
        </div>

        {/* Tasks Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', gap: '12px' }}>
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle className="icon-blue" size={18} />
            Danh sách Task cần làm ({jobTasks.length})
          </h3>
          <button 
            className="btn btn-primary btn-sm" 
            onClick={() => handleOpenTaskForm(activeJob.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Plus size={14} /> <span className="hide-on-mobile">Thêm Task mới</span>
          </button>
        </div>

        <div className="task-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jobTasks.length === 0 ? (
            <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Chưa có task chi tiết nào cho công việc này.
            </div>
          ) : (
            jobTasks.map(task => (
              <div key={task.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{task.name}</span>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(task.status) + '15', color: getStatusColor(task.status), border: `1px solid ${getStatusColor(task.status)}44`, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {getStatusIcon(task.status)} {task.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} /> {task.startDate || '--'} đến {task.endDate || '--'}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={14} />
                      {task.assignees && task.assignees.length > 0 ? (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {task.assignees.map(uid => {
                            const member = members.find(m => m.uid === uid);
                            return member ? (
                              <span key={uid} style={{ background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-primary)' }}>
                                {member.displayName}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontStyle: 'italic' }}>Chưa phân công</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '12px' }}>
                    <div style={{ flex: 1 }}>{renderProgressBar(task.progress)}</div>
                    <span style={{ color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.85rem', width: '35px', textAlign: 'right' }}>{task.progress}%</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px', borderLeft: '1px solid var(--border)', paddingLeft: '16px' }}>
                  <button className="btn-icon" onClick={() => handleOpenTaskForm(activeJob.id, task)} title="Sửa Task">
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon danger" onClick={() => { if(window.confirm('Bạn có chắc chắn muốn xóa task này?')) onDeleteTask(task.id); }} title="Xóa Task">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render Job Form View
  // ============================================================================
  if (currentView === 'job-form') {
    return (
      <div className="container-fluid task-manager" id="task-manager-panel">
        <div className="section-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView(activeJobId === editingJob?.id ? 'job-detail' : 'list')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingJob ? 'Sửa Công việc' : 'Thêm Công việc mới'}
          </h2>
        </div>
        
        <div className="form-card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmitJob} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Tên hạng mục công việc *</label>
              <input 
                type="text" 
                className="form-control" 
                value={jobFormData.name} 
                onChange={e => setJobFormData({...jobFormData, name: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Ngày bắt đầu</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={jobFormData.startDate} 
                  onChange={e => setJobFormData({...jobFormData, startDate: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Ngày kết thúc</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={jobFormData.endDate} 
                  onChange={e => setJobFormData({...jobFormData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Trạng thái</label>
                <select 
                  className="form-control" 
                  value={jobFormData.status} 
                  onChange={e => setJobFormData({...jobFormData, status: e.target.value})}
                >
                  <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tiến độ (%)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0" max="100"
                  value={jobFormData.progress} 
                  onChange={e => setJobFormData({...jobFormData, progress: e.target.value})}
                />
                <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '6px' }}>Tự động tính nếu có Task con</small>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCurrentView(activeJobId === editingJob?.id ? 'job-detail' : 'list')}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu Công việc
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // Render Task Form View
  // ============================================================================
  if (currentView === 'task-form') {
    return (
      <div className="container-fluid task-manager" id="task-manager-panel">
        <div className="section-header" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentView('job-detail')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} /> Quay lại
          </button>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            {editingTask ? 'Sửa Task chi tiết' : 'Thêm Task mới'}
          </h2>
        </div>
        
        <div className="form-card" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <form onSubmit={handleSubmitTask} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label>Tên task *</label>
              <input 
                type="text" 
                className="form-control" 
                value={taskFormData.name} 
                onChange={e => setTaskFormData({...taskFormData, name: e.target.value})}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Ngày bắt đầu</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={taskFormData.startDate} 
                  onChange={e => setTaskFormData({...taskFormData, startDate: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Ngày kết thúc</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={taskFormData.endDate} 
                  onChange={e => setTaskFormData({...taskFormData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Trạng thái</label>
                <select 
                  className="form-control" 
                  value={taskFormData.status} 
                  onChange={e => setTaskFormData({...taskFormData, status: e.target.value})}
                >
                  <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  <option value="Đang thực hiện">Đang thực hiện</option>
                  <option value="Hoàn thành">Hoàn thành</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label>Tiến độ (%)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  min="0" max="100"
                  value={taskFormData.progress} 
                  onChange={e => setTaskFormData({...taskFormData, progress: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label>Phân công nhân sự</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                {members.map(member => {
                  const isAssigned = taskFormData.assignees.includes(member.uid);
                  return (
                    <div 
                      key={member.uid} 
                      onClick={() => handleToggleAssignee(member.uid)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        backgroundColor: isAssigned ? 'rgba(0, 229, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: isAssigned ? 'var(--accent)' : 'var(--text-secondary)',
                        border: `1px solid ${isAssigned ? 'var(--accent)' : 'var(--border)'}`,
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <UserAvatar name={member.displayName} />
                      {member.displayName}
                    </div>
                  );
                })}
                {members.length === 0 && <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Chưa có thành viên nào trong hệ thống.</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', borderTop: '1px solid var(--border)', paddingTop: '20px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCurrentView('job-detail')}>
                Hủy
              </button>
              <button type="submit" className="btn btn-primary">
                Lưu Task
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return null;
}

function UserAvatar({ name }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div style={{ 
      width: '20px', 
      height: '20px', 
      borderRadius: '50%', 
      backgroundColor: '#3b82f6', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '10px',
      fontWeight: 'bold'
    }}>
      {initial}
    </div>
  );
}
