import React, { useState, useEffect } from 'react';
import { exportBBPStoWord } from '../utils/WordExporter';
import { Save, FileText, Plus, Trash2, Calendar, FileSpreadsheet, Building, Users, AlertTriangle, Lightbulb } from 'lucide-react';

export default function BBPSForm({
  user,
  project,
  initialData,
  onSave,
  onToast
}) {
  // Form State
  const [ngay, setNgay] = useState('');
  const [dai_dien_a, setDaiDienA] = useState('');
  const [chuc_vu_a, setChucVuA] = useState('Kỹ sư giám sát');
  const [dai_dien_b, setDaiDienB] = useState('');
  const [chuc_vu_b, setChucVuB] = useState('Chỉ huy trưởng');
  
  // Incident Contents
  const [vi_tri, setViTri] = useState('');
  const [su_viec, setSuViec] = useState('');
  const [nguyen_nhan, setNguyenNhan] = useState('');
  const [anh_huong, setAnhHuong] = useState('');
  const [de_xuat, setDeXuat] = useState('');

  useEffect(() => {
    if (initialData) {
      setNgay(initialData.ngay || getTodayDateString());
      setDaiDienA(initialData.dai_dien_a || '');
      setChucVuA(initialData.chuc_vu_a || 'Kỹ sư giám sát');
      setDaiDienB(initialData.dai_dien_b || (project ? project.supervisor : user.displayName || ''));
      setChucVuB(initialData.chuc_vu_b || 'Chỉ huy trưởng');
      setViTri(initialData.vi_tri || '');
      setSuViec(initialData.su_viec || '');
      setNguyenNhan(initialData.nguyen_nhan || '');
      setAnhHuong(initialData.anh_huong || '');
      setDeXuat(initialData.de_xuat || '');
    } else {
      setNgay(getTodayDateString());
      setDaiDienB(project ? project.supervisor : user.displayName || '');
      // Clear incident details
      setViTri('');
      setSuViec('');
      setNguyenNhan('');
      setAnhHuong('');
      setDeXuat('');
    }
  }, [initialData, project]);

  const getTodayDateString = () => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSave = () => {
    if (!vi_tri || !su_viec) {
      onToast('Vui lòng điền Vị trí và Nội dung sự việc', true);
      return;
    }

    const dataToSave = {
      ngay,
      dai_dien_a,
      chuc_vu_a,
      dai_dien_b,
      chuc_vu_b,
      vi_tri,
      su_viec,
      nguyen_nhan,
      anh_huong,
      de_xuat
    };
    onSave(dataToSave);
  };

  const handleExportWord = () => {
    onToast('Đang tạo và xuất biên bản...');
    exportBBPStoWord(
      {
        ngay,
        dai_dien_a,
        chuc_vu_a,
        dai_dien_b,
        chuc_vu_b,
        vi_tri,
        su_viec,
        nguyen_nhan,
        anh_huong,
        de_xuat
      },
      project
    );
    onToast('Xuất Biên bản hiện trường (.docx) thành công!');
  };

  return (
    <div className="container-fluid" id="bbps-form-panel">
      <div className="dashboard-grid">
        {/* Left Side: Form inputs */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="panel-header" style={{ marginBottom: '0' }}>
            <h3 className="panel-title"><FileSpreadsheet size={18} /> Nhập Biên bản hiện trường / Phát sinh</h3>
          </div>

          <div className="form-group">
            <label className="form-label"><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} /> Ngày lập biên bản</label>
            <input
              type="text"
              className="form-control"
              placeholder="DD/MM/YYYY"
              value={ngay}
              onChange={(e) => setNgay(e.value || e.target.value)}
            />
          </div>

          {/* Representatives */}
          <div style={{ padding: '12px', background: 'rgba(0,180,216,0.03)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)' }}>
              <Users size={14} /> Đại diện các bên tham gia
            </h4>
            
            <div className="input-row">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Đại diện Tổng thầu (Bên A)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Họ và tên..."
                  value={dai_dien_a}
                  onChange={(e) => setDaiDienA(e.value || e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Chức vụ bên A</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Kỹ sư giám sát..."
                  value={chuc_vu_a}
                  onChange={(e) => setChucVuA(e.value || e.target.value)}
                />
              </div>
            </div>

            <div className="input-row" style={{ marginTop: '10px' }}>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Đại diện Hydrotech (Bên B)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Họ và tên..."
                  value={dai_dien_b}
                  onChange={(e) => setDaiDienB(e.value || e.target.value)}
                />
              </div>
              <div className="form-group" style={{ marginBottom: '0' }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Chức vụ bên B</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Chỉ huy trưởng..."
                  value={chuc_vu_b}
                  onChange={(e) => setChucVuB(e.value || e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Incident Content */}
          <div style={{ padding: '12px', background: 'rgba(239,68,68,0.02)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626' }}>
              <AlertTriangle size={14} /> Nội dung sự việc / phát sinh
            </h4>
            
            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Vị trí hiện trường xảy ra *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Cao độ trục A-B tại tầng 1 xưởng 1"
                value={vi_tri}
                onChange={(e) => setViTri(e.value || e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Sự việc xảy ra *</label>
              <textarea
                className="form-control"
                placeholder="Ví dụ: Vướng ống thông gió của nhà thầu khác, không thể gá lắp ống Siphonic..."
                value={su_viec}
                onChange={(e) => setSuViec(e.value || e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Nguyên nhân</label>
              <input
                type="text"
                className="form-control"
                placeholder="Nhập nguyên nhân..."
                value={nguyen_nhan}
                onChange={(e) => setNguyenNhan(e.value || e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '0' }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Đánh giá ảnh hưởng (nếu có)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Chậm tiến độ thi công lắp đặt 2 ngày..."
                value={anh_huong}
                onChange={(e) => setAnhHuong(e.value || e.target.value)}
              />
            </div>
          </div>

          {/* Solutions / Proposals */}
          <div style={{ padding: '12px', background: 'rgba(16,185,129,0.02)', border: '1px solid var(--border)', borderRadius: '6px' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#059669' }}>
              <Lightbulb size={14} /> Giải pháp xử lý & Đề xuất kiến nghị
            </h4>
            <div className="form-group" style={{ marginBottom: '0' }}>
              <textarea
                className="form-control"
                placeholder="Ví dụ: Đề xuất chuyển dịch tim ống Siphonic sang trái 300mm hoặc nâng cao độ gá treo thêm 150mm..."
                value={de_xuat}
                onChange={(e) => setDeXuat(e.value || e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <button type="button" onClick={handleSave} className="btn btn-accent">
              <Save size={18} /> Lưu Biên bản (Database)
            </button>
            <button type="button" onClick={handleExportWord} className="btn btn-primary">
              <FileText size={18} /> Xuất file Word (.docx)
            </button>
          </div>
        </div>

        {/* Right Side: Paper preview */}
        <div>
          <div className="tabs" style={{ marginBottom: '0' }}>
            <div className="tab active" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileSpreadsheet size={16} /> Biểu mẫu in thử (Biên bản)
            </div>
          </div>

          <div className="glass-card" style={{ padding: '24px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: '"Times New Roman", Times, serif', minHeight: '600px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid #94a3b8', paddingBottom: '10px', marginBottom: '16px' }}>
              <div>
                <div>{project ? project.contractorB.toUpperCase() : "CÔNG TY CỔ PHẦN HYDROTECH"}</div>
                <div style={{ fontStyle: 'italic', fontWeight: 'normal' }}>BĐH Dự án: {project ? project.name : "Hiện trường"}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div>Độc lập - Tự do - Hạnh phúc</div>
              </div>
            </div>

            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 'bold', margin: '0', fontFamily: 'inherit' }}>BIÊN BẢN HIỆN TRƯỜNG / PHÁT SINH</h2>
              <div style={{ fontStyle: 'italic', fontSize: '0.85rem', marginTop: '4px' }}>
                Hôm nay, ngày {ngay || '..../..../2026'}, tại dự án chúng tôi gồm có:
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.85rem', flex: 1, lineHeight: '1.4' }}>
              <div>
                <div><strong>BÊN A (Tổng thầu):</strong> {project ? project.contractorA : '....................................................................'}</div>
                <div style={{ textIndent: '20px' }}>Đại diện: {dai_dien_a || '.......................................................'} | Chức vụ: {chuc_vu_a || '....................................'}</div>
              </div>

              <div>
                <div><strong>BÊN B (Nhà thầu):</strong> {project ? project.contractorB : 'CÔNG TY CỔ PHẦN HYDROTECH'}</div>
                <div style={{ textIndent: '20px' }}>Đại diện: {dai_dien_b || '.......................................................'} | Chức vụ: {chuc_vu_b || '....................................'}</div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px' }}>I. NỘI DUNG SỰ VIỆC / PHÁT SINH</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                  <div>- Vị trí: {vi_tri || '................................................................................'}</div>
                  <div>- Sự việc: {su_viec || '................................................................................'}</div>
                  <div>- Nguyên nhân: {nguyen_nhan || '................................................................................'}</div>
                  <div>- Ảnh hưởng: {anh_huong || '................................................................................'}</div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px' }}>II. GIẢI PHÁP XỬ LÝ / ĐỀ XUẤT</h4>
                <div style={{ paddingLeft: '8px', fontStyle: !de_xuat ? 'italic' : 'normal' }}>
                  {de_xuat || '....................................................................................................................................'}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px', marginBottom: '4px' }}>III. KẾT LUẬN</h4>
                <div style={{ paddingLeft: '8px', textAlign: 'justify' }}>
                  Căn cứ vào diễn biến thực tế, hai bên thống nhất xử lý theo phương án đã đề xuất nêu trên. Khối lượng phát sinh (nếu có) sẽ được tính toán và xác nhận vào hồ sơ hoàn công / quyết toán sau này. Biên bản được lập thành 04 bản, mỗi bên giữ 02 bản có giá trị pháp lý như nhau.
                </div>
              </div>
            </div>

            {/* Signatures */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.8rem', textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN TỔNG THẦU BÊN A</div>
                <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.75rem' }}>(Ký, ghi rõ họ tên)</div>
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN HYDROTECH BÊN B</div>
                <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.75rem' }}>(Ký, ghi rõ họ tên)</div>
                <div style={{ fontWeight: 'bold', marginTop: '40px' }}>{dai_dien_b || 'Kỹ sư hiện trường'}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
