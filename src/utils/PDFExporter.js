/**
 * PDFExporter.js
 * Exports all NKTC diaries to a single multi-page PDF using jsPDF directly.
 * NO html2canvas / NO DOM rendering — content is drawn programmatically,
 * identical approach to WordExporter.js but targeting PDF pages.
 *
 * Requires: jspdf (already bundled via html2pdf.js dependency)
 */

// ─── helpers ────────────────────────────────────────────────────────────────

/** Split long text into lines that fit within maxWidth (pt) for a given font size */
function splitText(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text ?? ''), maxWidth);
}

/** Draw a horizontal rule */
function drawHR(doc, y, x1, x2, color = [148, 163, 184], lw = 0.3) {
  doc.setDrawColor(...color);
  doc.setLineWidth(lw);
  doc.line(x1, y, x2, y);
}

/** Draw a dashed horizontal rule (simulated with short segments) */
function drawDashedHR(doc, y, x1, x2, color = [203, 213, 225]) {
  doc.setDrawColor(...color);
  doc.setLineWidth(0.3);
  const dashLen = 3;
  const gapLen  = 2;
  let cur = x1;
  while (cur < x2) {
    doc.line(cur, y, Math.min(cur + dashLen, x2), y);
    cur += dashLen + gapLen;
  }
}

// ─── page dimensions (A4 in mm) ─────────────────────────────────────────────
const PAGE_W  = 210;
const PAGE_H  = 297;
const MARGIN_L = 20;   // left margin
const MARGIN_R = 15;   // right margin
const MARGIN_T = 15;   // top margin
const MARGIN_B = 18;   // bottom margin
const CONTENT_W = PAGE_W - MARGIN_L - MARGIN_R;   // 175 mm
const CONTENT_RIGHT = MARGIN_L + CONTENT_W;        // 195 mm

// ─── per-diary page renderer ─────────────────────────────────────────────────

/**
 * Renders one diary entry onto current jsPDF page(s).
 * Returns the y position after rendering (not normally needed).
 */
