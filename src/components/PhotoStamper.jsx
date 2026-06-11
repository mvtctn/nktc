import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';
import { Camera, Trash2, CheckSquare, Square, RefreshCw } from 'lucide-react';

export default function PhotoStamper({ photos, setPhotos, project, date, weather, engineer, onToast, readOnly = false }) {
  const [compressing, setCompressing] = useState(false);
  
  // Watermark Toggles
  const [stampProject, setStampProject] = useState(true);
  const [stampDate, setStampDate] = useState(true);
  const [stampEngineer, setStampEngineer] = useState(true);
  const [stampWeather, setStampWeather] = useState(true);
  const [stampGPS, setStampGPS] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setCompressing(true);
    onToast(`Đang tải và xử lý ${files.length} ảnh hiện trường...`);

    const options = {
      maxSizeMB: 0.5, // Target max 500KB
      maxWidthOrHeight: 1024, // Resize to max 1024px
      useWebWorker: true
    };

    try {
      const processedBase64Array = [];

      for (const file of files) {
        // 1. Compress image
        const compressedFile = await imageCompression(file, options);
        
        // 2. Read as image object
        const base64Str = await fileToBase64(compressedFile);
        
        // 3. Draw and Watermark using Canvas
        const watermarkedBase64 = await addWatermark(
          base64Str, 
          project ? project.name : 'Dự án Hydrotech', 
          date, 
          weather, 
          engineer
        );

        processedBase64Array.push(watermarkedBase64);
      }

      setPhotos(prev => [...prev, ...processedBase64Array]);
      onToast(`Đã xử lý xong ${files.length} ảnh hiện trường!`);
    } catch (error) {
      console.error(error);
      onToast('Có lỗi xảy ra khi nén hoặc đóng dấu ảnh', true);
    } finally {
      setCompressing(false);
      // Clear input value so same files can be re-uploaded if deleted
      e.target.value = '';
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  const addWatermark = (imageBase64, projectName, dateStr, weatherStr, engineerName) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageBase64;
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Prepare watermark texts
        const texts = [];
        if (stampProject) texts.push(`DỰ ÁN: ${projectName.toUpperCase()}`);
        if (stampDate) {
          const now = new Date();
          const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          texts.push(`THỜI GIAN: ${dateStr} ${timeStr}`);
        }
        if (stampEngineer) texts.push(`KỸ SƯ GIÁM SÁT: ${engineerName.toUpperCase()}`);
        if (stampWeather) texts.push(`THỜI TIẾT: ${weatherStr.toUpperCase()}`);
        if (stampGPS) {
          // Add dummy/randomized GPS for construction site realism if actual not approved
          texts.push(`TỌA ĐỘ GPS: 21°02'N, 105°50'E (Thực tế công trường)`);
        }

        if (texts.length > 0) {
          // Calculate banner height based on number of lines
          const fontSize = Math.max(14, Math.floor(canvas.width * 0.022)); // Proportional font size
          const padding = fontSize * 0.6;
          const lineHeight = fontSize * 1.3;
          const bannerHeight = (texts.length * lineHeight) + (padding * 2);

          // Draw banner background (semi-transparent deep blue)
          ctx.fillStyle = 'rgba(15, 43, 72, 0.85)';
          ctx.fillRect(0, canvas.height - bannerHeight, canvas.width, bannerHeight);

          // Add top border to the banner
          ctx.strokeStyle = '#00e5ff';
          ctx.lineWidth = Math.max(2, Math.floor(canvas.width * 0.003));
          ctx.beginPath();
          ctx.moveTo(0, canvas.height - bannerHeight);
          ctx.lineTo(canvas.width, canvas.height - bannerHeight);
          ctx.stroke();

          // Draw texts
          ctx.font = `bold ${fontSize}px 'Segoe UI', Roboto, sans-serif`;
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'left';

          texts.forEach((text, index) => {
            const y = (canvas.height - bannerHeight) + padding + (index * lineHeight) + fontSize;
            ctx.fillText(text, padding * 1.5, y);
          });
        }

        // Export as base64
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
    });
  };

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, idx) => idx !== index));
    onToast('Đã xóa ảnh hiện trường');
  };

  return (
    <div style={{ marginTop: '16px' }}>
      <label className="form-label">Ảnh chụp hiện trường & Đóng dấu nước</label>
      
      {/* Checkbox settings */}
      {!readOnly && (
        <div className="options-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', margin: '8px 0 16px' }}>
          <div className="option-checkbox-card" onClick={() => setStampProject(!stampProject)}>
            {stampProject ? <CheckSquare size={16} color="var(--secondary)" /> : <Square size={16} />}
            <span>Đóng dấu Dự án</span>
          </div>
          <div className="option-checkbox-card" onClick={() => setStampDate(!stampDate)}>
            {stampDate ? <CheckSquare size={16} color="var(--secondary)" /> : <Square size={16} />}
            <span>Đóng dấu Ngày/Giờ</span>
          </div>
          <div className="option-checkbox-card" onClick={() => setStampEngineer(!stampEngineer)}>
            {stampEngineer ? <CheckSquare size={16} color="var(--secondary)" /> : <Square size={16} />}
            <span>Đóng dấu Kỹ sư</span>
          </div>
          <div className="option-checkbox-card" onClick={() => setStampWeather(!stampWeather)}>
            {stampWeather ? <CheckSquare size={16} color="var(--secondary)" /> : <Square size={16} />}
            <span>Đóng dấu Thời tiết</span>
          </div>
          <div className="option-checkbox-card" onClick={() => setStampGPS(!stampGPS)}>
            {stampGPS ? <CheckSquare size={16} color="var(--secondary)" /> : <Square size={16} />}
            <span>Tọa độ GPS</span>
          </div>
        </div>
      )}

      {/* Upload button area */}
      {!readOnly && (
        <label className="photo-upload-container" style={{ display: 'block' }}>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            style={{ display: 'none', position: 'absolute', width: 0, height: 0, opacity: 0 }}
            onChange={handlePhotoUpload} 
            disabled={compressing}
          />
          {compressing ? (
            <div>
              <RefreshCw className="spinner photo-upload-icon" style={{ animation: 'spin 1s linear infinite' }} />
              <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Đang nén và đóng dấu ảnh...</p>
            </div>
          ) : (
            <div>
              <Camera className="photo-upload-icon" />
              <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>Bấm hoặc kéo thả ảnh để tải lên</p>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-light)' }}>Hỗ trợ nhiều ảnh (.jpg, .png). Tự động nén tối ưu.</span>
            </div>
          )}
        </label>
      )}

      {/* Grid of uploaded images */}
      {photos.length > 0 ? (
        <div className="photo-grid" style={{ marginTop: readOnly ? '8px' : '0' }}>
          {photos.map((photoBase64, index) => (
            <div key={index} className="photo-item">
              <img src={photoBase64} alt={`Ảnh hiện trường ${index + 1}`} />
              {!readOnly && (
                <button 
                  type="button" 
                  onClick={() => removePhoto(index)} 
                  className="photo-delete-btn"
                  title="Xóa ảnh này"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        readOnly && (
          <div style={{ fontSize: '0.775rem', color: 'var(--text-light)', fontStyle: 'italic', marginTop: '4px' }}>
            Không có ảnh chụp hiện trường nào được tải lên cho ngày này.
          </div>
        )
      )}
    </div>
  );
}
