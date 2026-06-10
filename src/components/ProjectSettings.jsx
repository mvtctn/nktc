import React, { useState, useEffect } from 'react';
import { db, isValidConfig } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Briefcase, MapPin, Building, ShieldCheck, Award, Layers, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

export default function ProjectSettings({ user, activeProjectId, setActiveProjectId, onToast }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [investor, setInvestor] = useState('');
  const [contractorA, setContractorA] = useState('');
  const [contractorB, setContractorB] = useState('CÔNG TY CỔ PHẦN HYDROTECH');
  const [packageName, setPackageName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [supervisor, setSupervisor] = useState('');

  const isOffline = user.uid === 'offline_local_user';

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      if (isOffline || !isValidConfig) {
        // Load from LocalStorage
        const localProjs = localStorage.getItem('hydrotech_projects');
        if (localProjs) {
          setProjects(JSON.parse(localProjs));
        } else {
          // Add a default sample project if empty
          const sample = [
            {
              id: 'sample-project-id',
              name: 'Nhà máy Johnson Health Tech Industry (Thuận Thành 1)',
              address: 'Lô CN2-1, KCN Thuận Thành 1, Bắc Ninh, Việt Nam',
              investor: 'TẬP ĐOÀN JOHNSON HEALTH TECH',
              contractorA: 'CÔNG TY CP THIẾT KẾ VÀ XÂY DỰNG GIZA VIỆT NAM',
              contractorB: 'CÔNG TY CỔ PHẦN HYDROTECH',
              packageName: 'Cung cấp lắp đặt hệ thống thoát nước mưa Siphonic',
              categoryName: 'Hệ thống thoát nước mái siphonic xưởng 1 & xưởng 2',
              supervisor: user.displayName || 'Kỹ sư Hydrotech'
            }
          ];
          localStorage.setItem('hydrotech_projects', JSON.stringify(sample));
          setProjects(sample);
          if (!activeProjectId) setActiveProjectId('sample-project-id');
        }
      } else {
        // Load from Firestore
        const querySnapshot = await getDocs(collection(db, 'projects'));
        const list = [];
        querySnapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() });
        });
        setProjects(list);
        if (list.length > 0 && !activeProjectId) {
          setActiveProjectId(list[0].id);
        }
      }
    } catch (e) {
      console.error(e);
      onToast('Không thể tải danh sách dự án', true);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const projectData = {
      name,
      address,
      investor,
      contractorA,
      contractorB,
      packageName,
      categoryName,
      supervisor
    };

    try {
      if (isOffline || !isValidConfig) {
        // LocalStorage save
        let updatedList = [...projects];
        if (editingId) {
          updatedList = updatedList.map(p => p.id === editingId ? { ...p, ...projectData } : p);
          onToast('Cập nhật dự án thành công');
        } else {
          const newProj = { id: 'proj_' + Date.now(), ...projectData };
          updatedList.push(newProj);
          if (!activeProjectId) setActiveProjectId(newProj.id);
          onToast('Thêm dự án mới thành công');
        }
        localStorage.setItem('hydrotech_projects', JSON.stringify(updatedList));
        setProjects(updatedList);
      } else {
        // Firestore save
        if (editingId) {
          await updateDoc(doc(db, 'projects', editingId), projectData);
          onToast('Cập nhật dự án thành công');
        } else {
          const docRef = await addDoc(collection(db, 'projects'), projectData);
          if (!activeProjectId) setActiveProjectId(docRef.id);
          onToast('Thêm dự án mới thành công');
        }
        await fetchProjects();
      }
      clearForm();
    } catch (err) {
      console.error(err);
      onToast('Lỗi khi lưu dự án', true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dự án này? Tất cả nhật ký liên kết có thể bị ảnh hưởng.')) return;
    try {
      if (isOffline || !isValidConfig) {
        const updatedList = projects.filter(p => p.id !== id);
        localStorage.setItem('hydrotech_projects', JSON.stringify(updatedList));
        setProjects(updatedList);
        if (activeProjectId === id) {
          setActiveProjectId(updatedList.length > 0 ? updatedList[0].id : '');
        }
        onToast('Xóa dự án thành công');
      } else {
        await deleteDoc(doc(db, 'projects', id));
        if (activeProjectId === id) {
          setActiveProjectId('');
        }
        onToast('Xóa dự án thành công');
        await fetchProjects();
      }
    } catch (e) {
      console.error(e);
      onToast('Lỗi khi xóa dự án', true);
    }
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setName(p.name || '');
    setAddress(p.address || '');
    setInvestor(p.investor || '');
    setContractorA(p.contractorA || '');
    setContractorB(p.contractorB || 'CÔNG TY CỔ PHẦN HYDROTECH');
    setPackageName(p.packageName || '');
    setCategoryName(p.categoryName || '');
    setSupervisor(p.supervisor || '');
  };

  const clearForm = () => {
    setEditingId(null);
    setName('');
    setAddress('');
    setInvestor('');
    setContractorA('');
    setContractorB('CÔNG TY CỔ PHẦN HYDROTECH');
    setPackageName('');
    setCategoryName('');
    setSupervisor('');
  };

  return (
    <div className="container-fluid" id="project-settings-panel">
      <div className="panel-header">
        <h2 className="panel-title"><Briefcase size={20} /> Cài đặt & Quản lý Dự án</h2>
      </div>

      <div className="dashboard-grid">
        {/* Form add/edit project */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--primary-light)', fontWeight: '700' }}>
            {editingId ? 'Chỉnh sửa dự án' : 'Thêm dự án mới'}
          </h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Tên dự án / Công trình *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhà máy Huali Việt Nam..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Địa chỉ xây dựng</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="KCN Thái Nguyên..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label">Chủ đầu tư</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tập đoàn Huali..."
                  value={investor}
                  onChange={(e) => setInvestor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tổng thầu (Bên A)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Công ty GIZA..."
                  value={contractorA}
                  onChange={(e) => setContractorA(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label">Nhà thầu thi công (Bên B)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Hydrotech..."
                  value={contractorB}
                  onChange={(e) => setContractorB(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gói thầu</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Thoát nước mưa Siphonic..."
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="form-group">
                <label className="form-label">Hạng mục thi công</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Lắp đặt đường ống..."
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Kỹ sư giám sát / Chỉ huy</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nguyễn Văn A..."
                  value={supervisor}
                  onChange={(e) => setSupervisor(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button type="submit" className="btn btn-primary">
                <Plus size={16} /> {editingId ? 'Cập nhật' : 'Thêm dự án'}
              </button>
              {editingId && (
                <button type="button" onClick={clearForm} className="btn btn-secondary">
                  Hủy
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Project List */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--primary-light)', fontWeight: '700' }}>
            Danh sách dự án hoạt động ({projects.length})
          </h3>
          {loading ? (
            <div style={{ padding: '40px', display: 'flex', justifyContent: 'center' }}>
              <div className="spinner" style={{ borderTopColor: 'var(--secondary)' }}></div>
            </div>
          ) : projects.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '40px' }}>
              Chưa có dự án nào được tạo. Hãy nhập dự án đầu tiên của bạn bên cạnh.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', flex: 1, maxHeight: '420px' }}>
              {projects.map((proj) => (
                <div 
                  key={proj.id} 
                  className={`glass-card ${activeProjectId === proj.id ? 'active' : ''}`}
                  style={{ 
                    padding: '14px', 
                    borderLeft: activeProjectId === proj.id ? '4px solid var(--secondary)' : '1px solid var(--border)',
                    background: activeProjectId === proj.id ? 'rgba(0, 180, 216, 0.03)' : '',
                    cursor: 'default'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ cursor: 'pointer', flex: 1 }} onClick={() => setActiveProjectId(proj.id)}>
                      <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {proj.name}
                        {activeProjectId === proj.id && <CheckCircle2 size={16} color="var(--secondary)" />}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={12} /> {proj.address || 'Không có địa chỉ'}
                      </p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '8px', fontSize: '0.725rem', color: 'var(--text-light)' }}>
                        <div><strong>Chủ đầu tư:</strong> {proj.investor || '-'}</div>
                        <div><strong>Gói thầu:</strong> {proj.packageName || '-'}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => handleEdit(proj)} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }} title="Sửa">
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => handleDelete(proj.id)} className="btn btn-danger btn-sm" style={{ padding: '4px 8px' }} title="Xóa">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
