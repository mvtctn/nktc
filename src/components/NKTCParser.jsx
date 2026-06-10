import React, { useState, useEffect } from 'react';
import { Mic, Play, RefreshCw, Cpu, BrainCircuit, Key } from 'lucide-react';
import { parseRawLog, parseLogWithGemini } from '../utils/parser';

export default function NKTCParser({ onParsed, onToast, date, page }) {
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
    if (!geminiKey) {
      onToast('Vui lòng nhập Gemini API Key để phân tích bằng AI', true);
      return;
    }

    setParsing(true);
    onToast('Đang gọi AI Gemini phân tích nâng cao...');
    try {
      // Save key
      localStorage.setItem('hydrotech_gemini_key', geminiKey);
      const parsedData = await parseLogWithGemini(rawText, geminiKey, date, page);
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

  return (
    <div className="glass-card" style={{ marginBottom: '24px' }}>
      <div className="panel-header" style={{ marginBottom: '12px' }}>
        <h3 className="panel-title" style={{ fontSize: '0.95rem' }}><Mic size={18} /> Nhập ghi chép nhanh hoặc nhật ký thoại</h3>
      </div>

      {/* Speech Dictation Button */}
      <button 
        type="button" 
        onClick={handleVoiceInput} 
        className={`audio-input-btn ${isRecording ? 'recording' : ''}`}
      >
        <Mic size={18} />
        {isRecording ? 'Đang thu âm giọng nói... Bấm để dừng' : 'Ghi âm nhật ký bằng giọng nói (Giọng Việt)'}
      </button>

      {/* Raw Text Input */}
      <div className="form-group">
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <button 
          type="button" 
          onClick={handleParseLocal} 
          className="btn btn-secondary" 
          disabled={parsing}
          style={{ fontSize: '0.85rem' }}
        >
          <Cpu size={16} /> Chuẩn hóa nhanh (Regex)
        </button>
        <button 
          type="button" 
          onClick={handleParseGemini} 
          className="btn btn-primary" 
          disabled={parsing || !geminiKey}
          style={{ fontSize: '0.85rem' }}
        >
          <BrainCircuit size={16} /> Phân tích thông minh (Gemini AI)
        </button>
      </div>

      {/* Gemini API Key Configuration */}
      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Key size={14} color="var(--text-secondary)" style={{ flexShrink: 0 }} />
        <input
          type="password"
          className="form-control"
          placeholder="Cấu hình Gemini API Key (Không bắt buộc)..."
          value={geminiKey}
          onChange={(e) => setGeminiKey(e.value || e.target.value)}
          style={{ height: '30px', padding: '4px 8px', fontSize: '0.75rem', border: 'none', background: 'transparent' }}
        />
      </div>
    </div>
  );
}
