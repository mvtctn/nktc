/**
 * PDFExporter.js
 * Exports all NKTC diaries to a single multi-page PDF.
 *
 * Uses EXACTLY the same approach as the single-diary "Xuất file PDF chuẩn (A4)" button
 * in NKTCForm.jsx:  html2pdf().from(element).save()
 *
 * Key insight: html2canvas needs an element that is ACTUALLY PAINTED by the browser.
 * We show a full-screen white overlay, populate it, run html2pdf, then remove it.
 * This is the only reliable way to get Vietnamese characters rendered correctly
 * (the browser uses its own font stack — no font embedding needed).
 */

/** Build the HTML string for one diary page — mirrors the JSX in NKTCForm printAreaRef */
function buildDiaryHTML(diary, project) {
  const {
    ngay                 = '',
    trang                = '1',
    thoi_tiet_sang       = 'Nắng',
    thoi_tiet_chieu      = 'Nắng',
    so_luong_cong_nhan   = 0,
    thiet_bi             = [],
    vat_lieu             = [],
    tien_trinh_cong_viec = [],
    an_toan_lao_dong     = 'Tốt',
    ve_sinh_moi_truong   = 'Tốt',
    ghi_chu_khac         = '',
    photos               = [],
  } = diary;

  const contractorA     = (project?.contractorA  || 'TỔNG THẦU').toUpperCase();
  const contractorB     = (project?.contractorB  || 'CÔNG TY CỔ PHẦN HYDROTECH').toUpperCase();
  const projectName     =  project?.name         || 'N/A';
  const projectAddress  =  project?.address      || 'N/A';
  const projectInvestor =  project?.investor     || 'N/A';
  const packageInfo     =  project
    ? `${project.packageName || ''} / ${project.categoryName || ''}`
    : 'N/A';
  const supervisorName  =  project?.supervisor   || 'Kỹ sư giám sát';

  const equipmentText = Array.isArray(thiet_bi) && thiet_bi.length > 0
    ? thiet_bi.map(t => typeof t === 'string' ? t : (t.name || '')).join(', ')
    : 'Không có thiết bị lớn.';

  const materialText = Array.isArray(vat_lieu) && vat_lieu.length > 0
    ? vat_lieu.map(v => typeof v === 'string' ? v : (v.name || '')).join(', ')
    : 'Không nhập vật liệu mới.';

  const progressHTML = (tien_trinh_cong_viec || [])
    .filter(l => l && l.trim() !== '')
    .map((line, idx) => `<div>${idx + 1}. ${line}</div>`)
    .join('') || '<span style="font-style:italic;color:#64748b;">Chưa có tiến trình thi công nào được nhập...</span>';

  const photosHTML = Array.isArray(photos) && photos.length > 0
    ? `<div class="html2pdf__page-break" style="page-break-before:always;margin-top:32px;padding-top:20px;border-top:2px solid #cbd5e1;">
        <div style="text-align:center;font-size:0.9rem;font-weight:bold;margin-bottom:12px;">HÌNH ẢNH MINH HỌA HIỆN TRƯỜNG</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          ${photos.map((src, i) => `
            <div style="text-align:center;border:1px solid #cbd5e1;padding:6px;border-radius:4px;">
              <img src="${src}" alt="Ảnh ${i + 1}" style="width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:2px;" />
              <span style="font-size:0.7rem;color:#64748b;font-style:italic;">Hình ảnh ${i + 1}</span>
            </div>`).join('')}
        </div>
      </div>`
    : '';

  // This mirrors the JSX structure in NKTCForm.jsx printAreaRef exactly
  return `
<div style="
  padding:24px;
  background:white;
  color:#1e293b;
  font-family:'Times New Roman',Times,serif;
  font-size:0.85rem;
  width:794px;
  min-height:1123px;
  display:flex;
  flex-direction:column;
  box-sizing:border-box;
  page-break-after:always;
">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:bold;border-bottom:1px solid #94a3b8;padding-bottom:10px;margin-bottom:16px;">
    <div>
      <div>${contractorA}</div>
      <div style="font-weight:normal;color:#475569;margin-top:2px;">${contractorB}</div>
    </div>
    <div style="text-align:right;">
      <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div>Độc lập - Tự do - Hạnh phúc</div>
    </div>
  </div>

  <!-- Title -->
  <div style="text-align:center;margin:20px 0;">
    <h2 style="font-size:1.5rem;font-weight:bold;margin:0;font-family:inherit;">NHẬT KÝ THI CÔNG</h2>
    <div style="font-style:italic;font-size:0.85rem;font-weight:bold;margin-top:4px;">
      Ngày: ${ngay} | Trang số: ${trang}
    </div>
  </div>

  <!-- Content -->
  <div style="display:flex;flex-direction:column;gap:16px;font-size:0.85rem;flex:1;">
    <div>
      <h4 style="font-size:0.9rem;font-weight:bold;color:#0f2b48;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">I. THÔNG TIN DỰ ÁN</h4>
      <table style="width:100%;border-collapse:collapse;font-size:inherit;">
        <tbody>
          <tr><td style="width:25%;font-weight:bold;padding:4px 0;">Dự án:</td><td style="padding:4px 0;">${projectName}</td></tr>
          <tr><td style="font-weight:bold;padding:4px 0;">Địa chỉ:</td><td style="padding:4px 0;">${projectAddress}</td></tr>
          <tr><td style="font-weight:bold;padding:4px 0;">Chủ đầu tư:</td><td style="padding:4px 0;">${projectInvestor}</td></tr>
          <tr><td style="font-weight:bold;padding:4px 0;">Gói thầu/Hạng mục:</td><td style="padding:4px 0;">${packageInfo}</td></tr>
        </tbody>
      </table>
    </div>

    <div>
      <h4 style="font-size:0.9rem;font-weight:bold;color:#0f2b48;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">II. THỜI TIẾT, NHÂN LỰC &amp; THIẾT BỊ</h4>
      <table style="width:100%;border-collapse:collapse;font-size:inherit;">
        <tbody>
          <tr><td style="width:25%;font-weight:bold;padding:4px 0;">Thời tiết:</td><td style="padding:4px 0;">Sáng: ${thoi_tiet_sang} | Chiều: ${thoi_tiet_chieu}</td></tr>
          <tr><td style="font-weight:bold;padding:4px 0;">Nhân lực:</td><td style="padding:4px 0;">${Number(so_luong_cong_nhan) || 0} người</td></tr>
          <tr style="vertical-align:top;"><td style="font-weight:bold;padding:4px 0;">Thiết bị thi công:</td><td style="padding:4px 0;">${equipmentText}</td></tr>
          <tr style="vertical-align:top;"><td style="font-weight:bold;padding:4px 0;">Vật liệu đưa vào:</td><td style="padding:4px 0;">${materialText}</td></tr>
        </tbody>
      </table>
    </div>

    <div>
      <h4 style="font-size:0.9rem;font-weight:bold;color:#0f2b48;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">III. TIẾN TRÌNH THI CÔNG CHI TIẾT</h4>
      <div style="display:flex;flex-direction:column;gap:4px;padding-left:8px;">${progressHTML}</div>
    </div>

    <div>
      <h4 style="font-size:0.9rem;font-weight:bold;color:#0f2b48;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">IV. AN TOÀN &amp; VỆ SINH MÔI TRƯỜNG</h4>
      <div>An toàn lao động: <strong>${an_toan_lao_dong}</strong> | Vệ sinh môi trường: <strong>${ve_sinh_moi_truong}</strong></div>
    </div>

    <div>
      <h4 style="font-size:0.9rem;font-weight:bold;color:#0f2b48;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">V. VƯỚNG MẮC &amp; KIẾN NGHỊ</h4>
      <div style="${!ghi_chu_khac ? 'font-style:italic;color:#64748b;' : ''}">${ghi_chu_khac || 'Không có vướng mắc nào.'}</div>
    </div>
  </div>

  <!-- Signatures -->
  <div style="display:grid;grid-template-columns:1fr 1fr;font-size:0.8rem;text-align:center;margin-top:32px;padding-top:16px;border-top:1px dashed #cbd5e1;">
    <div>
      <div style="font-weight:bold;">ĐẠI DIỆN TỔNG THẦU</div>
      <div style="font-style:italic;color:#64748b;font-size:0.75rem;">(Ký, ghi rõ họ tên)</div>
    </div>
    <div>
      <div style="font-weight:bold;">ĐẠI DIỆN HYDROTECH BÊN B</div>
      <div style="font-style:italic;color:#64748b;font-size:0.75rem;">(Ký, ghi rõ họ tên)</div>
      <div style="font-weight:bold;margin-top:40px;">${supervisorName}</div>
    </div>
  </div>

  ${photosHTML}
</div>`;
}

