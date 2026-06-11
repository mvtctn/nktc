/**
 * PDFExporter.js
 * Exports all NKTC diaries for a project into a single multi-page PDF.
 * Uses html2pdf.js with a dynamically created off-screen HTML container.
 */

/**
 * Build the HTML string for a single diary entry (A4 page).
 * @param {Object} diary - diary data object
 * @param {Object} project - project data object
 * @param {boolean} isFirst - is this the first diary (no page break before)
 * @returns {string} HTML string
 */
function buildDiaryPageHTML(diary, project, isFirst) {
  const {
    ngay = '',
    trang = '1',
    thoi_tiet_sang = 'Nắng',
    thoi_tiet_chieu = 'Nắng',
    so_luong_cong_nhan = 0,
    thiet_bi = [],
    vat_lieu = [],
    tien_trinh_cong_viec = [],
    an_toan_lao_dong = 'Tốt',
    ve_sinh_moi_truong = 'Tốt',
    ghi_chu_khac = '',
    photos = [],
  } = diary;

  const contractorA = project?.contractorA?.toUpperCase() || 'TỔNG THẦU';
  const contractorB = project?.contractorB?.toUpperCase() || 'CÔNG TY CỔ PHẦN HYDROTECH';
  const projectName = project?.name || 'N/A';
  const projectAddress = project?.address || 'N/A';
  const projectInvestor = project?.investor || 'N/A';
  const packageInfo = project ? `${project.packageName || ''} / ${project.categoryName || ''}` : 'N/A';
  const supervisorName = project?.supervisor || 'Kỹ sư giám sát';

  const progressLines = (tien_trinh_cong_viec || [])
    .filter(l => l && l.trim() !== '')
    .map((line, idx) => `<div style="padding: 2px 0;">${idx + 1}. ${escapeHtml(line)}</div>`)
    .join('') || '<span style="font-style:italic;color:#64748b;">Chưa có tiến trình thi công nào được nhập...</span>';

  const equipmentText = Array.isArray(thiet_bi) && thiet_bi.length > 0
    ? thiet_bi.map(t => escapeHtml(typeof t === 'string' ? t : (t.name || JSON.stringify(t)))).join(', ')
    : 'Không có thiết bị lớn.';

  const materialText = Array.isArray(vat_lieu) && vat_lieu.length > 0
    ? vat_lieu.map(v => escapeHtml(typeof v === 'string' ? v : (v.name || JSON.stringify(v)))).join(', ')
    : 'Không nhập vật liệu mới.';

  const pageBreakStyle = isFirst ? '' : 'page-break-before: always;';

  const photosHTML = Array.isArray(photos) && photos.length > 0
    ? `<div class="photo-print-section" style="page-break-before: always; margin-top: 32px; padding-top: 20px; border-top: 2px solid #cbd5e1;">
        <div style="text-align:center; font-size:0.9rem; font-weight:bold; margin-bottom:12px;">HÌNH ẢNH MINH HỌA HIỆN TRƯỜNG</div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          ${photos.map((photo, idx) => `
            <div style="text-align:center; border: 1px solid #cbd5e1; padding: 6px; border-radius: 4px;">
              <img src="${photo}" alt="Ảnh hiện trường ${idx + 1}" style="width:100%; aspect-ratio:4/3; object-fit:cover; border-radius:2px;" />
              <span style="font-size:0.7rem; color:#64748b; font-style:italic;">Hình ảnh ${idx + 1}</span>
            </div>
          `).join('')}
        </div>
      </div>`
    : '';

  return `
    <div class="diary-page" style="${pageBreakStyle} padding: 24px; background: white; color: #1e293b; font-family: 'Times New Roman', Times, serif; font-size: 0.85rem; max-width: 794px; margin: 0 auto; box-sizing: border-box;">
      <!-- Header -->
      <div style="display:flex; justify-content:space-between; font-size:0.75rem; font-weight:bold; border-bottom:1px solid #94a3b8; padding-bottom:10px; margin-bottom:16px;">
        <div>
          <div>${escapeHtml(contractorA)}</div>
          <div style="font-weight:normal; color:#475569; margin-top:2px;">${escapeHtml(contractorB)}</div>
        </div>
        <div style="text-align:right;">
          <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
          <div>Độc lập - Tự do - Hạnh phúc</div>
        </div>
      </div>

      <!-- Title -->
      <div style="text-align:center; margin: 20px 0;">
        <h2 style="font-size:1.5rem; font-weight:bold; margin:0; font-family:inherit;">NHẬT KÝ THI CÔNG</h2>
        <div style="font-style:italic; font-size:0.85rem; font-weight:bold; margin-top:4px;">
          Ngày: ${escapeHtml(ngay)} | Trang số: ${escapeHtml(String(trang))}
        </div>
      </div>

      <!-- Content sections -->
      <div style="display:flex; flex-direction:column; gap:16px; flex:1;">
        <!-- I. Project info -->
        <div>
          <h4 style="font-size:0.9rem; font-weight:bold; color:#0f2b48; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px;">I. THÔNG TIN DỰ ÁN</h4>
          <table style="width:100%; border-collapse:collapse; font-size:inherit;">
            <tbody>
              <tr><td style="width:25%; font-weight:bold; padding:4px 0;">Dự án:</td><td style="padding:4px 0;">${escapeHtml(projectName)}</td></tr>
              <tr><td style="font-weight:bold; padding:4px 0;">Địa chỉ:</td><td style="padding:4px 0;">${escapeHtml(projectAddress)}</td></tr>
              <tr><td style="font-weight:bold; padding:4px 0;">Chủ đầu tư:</td><td style="padding:4px 0;">${escapeHtml(projectInvestor)}</td></tr>
              <tr><td style="font-weight:bold; padding:4px 0;">Gói thầu/Hạng mục:</td><td style="padding:4px 0;">${escapeHtml(packageInfo)}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- II. Weather, Manpower, Equipment -->
        <div>
          <h4 style="font-size:0.9rem; font-weight:bold; color:#0f2b48; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px;">II. THỜI TIẾT, NHÂN LỰC &amp; THIẾT BỊ</h4>
          <table style="width:100%; border-collapse:collapse; font-size:inherit;">
            <tbody>
              <tr><td style="width:25%; font-weight:bold; padding:4px 0;">Thời tiết:</td><td style="padding:4px 0;">Sáng: ${escapeHtml(thoi_tiet_sang)} | Chiều: ${escapeHtml(thoi_tiet_chieu)}</td></tr>
              <tr><td style="font-weight:bold; padding:4px 0;">Nhân lực:</td><td style="padding:4px 0;">${so_luong_cong_nhan} người</td></tr>
              <tr style="vertical-align:top;"><td style="font-weight:bold; padding:4px 0;">Thiết bị thi công:</td><td style="padding:4px 0;">${equipmentText}</td></tr>
              <tr style="vertical-align:top;"><td style="font-weight:bold; padding:4px 0;">Vật liệu đưa vào:</td><td style="padding:4px 0;">${materialText}</td></tr>
            </tbody>
          </table>
        </div>

        <!-- III. Progress -->
        <div>
          <h4 style="font-size:0.9rem; font-weight:bold; color:#0f2b48; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px;">III. TIẾN TRÌNH THI CÔNG CHI TIẾT</h4>
          <div style="display:flex; flex-direction:column; gap:4px; padding-left:8px;">${progressLines}</div>
        </div>

        <!-- IV. Safety -->
        <div>
          <h4 style="font-size:0.9rem; font-weight:bold; color:#0f2b48; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px;">IV. AN TOÀN &amp; VỆ SINH MÔI TRƯỜNG</h4>
          <div>An toàn lao động: <strong>${escapeHtml(an_toan_lao_dong)}</strong> | Vệ sinh môi trường: <strong>${escapeHtml(ve_sinh_moi_truong)}</strong></div>
        </div>

        <!-- V. Issues -->
        <div>
          <h4 style="font-size:0.9rem; font-weight:bold; color:#0f2b48; border-bottom:1px solid #e2e8f0; padding-bottom:4px; margin-bottom:6px;">V. VƯỚNG MẮC &amp; KIẾN NGHỊ</h4>
          <div style="${!ghi_chu_khac ? 'font-style:italic;' : ''}">${escapeHtml(ghi_chu_khac || 'Không có vướng mắc nào.')}</div>
        </div>
      </div>

      <!-- Signatures -->
      <div style="display:grid; grid-template-columns:1fr 1fr; font-size:0.8rem; text-align:center; margin-top:32px; padding-top:16px; border-top:1px dashed #cbd5e1;">
        <div>
          <div style="font-weight:bold;">ĐẠI DIỆN TỔNG THẦU</div>
          <div style="font-style:italic; color:#64748b; font-size:0.75rem;">(Ký, ghi rõ họ tên)</div>
        </div>
        <div>
          <div style="font-weight:bold;">ĐẠI DIỆN HYDROTECH BÊN B</div>
          <div style="font-style:italic; color:#64748b; font-size:0.75rem;">(Ký, ghi rõ họ tên)</div>
          <div style="font-weight:bold; margin-top:40px;">${escapeHtml(supervisorName)}</div>
        </div>
      </div>

      ${photosHTML}
    </div>
  `;
}

