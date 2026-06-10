import React, { useState, useEffect } from 'react';
import PhotoStamper from './PhotoStamper';
import { exportNKTCtoWord } from '../utils/WordExporter';
import { 
  Save, 
  Copy, 
  Download, 
  Plus, 
  Trash2, 
  FileText, 
  Settings, 
  Calendar, 
  Users, 
  Wrench, 
  Shield, 
  Leaf, 
  MessageSquare,
  RefreshCw,
  Code
} from 'lucide-react';

const getTodayDateString = () => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, '0');
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const year = today.getFullYear();
  return `${day}/${month}/${year}`;
};

const convertToInputDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const convertToDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return dateStr;
};

export default function NKTCForm({
  user,
  project,
  initialData,
  onSave,
  onToast
}) {
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' or 'json'

  // Form Fields
  const [trang, setTrang] = useState('1');
  const [ngay, setNgay] = useState(getTodayDateString());
  const [thoi_tiet_sang, setThoiTietSang] = useState('Bình thường');
  const [thoi_tiet_chieu, setThoiTietChieu] = useState('Bình thường');
  const [so_luong_cong_nhan, setSoLuongCongNhan] = useState(0);
  const [thiet_bi, setThietBi] = useState([]);
  const [vat_lieu, setVatLieu] = useState([]);
  const [tien_trinh_cong_viec, setTienTrinhCongViec] = useState([]);
  const [an_toan_lao_dong, setAnToanLaoDong] = useState('Tốt');
  const [ve_sinh_moi_truong, setVeSinhMoiTruong] = useState('Tốt');
  const [ghi_chu_khac, setGhiChuKhac] = useState('');
  const [photos, setPhotos] = useState([]);

  // Inputs for adding new list items
  const [newEquipment, setNewEquipment] = useState('');
  const [newMaterial, setNewMaterial] = useState('');

  useEffect(() => {
    if (initialData) {
      setTrang(initialData.trang || '1');
      setNgay(initialData.ngay || getTodayDateString());
      setThoiTietSang(initialData.thoi_tiet_sang || 'Bình thường');
      setThoiTietChieu(initialData.thoi_tiet_chieu || 'Bình thường');
      setSoLuongCongNhan(initialData.so_luong_cong_nhan || 0);
      setThietBi(initialData.thiet_bi || []);
      setVatLieu(initialData.vat_lieu || []);
      setTienTrinhCongViec(initialData.tien_trinh_cong_viec || []);
      setAnToanLaoDong(initialData.an_toan_lao_dong || 'Tốt');
      setVeSinhMoiTruong(initialData.ve_sinh_moi_truong || 'Tốt');
      setGhiChuKhac(initialData.ghi_chu_khac || '');
      setPhotos(initialData.photos || []);
    }
  }, [initialData]);



  // List Management
  const addEquipment = () => {
    if (!newEquipment.trim()) return;
    setThietBi(prev => [...prev, newEquipment.trim()]);
    setNewEquipment('');
  };

  const removeEquipment = (index) => {
    setThietBi(prev => prev.filter((_, idx) => idx !== index));
  };

  const addMaterial = () => {
    if (!newMaterial.trim()) return;
    setVatLieu(prev => [...prev, newMaterial.trim()]);
    setNewMaterial('');
  };

  const removeMaterial = (index) => {
    setVatLieu(prev => prev.filter((_, idx) => idx !== index));
  };

  const addProgressLine = () => {
    setTienTrinhCongViec(prev => [...prev, '']);
  };

  const updateProgressLine = (index, value) => {
    setTienTrinhCongViec(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeProgressLine = (index) => {
    setTienTrinhCongViec(prev => prev.filter((_, idx) => idx !== index));
  };

  // Format active data to JSON format
  const getFormattedJSON = () => {
    const data = {
      ngay,
      trang,
      thoi_tiet_sang,
      thoi_tiet_chieu,
      thiet_bi,
      vat_lieu,
      so_luong_cong_nhan: parseInt(so_luong_cong_nhan, 10) || 0,
      tien_trinh_cong_viec: tien_trinh_cong_viec.filter(line => line.trim() !== ''),
      an_toan_lao_dong,
      ve_sinh_moi_truong,
      ghi_chu_khac
    };
    return JSON.stringify(data, null, 2);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(getFormattedJSON());
    onToast('Đã sao chép mã JSON vào Clipboard!');
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([getFormattedJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nktc_${ngay.replace(/\//g, '-')}_trang_${trang}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onToast('Đã tải xuống file JSON thành công!');
  };

  const handleSaveDiary = () => {
    const dataToSave = {
      trang,
      ngay,
      thoi_tiet_sang,
      thoi_tiet_chieu,
      so_luong_cong_nhan: parseInt(so_luong_cong_nhan, 10) || 0,
      thiet_bi,
      vat_lieu,
      tien_trinh_cong_viec: tien_trinh_cong_viec.filter(line => line.trim() !== ''),
      an_toan_lao_dong,
      ve_sinh_moi_truong,
      ghi_chu_khac,
      photos
    };
    onSave(dataToSave);
  };

  const handleExportWord = () => {
    onToast('Đang tạo và xuất tệp Word...');
    exportNKTCtoWord(
      {
        ngay,
        trang,
        thoi_tiet_sang,
        thoi_tiet_chieu,
        so_luong_cong_nhan,
        thiet_bi,
        vat_lieu,
        tien_trinh_cong_viec: tien_trinh_cong_viec.filter(line => line.trim() !== ''),
        an_toan_lao_dong,
        ve_sinh_moi_truong,
        ghi_chu_khac
      },
      project,
      photos
    );
    onToast('Đã xuất file Word (.docx) thành công!');
  };

  return (
    <div className="container-fluid" id="nktc-form-panel">
      <div className="dashboard-grid">
        {/* Left Side: Interactive Input Form */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div className="panel-header" style={{ marginBottom: '0' }}>
            <h3 className="panel-title"><FileText size={18} /> Biểu mẫu nhập Nhật ký thi công</h3>
          </div>

          {/* Combined Date & Weather Options Row */}
          <div className="input-row">
            <div className="form-group">
              <label className="form-label"><Calendar size={14} style={{ display: 'inline', marginRight: '6px' }} /> Ngày thi công</label>
              <input
                type="date"
                className="form-control"
                value={convertToInputDate(ngay)}
                onChange={(e) => setNgay(convertToDisplayDate(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Thời tiết Sáng</label>
              <select className="form-control" value={thoi_tiet_sang} onChange={(e) => setThoiTietSang(e.target.value)}>
                <option value="Nắng">Nắng</option>
                <option value="Mưa">Mưa</option>
                <option value="Bình thường">Bình thường</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Thời tiết Chiều</label>
              <select className="form-control" value={thoi_tiet_chieu} onChange={(e) => setThoiTietChieu(e.target.value)}>
                <option value="Nắng">Nắng</option>
                <option value="Mưa">Mưa</option>
                <option value="Bình thường">Bình thường</option>
              </select>
            </div>
          </div>

          {/* Manpower Input */}
          <div className="form-group">
            <label className="form-label"><Users size={14} style={{ display: 'inline', marginRight: '6px' }} /> Số lượng công nhân (Điền số)</label>
            <input
              type="number"
              min="0"
              className="form-control"
              placeholder="Nhập số lượng công nhân..."
              value={so_luong_cong_nhan}
              onChange={(e) => setSoLuongCongNhan(parseInt(e.target.value || 0, 10))}
            />
          </div>

          {/* Equipment List */}
          <div className="form-group">
            <label className="form-label"><Wrench size={14} style={{ display: 'inline', marginRight: '6px' }} /> Thiết bị sử dụng trong ngày</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Máy hàn đối đầu ống HDPE: 02 cái"
                value={newEquipment}
                onChange={(e) => setNewEquipment(e.value || e.target.value)}
              />
              <button type="button" onClick={addEquipment} className="btn btn-secondary" style={{ padding: '10px' }}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {thiet_bi.map((eq, index) => (
                <span key={index} style={{ padding: '6px 12px', background: 'rgba(0,180,216,0.08)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {eq}
                  <Trash2 size={12} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeEquipment(index)} />
                </span>
              ))}
            </div>
          </div>

          {/* Material List */}
          <div className="form-group">
            <label className="form-label">Vật liệu nhập kho / sử dụng</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Ví dụ: Ống HDPE DN110: 50m"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.value || e.target.value)}
              />
              <button type="button" onClick={addMaterial} className="btn btn-secondary" style={{ padding: '10px' }}>
                <Plus size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {vat_lieu.map((mat, index) => (
                <span key={index} style={{ padding: '6px 12px', background: 'rgba(0,180,216,0.04)', border: '1px solid var(--border)', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mat}
                  <Trash2 size={12} color="#ef4444" style={{ cursor: 'pointer' }} onClick={() => removeMaterial(index)} />
                </span>
              ))}
            </div>
          </div>

          {/* Progress Details */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ marginBottom: '0' }}>Nội dung hoạt động & Vị trí</label>
              <button type="button" onClick={addProgressLine} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px' }}>
                <Plus size={12} /> Thêm đầu việc
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tien_trinh_cong_viec.map((line, index) => (
                <div key={index} style={{ display: 'flex', gap: '8px' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '700', alignSelf: 'center', minWidth: '20px' }}>{index + 1}.</span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Ví dụ: Lắp đặt ống HDPE thoát nước mưa tại Xưởng 1"
                    value={line}
                    onChange={(e) => updateProgressLine(index, e.value || e.target.value)}
                  />
                  <button type="button" onClick={() => removeProgressLine(index)} className="btn btn-secondary" style={{ padding: '10px' }}>
                    <Trash2 size={14} color="#ef4444" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Safety & Environment */}
          <div className="input-row">
            <div className="form-group">
              <label className="form-label"><Shield size={14} style={{ display: 'inline', marginRight: '6px' }} /> An toàn lao động</label>
              <select className="form-control" value={an_toan_lao_dong} onChange={(e) => setAnToanLaoDong(e.target.value)}>
                <option value="Tốt">Tốt</option>
                <option value="Không tốt">Không tốt</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label"><Leaf size={14} style={{ display: 'inline', marginRight: '6px' }} /> Vệ sinh môi trường</label>
              <select className="form-control" value={ve_sinh_moi_truong} onChange={(e) => setVeSinhMoiTruong(e.target.value)}>
                <option value="Tốt">Tốt</option>
                <option value="Trung bình">Trung bình</option>
                <option value="Xấu">Xấu</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label"><MessageSquare size={14} style={{ display: 'inline', marginRight: '6px' }} /> Vướng mắc, chờ mặt bằng, kiến nghị</label>
            <textarea
              className="form-control"
              placeholder="Nhập các vướng mắc hiện trường..."
              value={ghi_chu_khac}
              onChange={(e) => setGhiChuKhac(e.value || e.target.value)}
            />
          </div>

          {/* Photo Stamper */}
          <PhotoStamper 
            photos={photos} 
            setPhotos={setPhotos} 
            project={project} 
            date={ngay} 
            weather={thoi_tiet_sang === thoi_tiet_chieu ? thoi_tiet_sang : `Sáng ${thoi_tiet_sang}, chiều ${thoi_tiet_chieu}`}
            engineer={project ? project.supervisor : user.displayName || 'Kỹ sư'}
            onToast={onToast}
          />

          {/* Action buttons */}
          <div className="form-actions-grid">
            <button type="button" onClick={handleSaveDiary} className="btn btn-accent">
              <Save size={18} /> Lưu Nhật ký (Cloud/Local)
            </button>
            <button type="button" onClick={handleExportWord} className="btn btn-primary">
              <FileText size={18} /> Xuất file Word (.docx)
            </button>
          </div>
        </div>

        {/* Right Side: Preview / JSON tab */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="tabs" style={{ marginBottom: '0' }}>
            <div 
              className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={16} /> Biểu mẫu in thử
            </div>
            <div 
              className={`tab ${activeTab === 'json' ? 'active' : ''}`}
              onClick={() => setActiveTab('json')}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Code size={16} /> Định dạng JSON chuẩn
            </div>
          </div>

          {activeTab === 'preview' ? (
            /* Printable PDF Preview */
            <div className="glass-card" style={{ padding: '24px', background: 'white', color: '#1e293b', border: '1px solid #cbd5e1', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontFamily: '"Times New Roman", Times, serif', minHeight: '600px', display: 'flex', flexDirection: 'column', wordBreak: 'break-all' }}>
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
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0', fontFamily: 'inherit' }}>NHẬT KÝ THI CÔNG</h2>
                <div style={{ fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 'bold', marginTop: '4px' }}>
                  Ngày: {ngay} | Số trang: {trang}
                </div>
              </div>

              {/* Layout Tables */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.85rem', flex: 1 }}>
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>I. THÔNG TIN DỰ ÁN</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'inherit' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', fontWeight: 'bold', padding: '4px 0' }}>Dự án:</td>
                        <td style={{ padding: '4px 0' }}>{project ? project.name : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Địa chỉ:</td>
                        <td style={{ padding: '4px 0' }}>{project ? project.address : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Chủ đầu tư:</td>
                        <td style={{ padding: '4px 0' }}>{project ? project.investor : 'N/A'}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Gói thầu/Hạng mục:</td>
                        <td style={{ padding: '4px 0' }}>{project ? `${project.packageName} / ${project.categoryName}` : 'N/A'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>II. THỜI TIẾT, NHÂN LỰC & THIẾT BỊ</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'inherit' }}>
                    <tbody>
                      <tr>
                        <td style={{ width: '25%', fontWeight: 'bold', padding: '4px 0' }}>Thời tiết:</td>
                        <td style={{ padding: '4px 0' }}>Sáng: {thoi_tiet_sang} | Chiều: {thoi_tiet_chieu}</td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Nhân lực:</td>
                        <td style={{ padding: '4px 0' }}>{so_luong_cong_nhan} người</td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Thiết bị thi công:</td>
                        <td style={{ padding: '4px 0' }}>
                          {thiet_bi.length > 0 ? thiet_bi.join(', ') : 'Không có thiết bị lớn.'}
                        </td>
                      </tr>
                      <tr style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 'bold', padding: '4px 0' }}>Vật liệu đưa vào:</td>
                        <td style={{ padding: '4px 0' }}>
                          {vat_lieu.length > 0 ? vat_lieu.join(', ') : 'Không nhập vật liệu mới.'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>III. TIẾN TRÌNH THI CÔNG CHI TIẾT</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingLeft: '8px' }}>
                    {tien_trinh_cong_viec.filter(l => l.trim() !== '').length === 0 ? (
                      <span style={{ fontStyle: 'italic', color: '#64748b' }}>Chưa có tiến trình thi công nào được nhập...</span>
                    ) : (
                      tien_trinh_cong_viec.filter(l => l.trim() !== '').map((line, idx) => (
                        <div key={idx}>{idx + 1}. {line}</div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>IV. AN TOÀN & VỆ SINH MÔI TRƯỜNG</h4>
                  <div>An toàn lao động: <strong>{an_toan_lao_dong}</strong> | Vệ sinh môi trường: <strong>{ve_sinh_moi_truong}</strong></div>
                </div>

                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#0f2b48', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>V. VƯỚNG MẮC & KIẾN NGHỊ</h4>
                  <div style={{ fontStyle: !ghi_chu_khac ? 'italic' : 'normal' }}>{ghi_chu_khac || 'Không có vướng mắc nào.'}</div>
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', fontSize: '0.8rem', textAlign: 'center', marginTop: '32px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN TỔNG THẦU</div>
                  <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.75rem' }}>(Ký, ghi rõ họ tên)</div>
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>ĐẠI DIỆN HYDROTECH BÊN B</div>
                  <div style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.75rem' }}>(Ký, ghi rõ họ tên)</div>
                  <div style={{ fontWeight: 'bold', marginTop: '40px' }}>{project ? project.supervisor : 'Kỹ sư giám sát'}</div>
                </div>
              </div>

              {/* Photos inside print card */}
              {photos.length > 0 && (
                <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '2px solid #cbd5e1' }}>
                  <div style={{ textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '12px' }}>HÌNH ẢNH MINH HỌA HIỆN TRƯỜNG</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {photos.map((photo, idx) => (
                      <div key={idx} style={{ textAlign: 'center', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}>
                        <img src={photo} alt={`Ảnh hiện trường ${idx+1}`} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', borderRadius: '2px' }} />
                        <span style={{ fontSize: '0.7rem', color: '#64748b', fontStyle: 'italic' }}>Hình ảnh {idx+1}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Standard JSON Code Viewer */
            <div className="glass-card">
              <div className="code-preview-header">
                <span className="code-preview-lang">json</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={handleCopyJSON} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', borderColor: '#1a2f4c', color: '#e2e8f0' }} title="Copy">
                    <Copy size={14} /> Copy
                  </button>
                  <button onClick={handleDownloadJSON} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', borderColor: '#1a2f4c', color: '#e2e8f0' }} title="Download">
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
              <div className="code-preview-scroll">
                <pre><code className="json-code">{getFormattedJSON()}</code></pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
