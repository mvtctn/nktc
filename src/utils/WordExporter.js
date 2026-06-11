import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  AlignmentType, 
  BorderStyle, 
  ImageRun,
  HeadingLevel,
  VerticalAlign,
  PageBreak
} from "docx";
import { saveAs } from "file-saver";

// Helper to convert base64 to Uint8Array buffer in browser
const base64ToBuffer = (base64Str) => {
  const base64Data = base64Str.split(",")[1];
  const binaryString = atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// EXPORT 1: NHẬT KÝ THI CÔNG (.docx)
export const buildNKTCSection = (logData, project, photos = []) => {
  const thinBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
  const borderLight = { style: BorderStyle.SINGLE, size: 6, color: "cbd5e1" };
  const borderDashed = { style: BorderStyle.DASHED, size: 6, color: "cbd5e1" };
  const noBorder = { style: BorderStyle.NONE };
  const noBorders = {
    top: noBorder, bottom: noBorder, left: noBorder, right: noBorder,
    insideHorizontal: noBorder, insideVertical: noBorder
  };

  const makeHeading = (text) => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: noBorder, bottom: borderLight, left: noBorder, right: noBorder,
        insideHorizontal: noBorder, insideVertical: noBorder
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 100, type: WidthType.PERCENTAGE },
              margins: { top: 120, bottom: 60, left: 0, right: 0 },
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: text,
                      bold: true,
                      size: 22, // 11pt
                      font: "Times New Roman",
                      color: "0f2b48"
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    });
  };

  return {
    properties: {
      page: {
        size: {
          width: 11906, // A4 width in twips
          height: 16838 // A4 height in twips
        },
        margin: {
          top: 1134,
          bottom: 1134,
          left: 1700,
          right: 1134
        }
      }
    },
    children: [
      // 1. TOP BORDERLESS HEADER TABLE (2 Columns)
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: {
          top: noBorder, bottom: thinBorder, left: noBorder, right: noBorder,
          insideHorizontal: noBorder, insideVertical: noBorder
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: project && project.contractorA ? project.contractorA.toUpperCase() : "TỔNG THẦU",
                        bold: true,
                        size: 18,
                        font: "Times New Roman"
                      })
                    ]
                  }),
                  new Paragraph({
                    spacing: { before: 40 },
                    children: [
                      new TextRun({
                        text: project && project.contractorB ? project.contractorB.toUpperCase() : "CÔNG TY CỔ PHẦN HYDROTECH",
                        size: 16,
                        font: "Times New Roman",
                        color: "475569"
                      })
                    ]
                  })
                ]
              }),
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new TextRun({
                        text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM",
                        bold: true,
                        size: 18,
                        font: "Times New Roman"
                      })
                    ]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    spacing: { before: 40 },
                    children: [
                      new TextRun({
                        text: "Độc lập - Tự do - Hạnh phúc",
                        bold: true,
                        size: 16,
                        font: "Times New Roman"
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 200, after: 100 } }),

      // 2. DOCUMENT TITLE
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "NHẬT KÝ THI CÔNG",
            bold: true,
            size: 32, // 16pt
            font: "Times New Roman"
          })
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: `Ngày: ${logData.ngay} | Trang số: ${logData.trang}`,
            italic: true,
            bold: true,
            size: 20,
            font: "Times New Roman"
          })
        ]
      }),

      // 3. SECTION I: THÔNG TIN DỰ ÁN
      makeHeading("I. THÔNG TIN DỰ ÁN"),
      new Paragraph({ spacing: { before: 100 } }),
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Dự án:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: project ? project.name : "N/A", size: 20, font: "Times New Roman" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Địa chỉ:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: project ? project.address : "N/A", size: 20, font: "Times New Roman" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Chủ đầu tư:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: project ? project.investor : "N/A", size: 20, font: "Times New Roman" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Gói thầu/Hạng mục:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: project ? `${project.packageName} / ${project.categoryName}` : "N/A", size: 20, font: "Times New Roman" })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 150 } }),

      // 4. SECTION II: THỜI TIẾT, NHÂN LỰC & THIẾT BỊ
      makeHeading("II. THỜI TIẾT, NHÂN LỰC & THIẾT BỊ"),
      new Paragraph({ spacing: { before: 100 } }),
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Thời tiết:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: `Sáng: ${logData.thoi_tiet_sang || "Bình thường"} | Chiều: ${logData.thoi_tiet_chieu || "Bình thường"}`, size: 20, font: "Times New Roman" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Nhân lực:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: `${logData.so_luong_cong_nhan || 0} người`, size: 20, font: "Times New Roman" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Thiết bị thi công:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: logData.thiet_bi && logData.thiet_bi.length > 0 ? logData.thiet_bi.join(", ") : "Không có thiết bị lớn.", size: 20, font: "Times New Roman" })] })]
              })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({
                width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Vật liệu đưa vào:", bold: true, size: 20, font: "Times New Roman" })] })]
              }),
              new TableCell({
                width: { size: 7238, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: logData.vat_lieu && logData.vat_lieu.length > 0 ? logData.vat_lieu.join(", ") : "Không nhập vật liệu mới.", size: 20, font: "Times New Roman" })] })]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 150 } }),

      // 5. SECTION III: TIẾN TRÌNH THI CÔNG CHI TIẾT
      makeHeading("III. TIẾN TRÌNH THI CÔNG CHI TIẾT"),
      new Paragraph({ spacing: { before: 100 } }),
      ...(logData.tien_trinh_cong_viec && logData.tien_trinh_cong_viec.length > 0
        ? logData.tien_trinh_cong_viec.map((task, idx) => new Paragraph({
            indent: { left: 240 },
            children: [
              new TextRun({ text: `${idx + 1}. ${task}`, size: 20, font: "Times New Roman" })
            ]
          }))
        : [new Paragraph({
            indent: { left: 240 },
            children: [
              new TextRun({ text: "Chưa có tiến trình thi công nào được nhập...", italic: true, size: 20, font: "Times New Roman", color: "777777" })
            ]
          })]),

      new Paragraph({ spacing: { before: 150 } }),

      // 6. SECTION IV: AN TOÀN & VỆ SINH MÔI TRƯỜNG
      makeHeading("IV. AN TOÀN & VỆ SINH MÔI TRƯỜNG"),
      new Paragraph({ spacing: { before: 100 } }),
      new Paragraph({
        indent: { left: 240 },
        children: [
          new TextRun({ text: "An toàn lao động: ", size: 20, font: "Times New Roman" }),
          new TextRun({ text: logData.an_toan_lao_dong || "Tốt", bold: true, size: 20, font: "Times New Roman" }),
          new TextRun({ text: " | Vệ sinh môi trường: ", size: 20, font: "Times New Roman" }),
          new TextRun({ text: logData.ve_sinh_moi_truong || "Tốt", bold: true, size: 20, font: "Times New Roman" })
        ]
      }),

      new Paragraph({ spacing: { before: 150 } }),

      // 7. SECTION V: VƯỚNG MẮC & KIẾN NGHỊ
      makeHeading("V. VƯỚNG MẮC & KIẾN NGHỊ"),
      new Paragraph({ spacing: { before: 100 } }),
      new Paragraph({
        indent: { left: 240 },
        children: [
          new TextRun({
            text: logData.ghi_chu_khac || "Không có vướng mắc nào.",
            size: 20,
            font: "Times New Roman",
            italic: !logData.ghi_chu_khac
          })
        ]
      }),

      new Paragraph({ spacing: { before: 300 } }),

      // 8. SIGNATURES TABLE WITH TOP DASHED BORDER
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: {
          top: borderDashed, bottom: noBorder, left: noBorder, right: noBorder,
          insideHorizontal: noBorder, insideVertical: noBorder
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                margins: { top: 200 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "ĐẠI DIỆN TỔNG THẦU", bold: true, size: 20, font: "Times New Roman" })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, size: 18, font: "Times New Roman", color: "555555" })]
                  }),
                  new Paragraph({ spacing: { before: 1000 } })
                ]
              }),
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                margins: { top: 200 },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "ĐẠI DIỆN HYDROTECH BÊN B", bold: true, size: 20, font: "Times New Roman" })]
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, size: 18, font: "Times New Roman", color: "555555" })]
                  }),
                  new Paragraph({ spacing: { before: 1000 } }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text: project ? project.supervisor : "Kỹ sư giám sát", bold: true, size: 20, font: "Times New Roman" })]
                  })
                ]
              })
            ]
          })
        ]
      }),

      // 9. PHOTOS SECTION (PAGE BREAK IF PHOTOS EXIST)
      ...(photos.length > 0 ? [
        new Paragraph({ pageBreakBefore: true }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "PHỤ LỤC ẢNH CHỤP HIỆN TRƯỜNG THI CÔNG", bold: true, size: 26, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `(Kèm theo nhật ký thi công ngày ${logData.ngay})`, italic: true, size: 18, font: "Times New Roman" })
          ]
        }),
        new Paragraph({ spacing: { before: 200 } }),
        
        new Table({
          width: { size: 9638, type: WidthType.DXA },
          borders: noBorders,
          rows: createPhotoRows(photos)
        })
      ] : [])
    ]
  };
};

  export const exportNKTCtoWord = async (logData, project, photos = []) => {
    const section = buildNKTCSection(logData, project, photos);
    const doc = new Document({
      sections: [section]
    });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Nhat_ky_thi_cong_${logData.ngay.replace(/\//g, "-")}_trang_${logData.trang}.docx`);
    });
  };

  export const exportAllNKTCtoWord = async (diariesList, project) => {
  const sortedDiaries = [...diariesList].sort((a, b) => {
    const partsA = a.ngay.split('/');
    const partsB = b.ngay.split('/');
    const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
    const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
    return dateA - dateB;
  });

  const thinBorder = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
  const tableBorders = {
    top: thinBorder, bottom: thinBorder,
    left: thinBorder, right: thinBorder,
    insideHorizontal: thinBorder, insideVertical: thinBorder
  };
  const noBorder = { style: BorderStyle.NONE };
  const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder, insideHorizontal: noBorder, insideVertical: noBorder };

  const dateFirst = sortedDiaries.length > 0 ? sortedDiaries[0].ngay : '...';
  const dateLast  = sortedDiaries.length > 0 ? sortedDiaries[sortedDiaries.length - 1].ngay : '...';

  // ===== COVER PAGE SECTION =====
  const coverSection = {
    properties: {
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 1134, bottom: 1134, left: 1700, right: 1134 }
      }
    },
    children: [
      // Top: Company & Republic header
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                borders: noBorders,
                children: [
                  new Paragraph({ children: [new TextRun({ text: project && project.contractorA ? project.contractorA.toUpperCase() : 'TỔNG THẦU', bold: true, size: 20, font: 'Times New Roman' })] }),
                  new Paragraph({ children: [new TextRun({ text: project && project.contractorB ? project.contractorB.toUpperCase() : 'CÔNG TY CỔ PHẦN HYDROTECH', bold: true, size: 18, font: 'Times New Roman', color: '333333' })] })
                ]
              }),
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                borders: noBorders,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 20, font: 'Times New Roman' })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 18, font: 'Times New Roman' })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '───────────────', size: 16, font: 'Times New Roman' })] })
                ]
              })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 600, after: 200 } }),

      // BIG TITLE
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'NHẬT KÝ THI CÔNG', bold: true, size: 52, font: 'Times New Roman' })]
      }),
      new Paragraph({ spacing: { before: 200, after: 200 } }),

      // Project info table
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: tableBorders,
        margins: { top: 120, bottom: 120, left: 180, right: 180 },
        rows: [
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Tên công trình:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.name : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Địa điểm:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.address : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Chủ đầu tư:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.investor : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Tổng thầu (Bên A):', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.contractorA : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Nhà thầu thi công (Bên B):', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.contractorB : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Gói thầu:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.packageName : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Hạng mục:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.categoryName : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Kỹ sư giám sát:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.supervisor : '', size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Thời gian ghi chép:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: `Từ ngày ${dateFirst} đến ngày ${dateLast}`, size: 22, font: 'Times New Roman' })] })] })
            ]
          }),
          new TableRow({
            children: [
              new TableCell({ width: { size: 2800, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: 'Tổng số trang:', bold: true, size: 22, font: 'Times New Roman' })] })] }),
              new TableCell({ width: { size: 6838, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: `${sortedDiaries.length} trang`, size: 22, font: 'Times New Roman' })] })] })
            ]
          })
        ]
      }),

      new Paragraph({ spacing: { before: 600, after: 200 } }),

      // Certification text
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'XÁC NHẬN CỦA CÁC BÊN', bold: true, size: 26, font: 'Times New Roman' })]
      }),
      new Paragraph({ spacing: { before: 200 } }),

      // Signature table
      new Table({
        width: { size: 9638, type: WidthType.DXA },
        borders: noBorders,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                borders: noBorders,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `ĐẠI DIỆN TỔNG THẦU BÊN A`, bold: true, size: 22, font: 'Times New Roman' })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: project ? project.contractorA.toUpperCase() : '', bold: true, size: 20, font: 'Times New Roman' })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', italic: true, size: 18, font: 'Times New Roman', color: '555555' })] }),
                  new Paragraph({ spacing: { before: 1000 } }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '......................................', size: 18, font: 'Times New Roman' })] })
                ]
              }),
              new TableCell({
                width: { size: 4819, type: WidthType.DXA },
                borders: noBorders,
                children: [
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `ĐẠI DIỆN NHÀ THẦU BÊN B`, bold: true, size: 22, font: 'Times New Roman' })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: project ? project.contractorB.toUpperCase() : '', bold: true, size: 20, font: 'Times New Roman' })] }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: '(Ký, ghi rõ họ tên)', italic: true, size: 18, font: 'Times New Roman', color: '555555' })] }),
                  new Paragraph({ spacing: { before: 1000 } }),
                  new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: project ? project.supervisor : '......................................', bold: true, size: 20, font: 'Times New Roman' })] })
                ]
              })
            ]
          })
        ]
      })
    ]
  };

  // ===== DIARY SECTIONS (one per page) =====
  const diarySections = sortedDiaries.map(d => buildNKTCSection(d, project, d.photos || []));

  const doc = new Document({ sections: [coverSection, ...diarySections] });
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `Toan_bo_Nhat_ky_thi_cong_${project ? project.name.replace(/\s+/g, '_') : 'Du_an'}.docx`);
  });
};