/**
 * Simple HTML escape to prevent XSS in generated HTML.
 */
function escapeHtml(text) {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Export all diaries for a project to a single multi-page PDF.
 * @param {Array} diariesList - sorted array of diary objects
 * @param {Object} project - project data
 * @param {Function} onToast - toast callback
 */
export const exportAllNKTCtoPDF = async (diariesList, project, onToast) => {
  if (!diariesList || diariesList.length === 0) {
    onToast && onToast('Không có nhật ký nào để xuất', true);
    return;
  }

  // Sort ascending by date (oldest first)
  const sorted = [...diariesList].sort((a, b) => {
    const parseDate = (d) => {
      const p = (d || '').split('/');
      return p.length === 3 ? new Date(p[2], p[1] - 1, p[0]) : new Date(0);
    };
    return parseDate(a.ngay) - parseDate(b.ngay);
  });

  // Build full HTML document
  const pagesHTML = sorted
    .map((diary, idx) => buildDiaryPageHTML(diary, project, idx === 0))
    .join('\n');

  const fullHTML = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: white; }
    .diary-page { page-break-after: always; }
    .diary-page:last-child { page-break-after: avoid; }
    .photo-print-section { page-break-before: always; }
    img { max-width: 100%; }
  </style>
</head>
<body>
  ${pagesHTML}
</body>
</html>`;

  // Create off-screen container
  const container = document.createElement('div');
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    background: white;
    z-index: -9999;
    visibility: hidden;
  `;
  container.innerHTML = fullHTML;
  document.body.appendChild(container);

  const projectSlug = (project?.name || 'nktc').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '').substring(0, 40);
  const filename = `NhatKy_ToanBo_${projectSlug}.pdf`;

  try {
    const html2pdfModule = await import('html2pdf.js');
    const html2pdf = html2pdfModule.default;

    const opt = {
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['css', 'legacy'], before: '.diary-page', avoid: '.avoid-break' },
    };

    await html2pdf().set(opt).from(container).save();
    onToast && onToast(`Đã xuất ${sorted.length} nhật ký ra PDF thành công!`);
  } catch (err) {
    console.error('PDF export error:', err);
    onToast && onToast('Lỗi khi xuất file PDF toàn bộ', true);
  } finally {
    document.body.removeChild(container);
  }
};
