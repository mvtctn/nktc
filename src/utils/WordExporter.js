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
  SimpleField
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
  const tableBorders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
    insideHorizontal: thinBorder,
    insideVertical: thinBorder
  };

  // Determine weather checkboxes
  const rawWeatherSang = logData.thoi_tiet_sang || "";
  const rawWeatherChieu = logData.thoi_tiet_chieu || "";

  const checkSángNắng = rawWeatherSang.toLowerCase().includes("nắng") ? "☑" : "☐";
  const checkSángMưa = rawWeatherSang.toLowerCase().includes("mưa") ? "☑" : "☐";
  const checkSángBT = (!rawWeatherSang.toLowerCase().includes("nắng") && !rawWeatherSang.toLowerCase().includes("mưa")) || rawWeatherSang.toLowerCase().includes("bình thường") ? "☑" : "☐";

  const checkChiềuNắng = rawWeatherChieu.toLowerCase().includes("nắng") ? "☑" : "☐";
  const checkChiềuMưa = rawWeatherChieu.toLowerCase().includes("mưa") ? "☑" : "☐";
  const checkChiềuBT = (!rawWeatherChieu.toLowerCase().includes("nắng") && !rawWeatherChieu.toLowerCase().includes("mưa")) || rawWeatherChieu.toLowerCase().includes("bình thường") ? "☑" : "☐";

  // Determine safety and environment checkboxes
  const rawSafety = logData.an_toan_lao_dong || "";
  const rawEnv = logData.ve_sinh_moi_truong || "";

  const checkAnToanTot = !rawSafety.toLowerCase().includes("không tốt") && !rawSafety.toLowerCase().includes("kém") ? "☑" : "☐";
  const checkAnToanKoTot = rawSafety.toLowerCase().includes("không tốt") || rawSafety.toLowerCase().includes("kém") ? "☑" : "☐";

  const isVeSinhTB = rawEnv.toLowerCase().includes("trung bình");
  const isVeSinhXau = rawEnv.toLowerCase().includes("xấu") || rawEnv.toLowerCase().includes("kém");
  const checkVeSinhTot = !isVeSinhTB && !isVeSinhXau ? "☑" : "☐";
  const checkVeSinhTB = isVeSinhTB ? "☑" : "☐";
  const checkVeSinhXau = isVeSinhXau ? "☑" : "☐";

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
        // 1. HEADER TABLE (4 Columns)
        new Table({
          width: { size: 9638, type: WidthType.DXA },
          borders: tableBorders,
          margins: {
            top: 100,
            bottom: 100,
            left: 150,
            right: 150
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  rowSpan: 2,
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: project ? project.contractorB.toUpperCase() : "HYDROTECH",
                          bold: true,
                          size: 24, // 12pt
                          font: "Times New Roman"
                        })
                      ]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "Dedicated & Devoted",
                          italic: true,
                          size: 14, // 7pt
                          font: "Times New Roman",
                          color: "555555"
                        })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 4638, type: WidthType.DXA },
                  rowSpan: 2,
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [
                        new TextRun({
                          text: "NHẬT KÝ THI CÔNG",
                          bold: true,
                          size: 28, // 14pt
                          font: "Times New Roman"
                        })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 1000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Ngày:", bold: true, size: 20, font: "Times New Roman" })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 1500, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: logData.ngay, size: 20, font: "Times New Roman" })]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 1000, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "Trang:", bold: true, size: 20, font: "Times New Roman" })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 1500, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new SimpleField("PAGE")]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        new Paragraph({ spacing: { before: 150, after: 150 } }),

        // 2. MAIN DETAILS TABLE
        new Table({
          width: { size: 9638, type: WidthType.DXA },
          borders: tableBorders,
          margins: {
            top: 100,
            bottom: 100,
            left: 150,
            right: 150
          },
          rows: [
            // Row 1: Công trình
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Công trình:", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  width: { size: 7138, type: WidthType.DXA },
                  columnSpan: 3,
                  children: [new Paragraph({ children: [new TextRun({ text: project ? project.name : "N/A", size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            // Row 2: Địa chỉ
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Địa chỉ:", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  width: { size: 7138, type: WidthType.DXA },
                  columnSpan: 3,
                  children: [new Paragraph({ children: [new TextRun({ text: project ? project.address : "N/A", size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            // Row 3: Gói thầu
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Gói thầu:", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  width: { size: 7138, type: WidthType.DXA },
                  columnSpan: 3,
                  children: [new Paragraph({ children: [new TextRun({ text: project ? project.packageName : "N/A", size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            // Row 4: Nhà thầu chính
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Nhà thầu chính:", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  width: { size: 7138, type: WidthType.DXA },
                  columnSpan: 3,
                  children: [new Paragraph({ children: [new TextRun({ text: project ? project.contractorA : "N/A", size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            // Row 5: Nhà thầu thi công
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  children: [new Paragraph({ children: [new TextRun({ text: "Nhà thầu thi công:", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  width: { size: 7138, type: WidthType.DXA },
                  columnSpan: 3,
                  children: [new Paragraph({ children: [new TextRun({ text: project ? project.contractorB : "N/A", size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            // Row 6: Thời tiết
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 2500, type: WidthType.DXA },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ children: [new TextRun({ text: "Thời tiết:", bold: true, size: 20, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  width: { size: 7138, type: WidthType.DXA },
                  columnSpan: 3,
                  verticalAlign: VerticalAlign.CENTER,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Sáng:   ", bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Nắng ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkSángNắng}     `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Mưa ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkSángMưa}     `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Bình thường ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkSángBT}`, bold: true, size: 20, font: "Times New Roman" })
                      ]
                    }),
                    new Paragraph({
                      spacing: { before: 50 },
                      children: [
                        new TextRun({ text: "Chiều:  ", bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Nắng ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkChiềuNắng}     `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Mưa ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkChiềuMưa}     `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Bình thường ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkChiềuBT}`, bold: true, size: 20, font: "Times New Roman" })
                      ]
                    })
                  ]
                })
              ]
            }),
            // Row 7: Devices & Materials
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Các thiết bị chính trên công trường:", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    ...(logData.thiet_bi && logData.thiet_bi.length > 0
                      ? logData.thiet_bi.map(eq => new Paragraph({ children: [new TextRun({ text: `- ${eq}`, size: 20, font: "Times New Roman" })] }))
                      : [new Paragraph({ children: [new TextRun({ text: "Không sử dụng thiết bị cơ giới lớn", italic: true, size: 20, font: "Times New Roman", color: "777777" })] })])
                  ]
                }),
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Vật liệu vào công trường:", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    ...(logData.vat_lieu && logData.vat_lieu.length > 0
                      ? logData.vat_lieu.map(mat => new Paragraph({ children: [new TextRun({ text: `- ${mat}`, size: 20, font: "Times New Roman" })] }))
                      : [new Paragraph({ children: [new TextRun({ text: "Không nhập vật liệu mới", italic: true, size: 20, font: "Times New Roman", color: "777777" })] })])
                  ]
                })
              ]
            }),
            // Row 8: Workers Count
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Số lượng công nhân: ", bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: String(logData.so_luong_cong_nhan || 0), size: 20, font: "Times New Roman" })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: []
                })
              ]
            }),
            // Row 9: Work Progress
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 9638, type: WidthType.DXA },
                  columnSpan: 4,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Tiến trình công việc (tóm tắt hoạt động, chỉ rõ vị trí):", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    new Paragraph({ spacing: { before: 100 } }),
                    ...(logData.tien_trinh_cong_viec && logData.tien_trinh_cong_viec.length > 0
                      ? logData.tien_trinh_cong_viec.map(task => new Paragraph({ children: [new TextRun({ text: `- ${task}`, size: 20, font: "Times New Roman" })] }))
                      : [new Paragraph({ children: [new TextRun({ text: "Chưa nhập tiến trình công việc", italic: true, size: 20, font: "Times New Roman", color: "777777" })] })])
                  ]
                })
              ]
            }),
            // Row 10: Safety & Environment
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "An toàn lao động:\n", bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Tốt ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkAnToanTot}      `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Không tốt ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkAnToanKoTot}`, bold: true, size: 20, font: "Times New Roman" })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: "Vệ sinh môi trường:\n", bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Tốt ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkVeSinhTot}      `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Trung bình ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkVeSinhTB}      `, bold: true, size: 20, font: "Times New Roman" }),
                        new TextRun({ text: "Xấu ", size: 20, font: "Times New Roman" }),
                        new TextRun({ text: `${checkVeSinhXau}`, bold: true, size: 20, font: "Times New Roman" })
                      ]
                    })
                  ]
                })
              ]
            }),
            // Row 11: Other Notes
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 9638, type: WidthType.DXA },
                  columnSpan: 4,
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: "Các ghi chú khác:", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    new Paragraph({
                      spacing: { before: 100 },
                      children: [
                        new TextRun({
                          text: logData.ghi_chu_khac || "Không có ghi chú thêm.",
                          size: 20,
                          font: "Times New Roman",
                          italic: !logData.ghi_chu_khac
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            // Row 12: Signatures
            new TableRow({
              children: [
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: `ĐẠI DIỆN TỔNG THẦU ${project ? project.contractorA.toUpperCase() : "GIZA"}`, bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, size: 18, font: "Times New Roman", color: "555555" })]
                    }),
                    new Paragraph({ spacing: { before: 1000 } }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "............................................", size: 18, font: "Times New Roman" })]
                    })
                  ]
                }),
                new TableCell({
                  width: { size: 4819, type: WidthType.DXA },
                  columnSpan: 2,
                  children: [
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: `ĐẠI DIỆN HYDROTECH BÊN B`, bold: true, size: 20, font: "Times New Roman" })]
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

        // PHOTOS SECTION (PAGE BREAK IF PHOTOS EXIST)
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
          
          // Photos Grid Table (2 columns)
          new Table({
            width: { size: 9638, type: WidthType.DXA },
            borders: tableBorders,
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

    const sections = sortedDiaries.map(d => buildNKTCSection(d, project, d.photos || []));
    const doc = new Document({ sections });
    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `Toan_bo_Nhat_ky_thi_cong_${project ? project.name.replace(/\s+/g, "_") : "Du_an"}.docx`);
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
                        new TextRun({ text: project ? project.contractorB.toUpperCase() : "CÔNG TY CỔ PHẦN HYDROTECH", bold: true, size: 20, font: "Times New Roman" })
                      ]
                    }),
                    new Paragraph({
                      children: [
                        new TextRun({ text: `Ban điều hành dự án: ${project ? project.name : "Hiện trường"}`, italic: true, size: 18, font: "Times New Roman" })
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
