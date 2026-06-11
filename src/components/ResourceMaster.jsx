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

      <div className="dashboard-grid">
        {/* Equipment Master */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wrench size={18} color="var(--accent)" /> Thiết bị thi công
          </h4>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '32px' }}>
            {equipmentMaster.length === 0 ? (
              <div style={{ padding: '20px', width: '100%', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                Chưa có thiết bị nào — thêm để nhập liệu nhanh hơn
              </div>
            ) : (
              equipmentMaster.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(0,180,216,0.08)',
                    border: '1px solid rgba(0,180,216,0.22)',
                    borderRadius: '24px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {item}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => removeEquipmentMaster(i)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      title="Xóa"
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <X size={14} color="#ef4444" />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Material Master */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={18} color="#10b981" /> Vật liệu thi công
          </h4>
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', minHeight: '32px' }}>
            {materialMaster.length === 0 ? (
              <div style={{ padding: '20px', width: '100%', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
                Chưa có vật liệu nào — thêm để nhập liệu nhanh hơn
              </div>
            ) : (
              materialMaster.map((item, i) => (
                <span
                  key={i}
                  style={{
                    padding: '8px 14px',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px solid rgba(16,185,129,0.22)',
                    borderRadius: '24px',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {item}
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => removeMaterialMaster(i)}
                      style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                      title="Xóa"
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      <X size={14} color="#ef4444" />
                    </button>
                  )}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
