import React, { useState } from 'react';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Users
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
  const [expandedJobs, setExpandedJobs] = useState({});
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [activeJobIdForTask, setActiveJobIdForTask] = useState(null);

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

  const activeProjectJobs = jobs.filter(j => j.projectId === activeProjectId);
  const activeProjectTasks = tasks.filter(t => t.projectId === activeProjectId);

  const toggleJob = (jobId) => {
    setExpandedJobs(prev => ({ ...prev, [jobId]: !prev[jobId] }));
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
    const jobTasks = activeProjectTasks.filter(t => t.jobId === jobId);
    if (jobTasks.length === 0) return 0;
    const totalProgress = jobTasks.reduce((sum, task) => sum + Number(task.progress), 0);
    return Math.round(totalProgress / jobTasks.length);
  };

  // Job Handlers
  const handleOpenJobModal = (job = null) => {
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
    setJobModalOpen(true);
  };

  const handleSubmitJob = (e) => {
    e.preventDefault();
    if (!jobFormData.name.trim()) {
      onToast('Vui lòng nhập tên công việc', true);
      return;
    }
    const data = { ...jobFormData, id: editingJob ? editingJob.id : null };
    onSaveJob(data);
    setJobModalOpen(false);
  };

  // Task Handlers
  const handleOpenTaskModal = (jobId, task = null) => {
    setActiveJobIdForTask(jobId);
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
    setTaskModalOpen(true);
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
      jobId: activeJobIdForTask 
    };
    onSaveTask(data);
    setTaskModalOpen(false);
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
      <div className="progress-bar-bg" style={{ width: '100%', backgroundColor: '#333', borderRadius: '4px', height: '8px', marginTop: '8px' }}>
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

  return (
    <div className="task-manager">
      <div className="section-header">
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle className="icon-blue" />
          Quản lý Công việc & Tiến độ
        </h2>
      </div>

      {/* Project Selector */}
      <div className="project-selector-container form-card">
        <div className="form-group">
          <label>Dự án hiện tại</label>
          <select 
            value={activeProjectId || ''} 
            onChange={(e) => setActiveProjectId(e.target.value)}
            className="form-input"
          >
            {projects.length === 0 && <option value="">-- Chưa có dự án nào --</option>}
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button className="btn btn-primary" onClick={() => handleOpenJobModal()}>
          <Plus size={18} /> Thêm Công việc mới
        </button>
      </div>

      {/* Job List */}
      <div className="job-list">
        {activeProjectJobs.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có công việc nào trong dự án này.</p>
          </div>
        ) : (
          activeProjectJobs.map(job => {
            const isExpanded = expandedJobs[job.id];
            const jobTasks = activeProjectTasks.filter(t => t.jobId === job.id);
            // Auto calculate progress if there are tasks, else use job's manually set progress
            const displayProgress = jobTasks.length > 0 ? calculateJobProgress(job.id) : job.progress;

            return (
              <div key={job.id} className="job-card" style={{ backgroundColor: '#1a2234', borderRadius: '8px', marginBottom: '16px', border: '1px solid #2a3441', overflow: 'hidden' }}>
                <div 
                  className="job-header" 
                  style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', borderBottom: isExpanded ? '1px solid #2a3441' : 'none' }}
                  onClick={() => toggleJob(job.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#fff' }}>{job.name}</h3>
                      <span className="status-badge" style={{ backgroundColor: getStatusColor(job.status) + '33', color: getStatusColor(job.status), padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {getStatusIcon(job.status)} {job.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#8892b0', marginTop: '8px', display: 'flex', gap: '16px' }}>
                      <span>Bắt đầu: {job.startDate || '---'}</span>
                      <span>Kết thúc: {job.endDate || '---'}</span>
                      <span>Tiến độ tổng: {displayProgress}%</span>
                    </div>
                    {renderProgressBar(displayProgress)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '16px' }}>
                    <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleOpenJobModal(job); }} title="Sửa công việc">
                      <Edit size={16} />
                    </button>
                    <button className="btn-icon danger" onClick={(e) => { e.stopPropagation(); if(window.confirm('Xóa công việc này và tất cả task con?')) onDeleteJob(job.id); }} title="Xóa công việc">
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="job-body" style={{ padding: '16px', backgroundColor: '#0f1623' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ margin: 0, color: '#a0aec0' }}>Danh sách Task chi tiết ({jobTasks.length})</h4>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenTaskModal(job.id)}>
                        <Plus size={14} /> Thêm Task
                      </button>
                    </div>

                    {jobTasks.length === 0 ? (
                      <div style={{ color: '#666', fontStyle: 'italic', fontSize: '0.9rem' }}>Chưa có task chi tiết nào.</div>
                    ) : (
                      <div className="task-grid" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {jobTasks.map(task => (
                          <div key={task.id} className="task-item" style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '500', color: '#e2e8f0' }}>{task.name}</span>
                                <span className="status-badge" style={{ backgroundColor: getStatusColor(task.status) + '22', color: getStatusColor(task.status), padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem' }}>
                                  {task.status}
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.85rem', color: '#94a3b8' }}>
                                <span>{task.startDate} - {task.endDate}</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <Users size={12} />
                                  {task.assignees && task.assignees.length > 0 ? (
                                    <span>
                                      {task.assignees.map(uid => members.find(m => m.uid === uid)?.displayName || 'Unknown').join(', ')}
                                    </span>
                                  ) : (
                                    <span style={{ color: '#64748b' }}>Chưa phân công</span>
                                  )}
                                </div>
                                <span style={{ color: '#38bdf8' }}>{task.progress}%</span>
                              </div>
                              <div style={{ marginTop: '4px' }}>
                                {renderProgressBar(task.progress)}
                              </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
                              <button className="btn-icon small" onClick={() => handleOpenTaskModal(job.id, task)}>
                                <Edit size={14} />
                              </button>
                              <button className="btn-icon danger small" onClick={() => { if(window.confirm('Xóa task này?')) onDeleteTask(task.id); }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Job */}
      {jobModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingJob ? 'Sửa Công việc' : 'Thêm Công việc mới'}</h3>
            </div>
            <form onSubmit={handleSubmitJob}>
              <div className="modal-body">
                <div className="form-group">
                <label>Tên hạng mục công việc *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={jobFormData.name} 
                  onChange={e => setJobFormData({...jobFormData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={jobFormData.startDate} 
                    onChange={e => setJobFormData({...jobFormData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày kết thúc</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={jobFormData.endDate} 
                    onChange={e => setJobFormData({...jobFormData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Trạng thái</label>
                  <select 
                    className="form-input" 
                    value={jobFormData.status} 
                    onChange={e => setJobFormData({...jobFormData, status: e.target.value})}
                  >
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tiến độ (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0" max="100"
                    value={jobFormData.progress} 
                    onChange={e => setJobFormData({...jobFormData, progress: e.target.value})}
                  />
                  <small style={{ color: '#8892b0' }}>Tự động tính nếu có Task con</small>
                </div>
              </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setJobModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Công việc</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Task */}
      {taskModalOpen && (
        <div className="modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="modal-card" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title">{editingTask ? 'Sửa Task chi tiết' : 'Thêm Task mới'}</h3>
            </div>
            <form onSubmit={handleSubmitTask}>
              <div className="modal-body">
                <div className="form-group">
                <label>Tên task *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={taskFormData.name} 
                  onChange={e => setTaskFormData({...taskFormData, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày bắt đầu</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={taskFormData.startDate} 
                    onChange={e => setTaskFormData({...taskFormData, startDate: e.target.value})}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Ngày kết thúc</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={taskFormData.endDate} 
                    onChange={e => setTaskFormData({...taskFormData, endDate: e.target.value})}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Trạng thái</label>
                  <select 
                    className="form-input" 
                    value={taskFormData.status} 
                    onChange={e => setTaskFormData({...taskFormData, status: e.target.value})}
                  >
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Tiến độ (%)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0" max="100"
                    value={taskFormData.progress} 
                    onChange={e => setTaskFormData({...taskFormData, progress: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Phân công nhân sự</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: '#1a2234', borderRadius: '4px', border: '1px solid #2a3441' }}>
                  {members.map(member => {
                    const isAssigned = taskFormData.assignees.includes(member.uid);
                    return (
                      <div 
                        key={member.uid} 
                        onClick={() => handleToggleAssignee(member.uid)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '16px',
                          backgroundColor: isAssigned ? '#00e5ff22' : '#2a3441',
                          color: isAssigned ? '#00e5ff' : '#a0aec0',
                          border: `1px solid ${isAssigned ? '#00e5ff' : '#2a3441'}`,
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <UserAvatar name={member.displayName} />
                        {member.displayName}
                      </div>
                    );
                  })}
                  {members.length === 0 && <span style={{ color: '#8892b0', fontSize: '0.9rem' }}>Chưa có thành viên nào trong hệ thống.</span>}
                </div>
              </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setTaskModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Task</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
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
