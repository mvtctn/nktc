import React, { useState, useRef, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { collection, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../firebase';
import {
  Upload, X, FileText, Image, File, Download, Trash2, Loader, AlertCircle, Paperclip
} from 'lucide-react';

const MAX_SIZE_MB = 10;
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const getFileIcon = (type) => {
  if (!type) return <File size={20} />;
  if (type.startsWith('image/')) return <Image size={20} color="#3b82f6" />;
  if (type === 'application/pdf') return <FileText size={20} color="#ef4444" />;
  if (type.includes('word')) return <FileText size={20} color="#2563eb" />;
  if (type.includes('excel') || type.includes('spreadsheet')) return <FileText size={20} color="#16a34a" />;
  return <File size={20} color="#6b7280" />;
};

const formatSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function FileUploader({
  contextType,   // 'project' | 'job'
  contextId,     // projectId or jobId
  projectId,     // always the parent projectId (for jobs)
  files = [],    // list from Firestore
  user,
  isSuperAdmin = false,
  onToast,
  readOnly = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const fileInputRef = useRef(null);

  const storagePath = contextType === 'project'
    ? `projects/${contextId}/files`
    : `jobs/${contextId}/files`;

  const firestoreCollection = contextType === 'project' ? 'project_files' : 'job_files';

  const uploadFile = useCallback(async (file) => {
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      onToast('Định dạng file không được hỗ trợ. Chỉ chấp nhận ảnh, PDF, Word, Excel.', true);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onToast(`File quá lớn. Kích thước tối đa là ${MAX_SIZE_MB}MB.`, true);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const uniqueName = `${Date.now()}_${file.name}`;
      const storageRef = ref(storage, `${storagePath}/${uniqueName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (error) => {
          console.error(error);
          onToast('Lỗi khi tải file lên. Vui lòng thử lại.', true);
          setUploading(false);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          const meta = {
            name: file.name,
            storageName: uniqueName,
            url,
            size: file.size,
            type: file.type,
            uploadedBy: user.displayName || user.email,
            uploadedById: user.uid,
            uploadedAt: serverTimestamp(),
            [contextType === 'project' ? 'projectId' : 'jobId']: contextId,
          };
          if (contextType === 'job') meta.projectId = projectId;

          await addDoc(collection(db, firestoreCollection), meta);
          onToast(`Tải lên thành công: ${file.name}`);
          setUploading(false);
          setProgress(0);
        }
      );
    } catch (e) {
      console.error(e);
      onToast('Lỗi hệ thống khi tải file.', true);
      setUploading(false);
    }
  }, [contextId, contextType, firestoreCollection, onToast, projectId, storagePath, user]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (fileDoc) => {
    const canDelete = isSuperAdmin || fileDoc.uploadedById === user?.uid;
    if (!canDelete) {
      onToast('Bạn không có quyền xóa file này.', true);
      return;
    }
    if (!window.confirm(`Xóa file "${fileDoc.name}"?`)) return;

    setDeleting(fileDoc.id);
    try {
      const storageRef = ref(storage, `${storagePath}/${fileDoc.storageName}`);
      await deleteObject(storageRef).catch(() => {}); // ignore if already deleted
      await deleteDoc(doc(db, firestoreCollection, fileDoc.id));
      onToast('Đã xóa file thành công.');
    } catch (e) {
      console.error(e);
      onToast('Lỗi khi xóa file.', true);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Paperclip size={16} color="var(--accent)" />
          Tài liệu đính kèm ({files.length})
        </h4>
        {!readOnly && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="btn btn-secondary btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '6px 12px' }}
          >
            <Upload size={14} /> Tải lên
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif,.pdf,.doc,.docx,.xls,.xlsx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>

      {/* Drag & Drop Zone */}
      {!readOnly && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: '8px',
            padding: '16px',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            background: dragOver ? 'rgba(0,229,255,0.04)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s',
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <Loader size={24} color="var(--accent)" style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Đang tải lên... {progress}%</div>
              <div style={{ width: '100%', maxWidth: '200px', height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.3s' }} />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <Upload size={24} color="var(--text-light)" />
              <div style={{ fontSize: '0.82rem', color: 'var(--text-light)' }}>
                Kéo thả file vào đây hoặc <span style={{ color: 'var(--accent)', fontWeight: '600' }}>bấm để chọn</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', opacity: 0.7 }}>
                Ảnh, PDF, Word, Excel — Tối đa {MAX_SIZE_MB}MB
              </div>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      {files.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {files.map((f) => {
            const isImage = f.type?.startsWith('image/');
            const canDelete = isSuperAdmin || f.uploadedById === user?.uid;
            return (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  minWidth: 0,
                }}
              >
                {/* Thumbnail or Icon */}
                {isImage ? (
                  <img
                    src={f.url}
                    alt={f.name}
                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', flexShrink: 0 }}
                  />
                ) : (
                  <div style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
                    {getFileIcon(f.type)}
                  </div>
                )}

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {f.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-light)', marginTop: '2px' }}>
                    {formatSize(f.size)} · {f.uploadedBy}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={f.name}
                    className="btn-icon"
                    title="Tải xuống"
                    style={{ padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', textDecoration: 'none' }}
                  >
                    <Download size={16} />
                  </a>
                  {!readOnly && canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDelete(f)}
                      disabled={deleting === f.id}
                      className="btn-icon"
                      title="Xóa file"
                      style={{ padding: '6px', borderRadius: '6px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {deleting === f.id ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash2 size={16} />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-light)', fontSize: '0.82rem' }}>
          <AlertCircle size={24} style={{ marginBottom: '6px', opacity: 0.5 }} />
          <p style={{ margin: 0 }}>Chưa có tài liệu nào được đính kèm</p>
        </div>
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