// Helper function to dynamically generate Table Rows of images in docx
const createPhotoRows = (photos) => {
  const rows = [];
  const itemsPerRow = 2;
  
  for (let i = 0; i < photos.length; i += itemsPerRow) {
    const rowPhotos = photos.slice(i, i + itemsPerRow);
    
    const rowCells = rowPhotos.map((photoBase64, idx) => {
      const buffer = base64ToBuffer(photoBase64);
      return new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: buffer,
                transformation: {
                  width: 260,
                  height: 195 // 4:3 aspect ratio
                }
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 100 },
            children: [
              new TextRun({ text: `Hình ảnh hiện trường ${i + idx + 1}`, italic: true, size: 16, font: "Times New Roman" })
            ]
          })
        ]
      });
    });

    // If odd number, add empty cell to balance last row
    if (rowCells.length < itemsPerRow) {
      rowCells.push(new TableCell({
        width: { size: 50, type: WidthType.PERCENTAGE },
        children: []
      }));
    }

    rows.push(new TableRow({ children: rowCells }));
  }
  return rows;
};


// EXPORT 2: BIÊN BẢN HIỆN TRƯỜNG / PHÁT SINH (.docx)
export const exportBBPStoWord = async (bbData, project) => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            width: 11906, // A4 width
            height: 16838 // A4 height
          },
          margin: {
            top: 1134,
            bottom: 1134,
            left: 1700,
            right: 1134
          }
        }
      },
      children: [
        // Standard Heading
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 55, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: project && project.contractorA ? project.contractorA.toUpperCase() : "TỔNG THẦU", bold: true, size: 20, font: "Times New Roman" })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: project && project.contractorB ? project.contractorB.toUpperCase() : "CÔNG TY CỔ PHẦN HYDROTECH", bold: true, size: 18, font: "Times New Roman", color: "333333" })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 45, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 20, font: "Times New Roman" })
                      ]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: 18, font: "Times New Roman" }),
                      ]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({ text: "-----------------------", size: 16, font: "Times New Roman" })
                      ]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "BIÊN BẢN HIỆN TRƯỜNG / PHÁT SINH", bold: true, size: 28, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Hôm nay, ngày ${bbData.ngay || "..../..../2026"}, chúng tôi gồm:`, size: 20, italic: true, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // PARTIES
        new Paragraph({
          children: [
            new TextRun({ text: "BÊN A (Tổng thầu): ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: project ? project.contractorA : "....................................................................", size: 20, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Đại diện: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.dai_dien_a || ".......................................................", size: 20, font: "Times New Roman" }),
            new TextRun({ text: "   Chức vụ: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.chuc_vu_a || "....................................", size: 20, font: "Times New Roman" })
          ]
        }),
        new Paragraph({ spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: "BÊN B (Nhà thầu): ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: project ? project.contractorB : "CÔNG TY CỔ PHẦN HYDROTECH", size: 20, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: "Đại diện: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.dai_dien_b || ".......................................................", size: 20, font: "Times New Roman" }),
            new TextRun({ text: "   Chức vụ: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.chuc_vu_b || "....................................", size: 20, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 1: NỘI DUNG SỰ VIỆC
        new Paragraph({
          children: [
            new TextRun({ text: "I. NỘI DUNG SỰ VIỆC / PHÁT SINH", bold: true, size: 22, font: "Times New Roman" })
          ]
        }),
        
        new Paragraph({
          indent: { left: 288 },
          children: [
            new TextRun({ text: "- Vị trí sự việc: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.vi_tri || "....................................................................", size: 20, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          indent: { left: 288 },
          children: [
            new TextRun({ text: "- Sự việc: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.su_viec || "....................................................................", size: 20, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          indent: { left: 288 },
          children: [
            new TextRun({ text: "- Nguyên nhân: ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.nguyen_nhan || "....................................................................", size: 20, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          indent: { left: 288 },
          children: [
            new TextRun({ text: "- Đánh giá ảnh hưởng (nếu có): ", bold: true, size: 20, font: "Times New Roman" }),
            new TextRun({ text: bbData.anh_huong || "....................................................................", size: 20, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 2: GIẢI PHÁP ĐỀ XUẤT
        new Paragraph({
          children: [
            new TextRun({ text: "II. GIẢI PHÁP XỬ LÝ / ĐỀ XUẤT", bold: true, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          indent: { left: 288 },
          children: [
            new TextRun({ text: bbData.de_xuat || "....................................................................................................................................", size: 20, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 3: KẾT LUẬN
        new Paragraph({
          children: [
            new TextRun({ text: "III. KẾT LUẬN", bold: true, size: 22, font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          indent: { left: 288 },
          children: [
            new TextRun({ text: "Căn cứ vào diễn biến thực tế, hai bên thống nhất xử lý theo phương án đã đề xuất nêu trên. Khối lượng phát sinh (nếu có) sẽ được tính toán và xác nhận vào hồ sơ hoàn công / quyết toán sau này. Biên bản được lập thành 04 bản, mỗi bên giữ 02 bản có giá trị pháp lý như nhau.", size: 20, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 400 } }),

        // SIGNATURES
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE },
            bottom: { style: BorderStyle.NONE },
            left: { style: BorderStyle.NONE },
            right: { style: BorderStyle.NONE },
            insideHorizontal: { style: BorderStyle.NONE },
            insideVertical: { style: BorderStyle.NONE }
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "ĐẠI DIỆN TỔNG THẦU BÊN A", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, size: 18, font: "Times New Roman" })]
                    }),
                    new Paragraph({ spacing: { before: 700 } }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "............................................", size: 18, font: "Times New Roman" })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 50, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "ĐẠI DIỆN HYDROTECH BÊN B", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, size: 18, font: "Times New Roman" })]
                    }),
                    new Paragraph({ spacing: { before: 700 } }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: bbData.dai_dien_b || "Kỹ sư hiện trường", bold: true, size: 20, font: "Times New Roman" })]
                    })
                  ]
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `Bien_ban_phat_sinh_${bbData.vi_tri.replace(/\s+/g, "_") || "Hien_truong"}.docx`);
  });
};
