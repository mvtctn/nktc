import React, { useState, useEffect } from 'react';
import { Mic, Play, RefreshCw, Cpu, BrainCircuit, Key, Sparkles, X } from 'lucide-react';
import { parseRawLog, parseLogWithGemini } from '../utils/parser';

export default function NKTCParser({ onParsed, onToast, date, page }) {
  const [isOpen, setIsOpen] = useState(false);
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [geminiKey, setGeminiKey] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Load Gemini API Key if exists
    const key = localStorage.getItem('hydrotech_gemini_key');
    if (key) setGeminiKey(key);

    // Initialize Web Speech API for voice dictation
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'vi-VN';

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setRawText(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (e) => {
        console.error('Speech recognition error:', e);
        setIsRecording(false);
        onToast('Lỗi ghi âm giọng nói. Vui lòng thử lại.', true);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  const handleVoiceInput = () => {
    if (!recognition) {
      onToast('Trình duyệt của bạn không hỗ trợ nhận diện giọng nói', true);
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
      onToast('Đã dừng thu âm');
    } else {
      try {
        recognition.start();
        setIsRecording(true);
        onToast('Đang lắng nghe công trường... Hãy nói đi');
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleParseLocal = () => {
    if (!rawText.trim()) {
      onToast('Vui lòng nhập ghi chép thô', true);
      return;
    }
    setParsing(true);
    try {
      const parsedData = parseRawLog(rawText, date, page);
      onParsed(parsedData);
      onToast('Đã tự động chuẩn hóa dữ liệu!');
    } catch (e) {
      console.error(e);
      onToast('Lỗi phân tích cú pháp', true);
    } finally {
      setParsing(false);
    }
  };

  const handleParseGemini = async () => {
    if (!rawText.trim()) {
      onToast('Vui lòng nhập ghi chép thô', true);
      return;
    }
    
    const savedKey = localStorage.getItem('hydrotech_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (!savedKey) {
      onToast('Chưa cấu hình Gemini API Key. Vui lòng cấu hình VITE_GEMINI_API_KEY trong tệp .env hoặc thiết lập trong mục Hồ sơ Kỹ sư & Cấu hình AI', true);
      return;
    }

    setParsing(true);
    onToast('Đang gọi AI Gemini phân tích nâng cao...');
    try {
      const parsedData = await parseLogWithGemini(rawText, savedKey, date, page);
      onParsed(parsedData);
      onToast('AI Gemini đã hoàn tất xử lý nhật ký!');
    } catch (e) {
      console.error(e);
      onToast('Lỗi phân tích AI, chuyển sang bộ chuẩn hóa nhanh', true);
      handleParseLocal();
    } finally {
      setParsing(false);
    }
  };

  if (!isOpen) {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 180, 216, 0.15) 0%, rgba(0, 229, 255, 0.08) 100%)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            color: 'var(--accent)',
            fontSize: '0.85rem',
            fontWeight: '700',
            padding: '8px 18px',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 12px rgba(0, 229, 255, 0.1)',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 0 18px rgba(0, 229, 255, 0.3)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 180, 216, 0.25) 0%, rgba(0, 229, 255, 0.15) 100%)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(0, 229, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.25)';
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 180, 216, 0.15) 0%, rgba(0, 229, 255, 0.08) 100%)';
          }}
        >
          <Sparkles size={14} /> AI Hỗ trợ nhập liệu
        </button>
      </div>
    );
  }

  return (
    <div className="modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="modal-card" style={{ padding: '24px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', maxWidth: '580px' }}>
        <div className="modal-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="modal-title" style={{ fontSize: '1.05rem', margin: 0, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--accent)" /> AI Hỗ trợ nhập liệu
          </h3>
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="modal-close"
            style={{ color: 'var(--text-secondary)', background: 'transparent', border: 'none', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: 0 }}>
          {/* Speech Dictation Button */}
          <button 
            type="button" 
            onClick={handleVoiceInput} 
            className={`audio-input-btn ${isRecording ? 'recording' : ''}`}
            style={{ marginBottom: '16px' }}
          >
            <Mic size={18} />
            {isRecording ? 'Đang thu âm giọng nói... Bấm để dừng' : 'Ghi âm nhật ký bằng giọng nói (Giọng Việt)'}
          </button>

          {/* Raw Text Input */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Nhập nội dung ghi chép thô hoặc nói:</label>
            <textarea
              className="form-control"
              rows={6}
              placeholder="Ví dụ: Nhật ký ngày 15/6/26 trang 42. Dự án Johnson Thuận Thành 1. Sáng nắng gắt, chiều đổ mưa to. Đội thợ hôm nay giữ nguyên 17 người. Thiết bị có 3 máy cắt tay, 1 máy cắt bàn, 6 khoan bê tông. Tiến độ: lắp ống nhựa đen tầng 1+2. Vẫn đang chờ mặt bằng phần xưởng 2 tầng 2. Chờ quạt từ bên A cấp. An toàn tốt, vệ sinh sạch sẽ..."
              value={rawText}
              onChange={(e) => setRawText(e.value || e.target.value)}
              style={{ fontSize: '0.875rem' }}
            />
          </div>

          {/* Parse Trigger Buttons */}
          <div className="parser-actions-grid" style={{ marginTop: '16px' }}>
            <button 
              type="button" 
              onClick={handleParseLocal} 
              className="btn btn-secondary btn-parse-action" 
              disabled={parsing}
            >
              <Cpu size={16} /> <span>Chuẩn hóa nhanh (Regex)</span>
            </button>
            <button 
              type="button" 
              onClick={handleParseGemini} 
              className="btn btn-primary btn-parse-action" 
              disabled={parsing}
            >
              <BrainCircuit size={16} /> <span>Phân tích thông minh (Gemini AI)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
