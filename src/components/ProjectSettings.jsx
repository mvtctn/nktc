import React, { useState, useEffect } from 'react';
import { db, isValidConfig } from '../firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Briefcase, MapPin, Building, ShieldCheck, Award, Layers, Plus, Trash2, Edit2, CheckCircle2, Wrench, X } from 'lucide-react';

export default function ProjectSettings({
  user,
  activeProjectId,
  setActiveProjectId,
  onToast,
  equipmentMaster = [],
  onSaveEquipmentMaster,
  materialMaster = [],
  onSaveMaterialMaster,
}) {
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

  // Local state for the global master list inputs
  const [newEqInput, setNewEqInput] = useState('');
  const [newMatInput, setNewMatInput] = useState('');

  const addEquipmentMaster = () => {
    const val = newEqInput.trim();
    if (!val) return;
    if (!equipmentMaster.includes(val)) {
      onSaveEquipmentMaster([...equipmentMaster, val]);
    }
    setNewEqInput('');
  };

  const removeEquipmentMaster = (idx) => {
    onSaveEquipmentMaster(equipmentMaster.filter((_, i) => i !== idx));
  };

  const addMaterialMaster = () => {
    const val = newMatInput.trim();
    if (!val) return;
    if (!materialMaster.includes(val)) {
      onSaveMaterialMaster([...materialMaster, val]);
    }
    setNewMatInput('');
  };

  const removeMaterialMaster = (idx) => {
    onSaveMaterialMaster(materialMaster.filter((_, i) => i !== idx));
  };

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
    <>
    <div className="container-fluid" id="project-settings-panel">
      <div className="panel-header">
        <h2 className="panel-title"><Briefcase size={20} /> Cài đặt & Quản lý Dự án</h2>
      </div>

      <div className="dashboard-grid">
        {/* Form add/edit project */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
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
          <h3 style={{ marginBottom: '16px', fontSize: '1rem', color: 'var(--text-primary)', fontWeight: '700' }}>
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
                      <h4 style={{ fontSize: '0.925rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
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

      {/* ===== Global Master Lists (Shared across all projects) ===== */}
      <div style={{ marginTop: '24px' }}>
        <div className="panel-header" style={{ marginBottom: '16px' }}>
          <h3 className="panel-title" style={{ color: 'var(--text-primary)' }}>
            <Wrench size={18} /> Danh mục Thiết bị &amp; Vật liệu dùng chung
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            Lưu sẵn để chọn nhanh khi nhập nhật ký
          </span>
        </div>

        <div className="dashboard-grid">
          {/* Equipment Master */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wrench size={15} color="var(--accent)" /> Thiết bị thi công
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Vd: Máy hàn đối đầu HDPE, Khoan bê tông..."
                value={newEqInput}
                onChange={(e) => setNewEqInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEquipmentMaster(); } }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '10px', flexShrink: 0 }}
                onClick={addEquipmentMaster}
                title="Thêm thiết bị"
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
              {equipmentMaster.length === 0 ? (
                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Chưa có thiết bị nào — thêm để nhập liệu nhanh hơn
                </span>
              ) : (
                equipmentMaster.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(0,180,216,0.08)',
                      border: '1px solid rgba(0,180,216,0.22)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeEquipmentMaster(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      title="Xóa"
                    >
                      <X size={12} color="#ef4444" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Material Master */}
          <div className="glass-card">
            <h4 style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={15} color="#10b981" /> Vật liệu thi công
            </h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Vd: Ống HDPE DN110, Phụ kiện siphonic..."
                value={newMatInput}
                onChange={(e) => setNewMatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterialMaster(); } }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '10px', flexShrink: 0 }}
                onClick={addMaterialMaster}
                title="Thêm vật liệu"
              >
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', minHeight: '32px' }}>
              {materialMaster.length === 0 ? (
                <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                  Chưa có vật liệu nào — thêm để nhập liệu nhanh hơn
                </span>
              ) : (
                materialMaster.map((item, i) => (
                  <span
                    key={i}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(16,185,129,0.08)',
                      border: '1px solid rgba(16,185,129,0.22)',
                      borderRadius: '20px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeMaterialMaster(i)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                      title="Xóa"
                    >
                      <X size={12} color="#ef4444" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
    </>
  );
}
