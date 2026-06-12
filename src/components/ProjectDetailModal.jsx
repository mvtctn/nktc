import { useState, useEffect } from 'react';
import {
  FileText,
  FileSpreadsheet,
  MapPin,
  Building2,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Download,
  ChevronDown,
} from 'lucide-react';
import { exportAllNKTCtoWord } from '../utils/WordExporter';
import { exportAllNKTCtoPDF } from '../utils/PDFExporter';

export default function ProjectDetailModal({
  project,
  diaries = [],
  minutes = [],
  user,
  isSuperAdmin = false,
  onClose,
  onOpenDiary,
  onOpenMinute,
  onToast,
}) {
  const [activeTab, setActiveTab] = useState('diary');

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const projectDiaries = diaries
    .filter((d) => d.projectId === project.id)
    .sort((a, b) => {
      const parseDate = (d) => {
        const p = (d || '').split('/');
        return p.length === 3 ? new Date(p[2], p[1] - 1, p[0]) : new Date(0);
      };
      return parseDate(b.ngay) - parseDate(a.ngay);
    });

  const projectMinutes = minutes
    .filter((m) => m.projectId === project.id)
    .sort((a, b) => new Date(b.updated_at || 0) - new Date(a.updated_at || 0));

  const handleExportAll = () => {
    if (projectDiaries.length === 0) {
      onToast('Dự án này chưa có nhật ký nào để xuất', true);
      return;
    }
    onToast('Đang xuất toàn bộ nhật ký...');
    try {
      exportAllNKTCtoWord(projectDiaries, project);
      onToast('Xuất toàn bộ Nhật ký (.docx) thành công!');
    } catch (err) {
      console.error(err);
      onToast('Lỗi khi xuất nhật ký', true);
    }
  };

  const handleExportAllPDF = async () => {
    if (projectDiaries.length === 0) {
      onToast('Dự án này chưa có nhật ký nào để xuất', true);
      return;
    }
    onToast(`Đang xuất ${projectDiaries.length} nhật ký ra PDF...`);
    await exportAllNKTCtoPDF(projectDiaries, project, onToast);
  };

  const DiaryCard = ({ d }) => (
    <div
      onClick={() => onOpenDiary(d)}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.025)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      className="activity-item"
    >
      {/* Page badge */}
      <div style={{
        flexShrink: 0,
        width: '50px',
        height: '42px',
        borderRadius: '10px',
        background: 'rgba(16,185,129,0.12)',
        border: '1px solid rgba(16,185,129,0.25)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: '700', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Ngày TC</span>
        <span style={{ fontSize: '1rem', color: '#10b981', fontWeight: '800', lineHeight: 1 }}>{d.trang || '1'}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <Calendar size={11} color="var(--text-light)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{d.ngay}</span>
        </div>
        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-primary)',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: '500',
        }}>
          {d.tien_trinh_cong_viec?.[0] || 'Chưa nhập nội dung'}
        </p>
      </div>
      <ArrowRight size={15} color="var(--text-light)" style={{ flexShrink: 0 }} />
    </div>
  );

  // Shared minute card renderer
  const MinuteCard = ({ m }) => (
    <div
      onClick={() => onOpenMinute(m)}
      style={{
        padding: '12px 14px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.025)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'background 0.15s, border-color 0.15s',
      }}
      className="activity-item"
    >
      <div style={{
        flexShrink: 0,
        width: '42px',
        height: '42px',
        borderRadius: '10px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.22)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <FileSpreadsheet size={20} color="#ef4444" />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
          <Calendar size={11} color="var(--text-light)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{m.ngay}</span>
        </div>
        <p style={{
          fontSize: '0.84rem',
          color: 'var(--text-primary)',
          margin: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontWeight: '500',
        }}>
          {m.vi_tri ? `${m.vi_tri}: ` : ''}{m.su_viec || 'Chưa nhập nội dung'}
        </p>
      </div>
      <ArrowRight size={15} color="var(--text-light)" style={{ flexShrink: 0 }} />
    </div>
  );

  return (
    <div className="container-fluid" id="project-detail-panel" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* ── Quay lại Dashboard ── */}
      <div>
        <button
          onClick={onClose}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', minHeight: '38px' }}
        >
          <ArrowLeft size={16} /> Quay lại Dashboard
        </button>
      </div>

      <div
        className="glass-card"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          padding: 0,
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(0,180,216,0.07) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
        }}>
          {/* Row 1: name + back icon */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
              <div style={{
                flexShrink: 0, width: '34px', height: '34px',
                borderRadius: '9px',
                background: 'rgba(0,180,216,0.12)',
                border: '1px solid rgba(0,180,216,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Briefcase size={16} color="var(--accent)" />
              </div>
              <div style={{ minWidth: 0 }}>
                <h2 style={{
                  fontSize: '1.1rem', fontWeight: '800',
                  color: 'var(--text-primary)', margin: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {project.name}
                </h2>
                {project.packageName && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                    {project.packageName}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: meta info chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {project.address && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
                padding: '3px 8px', border: '1px solid var(--border)',
              }}>
                <MapPin size={11} /> {project.address}
              </span>
            )}
            {project.investor && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
                padding: '3px 8px', border: '1px solid var(--border)',
              }}>
                <Building2 size={11} /> {project.investor}
              </span>
            )}
            {project.supervisor && (
              <span style={{
                display: 'flex', alignItems: 'center', gap: '3px',
                background: 'rgba(255,255,255,0.05)', borderRadius: '20px',
                padding: '3px 8px', border: '1px solid var(--border)',
              }}>
                <Users size={11} /> {project.supervisor}
              </span>
            )}
          </div>
        </div>

        {/* ── Stats + Export row ── */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}>
          {/* Stat: diaries */}
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.18)',
          }}>
            <FileText size={16} color="#10b981" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#10b981', lineHeight: 1 }}>
                {projectDiaries.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1px' }}>nhật ký</div>
            </div>
          </div>

          {/* Stat: minutes */}
          <div style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.07)',
            border: '1px solid rgba(239,68,68,0.18)',
          }}>
            <FileSpreadsheet size={16} color="#ef4444" />
            <div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ef4444', lineHeight: 1 }}>
                {projectMinutes.length}
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '1px' }}>biên bản</div>
            </div>
          </div>

          {/* Export buttons */}
          <button
            onClick={handleExportAll}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(0,180,216,0.1)',
              border: '1px solid rgba(0,180,216,0.25)',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
            title="Xuất toàn bộ nhật ký ra Word"
          >
            <Download size={15} />
            <span className="hide-on-xs">.docx</span>
          </button>
          <button
            onClick={handleExportAllPDF}
            style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 12px',
              borderRadius: '10px',
              background: 'rgba(249,115,22,0.1)',
              border: '1px solid rgba(249,115,22,0.3)',
              color: '#f97316',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600',
              whiteSpace: 'nowrap',
            }}
            title="Xuất toàn bộ nhật ký ra PDF"
          >
            <Download size={15} />
            <span className="hide-on-xs">.pdf</span>
          </button>
        </div>

        {/* ── Tab switcher ── */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          flexShrink: 0,
          padding: '0 16px',
          gap: '4px',
        }}>
          <button
            onClick={() => setActiveTab('diary')}
            style={{
              flex: 1,
              padding: '11px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'diary'
                ? '2px solid #10b981'
                : '2px solid transparent',
              color: activeTab === 'diary' ? '#10b981' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            <FileText size={15} />
            Nhật ký
            <span style={{
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: '10px',
              background: activeTab === 'diary' ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'diary' ? '#10b981' : 'var(--text-light)',
              fontWeight: '700',
            }}>
              {projectDiaries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('minute')}
            style={{
              flex: 1,
              padding: '11px 8px',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'minute'
                ? '2px solid #ef4444'
                : '2px solid transparent',
              color: activeTab === 'minute' ? '#ef4444' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.15s',
            }}
          >
            <FileSpreadsheet size={15} />
            Biên bản
            <span style={{
              fontSize: '0.72rem',
              padding: '1px 6px',
              borderRadius: '10px',
              background: activeTab === 'minute' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.06)',
              color: activeTab === 'minute' ? '#ef4444' : 'var(--text-light)',
              fontWeight: '700',
            }}>
              {projectMinutes.length}
            </span>
          </button>
        </div>

        {/* ── Tab content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {activeTab === 'diary' && (
            <>
              {projectDiaries.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '48px 24px', gap: '12px', textAlign: 'center',
                }}>
                  <FileText size={40} color="var(--text-light)" strokeWidth={1.2} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Chưa có nhật ký nào cho dự án này
                  </p>
                </div>
              ) : (
                projectDiaries.map((d) => <DiaryCard key={d.id} d={d} />)
              )}
            </>
          )}

          {activeTab === 'minute' && (
            <>
              {projectMinutes.length === 0 ? (
                <div style={{
                  flex: 1, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  padding: '48px 24px', gap: '12px', textAlign: 'center',
                }}>
                  <FileSpreadsheet size={40} color="var(--text-light)" strokeWidth={1.2} />
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    Chưa có biên bản phát sinh nào
                  </p>
                </div>
              ) : (
                projectMinutes.map((m) => <MinuteCard key={m.id} m={m} />)
              )}
            </>
          )}
        </div>

        {/* ── Bottom safe area spacer for iOS ── */}
        <div style={{ height: 'env(safe-area-inset-bottom, 12px)', flexShrink: 0 }} />
      </div>
    </div>
  );
}