/**
 * Export all diaries for a project to a single multi-page PDF.
 *
 * Approach: exactly mirrors the single-diary export (html2pdf + html2canvas).
 * A full-screen white overlay is shown temporarily so html2canvas can paint the content
 * (html2canvas requires elements to be actually rendered/painted by the browser).
 *
 * @param {Array}    diariesList
 * @param {Object}   project
 * @param {Function} onToast
 */
export const exportAllNKTCtoPDF = async (diariesList, project, onToast) => {
  if (!diariesList || diariesList.length === 0) {
    onToast?.('Không có nhật ký nào để xuất', true);
    return;
  }

  // Sort ascending (oldest first)
  const sorted = [...diariesList].sort((a, b) => {
    const parse = (d) => {
      const p = (d || '').split('/');
      return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]) : new Date(0);
    };
    return parse(a.ngay) - parse(b.ngay);
  });

  // Build combined HTML for all pages
  const allPagesHTML = sorted.map(d => buildDiaryHTML(d, project)).join('\n');

  // ── Create a FULL-SCREEN visible white overlay ────────────────────────────
  // This is the key: html2canvas needs a visually painted element.
  // We render it on screen (z-index 9999, covering the app), capture it, then remove.
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'width:100vw',
    'height:100vh',
    'background:white',
    'z-index:9999',
    'overflow:auto',
    'display:flex',
    'align-items:flex-start',
    'justify-content:center',
  ].join(';');
  overlay.setAttribute('aria-hidden', 'true');

  // Wrapper that holds all diary pages (794px wide, centered)
  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'width:794px;background:white;';
  wrapper.innerHTML = allPagesHTML;

  overlay.appendChild(wrapper);
  document.body.appendChild(overlay);

  // Two rAF cycles: first lets the browser attach, second lets it paint
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const projectSlug = (project?.name || 'nktc')
    .replace(/\s+/g, '_')
    .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF-]/g, '')
    .substring(0, 40);
  const filename = `NhatKy_ToanBo_${projectSlug}.pdf`;

  try {
    const { default: html2pdf } = await import('html2pdf.js');

    // Same options as the single-diary export in NKTCForm.jsx handleExportPDF
    const opt = {
      margin:      0,
      filename,
      image:       { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak:   { mode: ['css', 'legacy'] },
    };

    await html2pdf().set(opt).from(wrapper).save();
    onToast?.(`Đã xuất ${sorted.length} nhật ký ra PDF thành công!`);
  } catch (err) {
    console.error('[PDFExporter]', err);
    onToast?.('Lỗi khi xuất PDF: ' + err.message, true);
  } finally {
    // Always remove overlay
    if (overlay.parentNode) document.body.removeChild(overlay);
  }
};
