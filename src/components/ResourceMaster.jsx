import React, { useState } from 'react';
import { Wrench, Layers, Plus, X } from 'lucide-react';

export default function ResourceMaster({
  equipmentMaster = [],
  onSaveEquipmentMaster,
  materialMaster = [],
  onSaveMaterialMaster,
  isSuperAdmin = false,
  onToast
}) {
  const [newEqInput, setNewEqInput] = useState('');
  const [newMatInput, setNewMatInput] = useState('');

  const addEquipmentMaster = () => {
    const val = newEqInput.trim();
    if (!val) return;
    if (!equipmentMaster.includes(val)) {
      onSaveEquipmentMaster([...equipmentMaster, val]);
      onToast('Thêm thiết bị thành công');
    } else {
      onToast('Thiết bị này đã tồn tại', true);
    }
    setNewEqInput('');
  };

  const removeEquipmentMaster = (idx) => {
    if (!isSuperAdmin) {
      onToast('Bạn không có quyền xóa thiết bị khỏi danh mục dùng chung. Chỉ Super Admin mới có quyền này.', true);
      return;
    }
    onSaveEquipmentMaster(equipmentMaster.filter((_, i) => i !== idx));
    onToast('Xóa thiết bị thành công');
  };

  const addMaterialMaster = () => {
    const val = newMatInput.trim();
    if (!val) return;
    if (!materialMaster.includes(val)) {
      onSaveMaterialMaster([...materialMaster, val]);
      onToast('Thêm vật liệu thành công');
    } else {
      onToast('Vật liệu này đã tồn tại', true);
    }
    setNewMatInput('');
  };

  const removeMaterialMaster = (idx) => {
    if (!isSuperAdmin) {
      onToast('Bạn không có quyền xóa vật liệu khỏi danh mục dùng chung. Chỉ Super Admin mới có quyền này.', true);
      return;
    }
    onSaveMaterialMaster(materialMaster.filter((_, i) => i !== idx));
    onToast('Xóa vật liệu thành công');
  };

  const [activeTab, setActiveTab] = useState('equipment');

  return (
    <div className="container-fluid" id="resource-master-panel">
      <div className="panel-header" style={{ marginBottom: '24px' }}>
        <h2 className="panel-title" style={{ fontSize: '1.5rem', fontWeight: '800' }}>
          <Wrench size={24} /> Quản lý Vật tư - Thiết bị
        </h2>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Danh mục dùng chung để chọn nhanh khi nhập nhật ký thi công cho tất cả các dự án.
        </span>
      </div>

      <div className="tabs" style={{ display: 'flex', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button
          className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'equipment' ? '2px solid var(--accent)' : '2px solid transparent',
            color: activeTab === 'equipment' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'equipment' ? '600' : '400',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          <Wrench size={18} color={activeTab === 'equipment' ? 'var(--accent)' : 'currentColor'} />
          Thiết bị thi công
        </button>
        <button
          className={`tab-btn ${activeTab === 'material' ? 'active' : ''}`}
          onClick={() => setActiveTab('material')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'material' ? '2px solid var(--success)' : '2px solid transparent',
            color: activeTab === 'material' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'material' ? '600' : '400',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1rem',
            transition: 'all 0.2s'
          }}
        >
          <Layers size={18} color={activeTab === 'material' ? 'var(--success)' : 'currentColor'} />
          Vật liệu thi công
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'equipment' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Vd: Máy hàn đối đầu HDPE, Khoan bê tông..."
                value={newEqInput}
                onChange={(e) => setNewEqInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEquipmentMaster(); } }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0 20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={addEquipmentMaster}
                title="Thêm thiết bị"
              >
                <Plus size={18} /> Thêm mới
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', width: '60px', color: 'var(--text-secondary)', fontWeight: '600' }}>STT</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '600' }}>Tên thiết bị</th>
                    {isSuperAdmin && <th style={{ padding: '12px 16px', width: '100px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {equipmentMaster.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 3 : 2} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Chưa có thiết bị nào — thêm để nhập liệu nhanh hơn
                      </td>
                    </tr>
                  ) : (
                    equipmentMaster.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: '500' }}>{item}</td>
                        {isSuperAdmin && (
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeEquipmentMaster(i)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                              title="Xóa"
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                              <X size={16} color="#ef4444" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'material' && (
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Vd: Ống HDPE DN110, Phụ kiện siphonic..."
                value={newMatInput}
                onChange={(e) => setNewMatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addMaterialMaster(); } }}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '0 20px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--success)' }}
                onClick={addMaterialMaster}
                title="Thêm vật liệu"
              >
                <Plus size={18} /> Thêm mới
              </button>
            </div>
            
            <div className="table-responsive">
              <table className="table table-hover" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '12px 16px', width: '60px', color: 'var(--text-secondary)', fontWeight: '600' }}>STT</th>
                    <th style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: '600' }}>Tên vật liệu</th>
                    {isSuperAdmin && <th style={{ padding: '12px 16px', width: '100px', color: 'var(--text-secondary)', fontWeight: '600', textAlign: 'center' }}>Thao tác</th>}
                  </tr>
                </thead>
                <tbody>
                  {materialMaster.length === 0 ? (
                    <tr>
                      <td colSpan={isSuperAdmin ? 3 : 2} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                        Chưa có vật liệu nào — thêm để nhập liệu nhanh hơn
                      </td>
                    </tr>
                  ) : (
                    materialMaster.map((item, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-primary)', fontWeight: '500' }}>{item}</td>
                        {isSuperAdmin && (
                          <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => removeMaterialMaster(i)}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                              title="Xóa"
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                              <X size={16} color="#ef4444" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