async function renderDiaryPage(doc, diary, project) {
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

  const contractorA     = (project?.contractorA || 'TỔNG THẦU').toUpperCase();
  const contractorB     = (project?.contractorB || 'CÔNG TY CỔ PHẦN HYDROTECH').toUpperCase();
  const projectName     = project?.name         || 'N/A';
  const projectAddress  = project?.address      || 'N/A';
  const projectInvestor = project?.investor     || 'N/A';
  const packageInfo     = project
    ? `${project.packageName || ''} / ${project.categoryName || ''}`
    : 'N/A';
  const supervisorName  = project?.supervisor   || 'Kỹ sư giám sát';

  const equipmentText = Array.isArray(thiet_bi) && thiet_bi.length > 0
    ? thiet_bi.map(t => typeof t === 'string' ? t : (t.name || String(t))).join(', ')
    : 'Không có thiết bị lớn.';

  const materialText = Array.isArray(vat_lieu) && vat_lieu.length > 0
    ? vat_lieu.map(v => typeof v === 'string' ? v : (v.name || String(v))).join(', ')
    : 'Không nhập vật liệu mới.';

  const progressItems = (tien_trinh_cong_viec || []).filter(l => l && l.trim() !== '');

  // ── convenience: advance y, add new page if needed ──────────────────────
  let y = MARGIN_T;

  const checkNewPage = (needed = 10) => {
    if (y + needed > PAGE_H - MARGIN_B) {
      doc.addPage();
      y = MARGIN_T;
    }
  };

  const lineH  = (size) => size * 0.3528 * 1.4;   // mm per line at given pt, line-height 1.4
  const small  = 8;
  const normal = 10;
  const heading = 11;
  const titleSize = 16;

  // ── HEADER ──────────────────────────────────────────────────────────────
  // Left: contractor names
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(small);
  doc.setTextColor(30, 41, 59);
  doc.text(contractorA, MARGIN_L, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(contractorB, MARGIN_L, y + lineH(small));

  // Right: national header
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(small);
  doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', CONTENT_RIGHT, y, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.text('Độc lập - Tự do - Hạnh phúc', CONTENT_RIGHT, y + lineH(small), { align: 'right' });

  y += lineH(small) * 2 + 2;
  drawHR(doc, y, MARGIN_L, CONTENT_RIGHT, [148, 163, 184], 0.4);
  y += 3;

  // ── TITLE ──────────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(titleSize);
  doc.setTextColor(15, 43, 72);
  doc.text('NHẬT KÝ THI CÔNG', PAGE_W / 2, y + lineH(titleSize), { align: 'center' });
  y += lineH(titleSize) + 3;

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(normal);
  doc.setTextColor(71, 85, 105);
  doc.text(`Ngày: ${ngay}   |   Trang số: ${trang}`, PAGE_W / 2, y, { align: 'center' });
  y += lineH(normal) + 6;

  // ── SECTION I: Project info ─────────────────────────────────────────────
  checkNewPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(heading);
  doc.setTextColor(15, 43, 72);
  doc.text('I. THÔNG TIN DỰ ÁN', MARGIN_L, y);
  y += lineH(heading) * 0.5;
  drawHR(doc, y, MARGIN_L, CONTENT_RIGHT, [226, 232, 240]);
  y += 3;

  const labelW = 50;  // mm for label column
  const valueX = MARGIN_L + labelW;
  const valueW = CONTENT_W - labelW;

  const rows1 = [
    ['Dự án:',            projectName],
    ['Địa chỉ:',          projectAddress],
    ['Chủ đầu tư:',       projectInvestor],
    ['Gói thầu/Hạng mục:', packageInfo],
  ];

  for (const [label, value] of rows1) {
    checkNewPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(normal);
    doc.setTextColor(30, 41, 59);
    doc.text(label, MARGIN_L, y);

    doc.setFont('helvetica', 'normal');
    const lines = splitText(doc, value, valueW);
    doc.text(lines, valueX, y);
    y += lineH(normal) * Math.max(lines.length, 1) + 1;
  }

  y += 4;

  // ── SECTION II: Weather / Manpower / Equipment ──────────────────────────
  checkNewPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(heading);
  doc.setTextColor(15, 43, 72);
  doc.text('II. THỜI TIẾT, NHÂN LỰC & THIẾT BỊ', MARGIN_L, y);
  y += lineH(heading) * 0.5;
  drawHR(doc, y, MARGIN_L, CONTENT_RIGHT, [226, 232, 240]);
  y += 3;

  const rows2 = [
    ['Thời tiết:',        `Sáng: ${thoi_tiet_sang} | Chiều: ${thoi_tiet_chieu}`],
    ['Nhân lực:',         `${Number(so_luong_cong_nhan) || 0} người`],
    ['Thiết bị thi công:', equipmentText],
    ['Vật liệu đưa vào:', materialText],
  ];

  for (const [label, value] of rows2) {
    checkNewPage(12);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(normal);
    doc.setTextColor(30, 41, 59);
    doc.text(label, MARGIN_L, y);
    doc.setFont('helvetica', 'normal');
    const lines = splitText(doc, value, valueW);
    doc.text(lines, valueX, y);
    y += lineH(normal) * Math.max(lines.length, 1) + 1;
  }

  y += 4;

  // ── SECTION III: Progress ───────────────────────────────────────────────
  checkNewPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(heading);
  doc.setTextColor(15, 43, 72);
  doc.text('III. TIẾN TRÌNH THI CÔNG CHI TIẾT', MARGIN_L, y);
  y += lineH(heading) * 0.5;
  drawHR(doc, y, MARGIN_L, CONTENT_RIGHT, [226, 232, 240]);
  y += 3;

  if (progressItems.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(normal);
    doc.setTextColor(100, 116, 139);
    doc.text('Chưa có tiến trình thi công nào được nhập...', MARGIN_L + 4, y);
    y += lineH(normal) + 1;
  } else {
    for (let i = 0; i < progressItems.length; i++) {
      checkNewPage(10);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(normal);
      doc.setTextColor(30, 41, 59);
      const lines = splitText(doc, `${i + 1}. ${progressItems[i]}`, CONTENT_W - 4);
      doc.text(lines, MARGIN_L + 4, y);
      y += lineH(normal) * lines.length + 1;
    }
  }

  y += 4;

  // ── SECTION IV: Safety ──────────────────────────────────────────────────
  checkNewPage(16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(heading);
  doc.setTextColor(15, 43, 72);
  doc.text('IV. AN TOÀN & VỆ SINH MÔI TRƯỜNG', MARGIN_L, y);
  y += lineH(heading) * 0.5;
  drawHR(doc, y, MARGIN_L, CONTENT_RIGHT, [226, 232, 240]);
  y += 3;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(normal);
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.text('An toàn lao động: ', MARGIN_L, y, { renderingMode: 'fill' });
  const atW = doc.getTextWidth('An toàn lao động: ');
  doc.setFont('helvetica', 'normal');
  doc.text(an_toan_lao_dong, MARGIN_L + atW, y);
  const atTotal = atW + doc.getTextWidth(an_toan_lao_dong) + 6;
  doc.setFont('helvetica', 'bold');
  doc.text(' | Vệ sinh môi trường: ', MARGIN_L + atTotal, y);
  const vsW = doc.getTextWidth(' | Vệ sinh môi trường: ');
  doc.setFont('helvetica', 'normal');
  doc.text(ve_sinh_moi_truong, MARGIN_L + atTotal + vsW, y);
  y += lineH(normal) + 4;

  // ── SECTION V: Issues ───────────────────────────────────────────────────
  checkNewPage(16);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(heading);
  doc.setTextColor(15, 43, 72);
  doc.text('V. VƯỚNG MẮC & KIẾN NGHỊ', MARGIN_L, y);
  y += lineH(heading) * 0.5;
  drawHR(doc, y, MARGIN_L, CONTENT_RIGHT, [226, 232, 240]);
  y += 3;

  doc.setFontSize(normal);
  doc.setTextColor(30, 41, 59);
  if (!ghi_chu_khac) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 116, 139);
    doc.text('Không có vướng mắc nào.', MARGIN_L, y);
  } else {
    doc.setFont('helvetica', 'normal');
    const lines = splitText(doc, ghi_chu_khac, CONTENT_W);
    doc.text(lines, MARGIN_L, y);
    y += lineH(normal) * (lines.length - 1);
  }
  y += lineH(normal) + 6;

  // ── SIGNATURES ───────────────────────────────────────────────────────────
  checkNewPage(35);
  drawDashedHR(doc, y, MARGIN_L, CONTENT_RIGHT, [203, 213, 225]);
  y += 5;

  const colW = CONTENT_W / 2;
  const col1X = MARGIN_L + colW / 2;
  const col2X = MARGIN_L + colW + colW / 2;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(normal);
  doc.setTextColor(30, 41, 59);
  doc.text('ĐẠI DIỆN TỔNG THẦU', col1X, y, { align: 'center' });
  doc.text('ĐẠI DIỆN HYDROTECH BÊN B', col2X, y, { align: 'center' });
  y += lineH(normal);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(small);
  doc.setTextColor(100, 116, 139);
  doc.text('(Ký, ghi rõ họ tên)', col1X, y, { align: 'center' });
  doc.text('(Ký, ghi rõ họ tên)', col2X, y, { align: 'center' });
  y += lineH(small) + 20;  // space for signature

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(normal);
  doc.setTextColor(30, 41, 59);
  doc.text(supervisorName, col2X, y, { align: 'center' });
  y += lineH(normal) + 6;

  // ── PHOTOS ───────────────────────────────────────────────────────────────
  if (Array.isArray(photos) && photos.length > 0) {
    // Photos go on a new page
    doc.addPage();
    let py = MARGIN_T;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(heading);
    doc.setTextColor(15, 43, 72);
    doc.text('HÌNH ẢNH MINH HỌA HIỆN TRƯỜNG', PAGE_W / 2, py, { align: 'center' });
    py += lineH(heading) + 4;
    drawHR(doc, py, MARGIN_L, CONTENT_RIGHT, [203, 213, 225], 0.5);
    py += 4;

    // 2-column grid
    const cols       = 2;
    const gap        = 6;
    const imgW       = (CONTENT_W - gap) / cols;
    const imgH       = imgW * (3 / 4);  // 4:3 ratio
    const captionH   = 6;
    const cellH      = imgH + captionH + 4;

    for (let i = 0; i < photos.length; i++) {
      const col = i % cols;
      const row = Math.floor(i / cols);

      // New page if needed
      if (col === 0 && i > 0 && py + cellH > PAGE_H - MARGIN_B) {
        doc.addPage();
        py = MARGIN_T;
      }

      const imgX = MARGIN_L + col * (imgW + gap);
      const imgY = py;

      try {
        // photos[] are base64 data URLs
        const src = photos[i];
        if (src && src.startsWith('data:image')) {
          const format = src.startsWith('data:image/png') ? 'PNG' : 'JPEG';
          doc.addImage(src, format, imgX, imgY, imgW, imgH, undefined, 'FAST');
        }
      } catch (e) {
        // Draw placeholder rectangle if image fails
        doc.setDrawColor(203, 213, 225);
        doc.rect(imgX, imgY, imgW, imgH);
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(7);
        doc.setTextColor(148, 163, 184);
        doc.text('Không tải được ảnh', imgX + imgW / 2, imgY + imgH / 2, { align: 'center' });
      }

      // Caption
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Hình ảnh ${i + 1}`, imgX + imgW / 2, imgY + imgH + 4, { align: 'center' });

      // After filling a row, advance py
      if (col === cols - 1 || i === photos.length - 1) {
        py += cellH + gap;
      }
    }
  }
}

// ─── main export function ────────────────────────────────────────────────────

/**
 * Export all diaries for a project to a single multi-page PDF using jsPDF directly.
 * Zero DOM/html2canvas — text is drawn programmatically (same approach as WordExporter).
 *
 * @param {Array}    diariesList  - array of diary objects
 * @param {Object}   project      - project data
 * @param {Function} onToast      - toast callback(message, isError?)
 */
export const exportAllNKTCtoPDF = async (diariesList, project, onToast) => {
  if (!diariesList || diariesList.length === 0) {
    onToast?.('Không có nhật ký nào để xuất', true);
    return;
  }

  // Sort ascending by date (oldest first)
  const sorted = [...diariesList].sort((a, b) => {
    const parse = (d) => {
      const p = (d || '').split('/');
      return p.length === 3 ? new Date(+p[2], +p[1] - 1, +p[0]) : new Date(0);
    };
    return parse(a.ngay) - parse(b.ngay);
  });

  try {
    // Dynamically import jsPDF (already bundled by html2pdf dependency)
    const { default: html2pdfLib } = await import('html2pdf.js');

    // Extract jsPDF constructor from html2pdf's bundle
    // html2pdf exposes jsPDF via window.jsPDF or we can import directly
    let jsPDFCtor;
    try {
      const jspdfMod = await import('jspdf');
      jsPDFCtor = jspdfMod.jsPDF || jspdfMod.default;
    } catch {
      // Fallback: jsPDF might be on window after html2pdf loads
      await html2pdfLib;
      jsPDFCtor = window.jsPDF || window.jspdf?.jsPDF;
    }

    if (!jsPDFCtor) throw new Error('jsPDF not available');

    const doc = new jsPDFCtor({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    for (let i = 0; i < sorted.length; i++) {
      if (i > 0) doc.addPage();
      await renderDiaryPage(doc, sorted[i], project);
    }

    const projectSlug = (project?.name || 'nktc')
      .replace(/\s+/g, '_')
      .replace(/[^\w\u00C0-\u024F\u1E00-\u1EFF-]/g, '')
      .substring(0, 40);

    doc.save(`NhatKy_ToanBo_${projectSlug}.pdf`);
    onToast?.(`Đã xuất ${sorted.length} nhật ký ra PDF thành công!`);
  } catch (err) {
    console.error('[PDFExporter] jsPDF error:', err);
    onToast?.('Lỗi khi xuất file PDF: ' + err.message, true);
  }
};
