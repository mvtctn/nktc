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
  VerticalAlign
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
export const exportNKTCtoWord = async (logData, project, photos = []) => {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1134, // 2cm in twentieths of a point (1 inch = 1440)
            bottom: 1134,
            left: 1700, // 3cm
            right: 1134 // 2cm
          }
        }
      },
      children: [
        // Header Info Table (Border-free)
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
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({ text: "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM", bold: true, size: 20, font: "Times New Roman" })
                      ]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
                      children: [
                        new TextRun({ text: "Độc lập - Tự do - Hạnh phúc", bold: true, size: 18, font: "Times New Roman" }),
                      ]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.RIGHT,
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

        // Main Title
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "NHẬT KÝ THI CÔNG", bold: true, size: 36, color: "0f2b48", font: "Times New Roman" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: `Ngày thi công: ${logData.ngay} | Số trang: ${logData.trang}`, bold: true, italic: true, size: 22, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 200, after: 200 } }),

        // SECTION 1: THÔNG TIN DỰ ÁN
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: "I. THÔNG TIN DỰ ÁN & HẠNG MỤC", bold: true, size: 24, font: "Times New Roman", color: "1e3f66" })
          ]
        }),
        new Paragraph({ spacing: { before: 100 } }),
        
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Tên công trình/Dự án:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.name : "N/A", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Địa chỉ:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.address : "N/A", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Chủ đầu tư:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.investor : "N/A", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Tổng thầu (Bên A):", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: project ? project.contractorA : "N/A", size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Gói thầu / Hạng mục:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 70, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `${project ? project.packageName : "N/A"} - ${project ? project.categoryName : "N/A"}`, size: 20, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 2: TÌNH HÌNH THỜI TIẾT, NHÂN LỰC & THIẾT BỊ
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: "II. THỜI TIẾT, NHÂN LỰC & THIẾT BỊ THI CÔNG", bold: true, size: 24, font: "Times New Roman", color: "1e3f66" })
          ]
        }),
        new Paragraph({ spacing: { before: 100 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Thời tiết:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `Sáng: ${logData.thoi_tiet_sang} | Chiều: ${logData.thoi_tiet_chieu}`, size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Số lượng công nhân:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 75, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `${logData.so_luong_cong_nhan} người`, size: 20, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Thiết bị sử dụng:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ 
                  width: { size: 75, type: WidthType.PERCENTAGE }, 
                  children: logData.thiet_bi && logData.thiet_bi.length > 0
                    ? logData.thiet_bi.map(eq => new Paragraph({ children: [new TextRun({ text: `- ${eq}`, size: 20, font: "Times New Roman" })] }))
                    : [new Paragraph({ children: [new TextRun({ text: "Không sử dụng thiết bị cơ giới lớn", italic: true, size: 20, font: "Times New Roman" })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ width: { size: 25, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Vật liệu cấp trong ngày:", bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ 
                  width: { size: 75, type: WidthType.PERCENTAGE }, 
                  children: logData.vat_lieu && logData.vat_lieu.length > 0
                    ? logData.vat_lieu.map(mat => new Paragraph({ children: [new TextRun({ text: `- ${mat}`, size: 20, font: "Times New Roman" })] }))
                    : [new Paragraph({ children: [new TextRun({ text: "Không nhập vật liệu mới", italic: true, size: 20, font: "Times New Roman" })] })]
                })
              ]
            })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 3: TIẾN TRÌNH CHI TIẾT
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: "III. NỘI DUNG VÀ TIẾN TRÌNH CÔNG VIỆC CHI TIẾT", bold: true, size: 24, font: "Times New Roman", color: "1e3f66" })
          ]
        }),
        new Paragraph({ spacing: { before: 100 } }),

        ...logData.tien_trinh_cong_viec.map((task, idx) => (
          new Paragraph({
            indent: { left: 288 }, // bullet indent
            children: [
              new TextRun({ text: `${idx + 1}. ${task}`, size: 20, font: "Times New Roman" })
            ]
          })
        )),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 4: AN TOÀN & VỆ SINH
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: "IV. CÔNG TÁC AN TOÀN LAO ĐỘNG & VỆ SINH MÔI TRƯỜNG", bold: true, size: 24, font: "Times New Roman", color: "1e3f66" })
          ]
        }),
        new Paragraph({ spacing: { before: 100 } }),

        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `An toàn lao động: ${logData.an_toan_lao_dong}`, bold: true, size: 20, font: "Times New Roman" })] })] }),
                new TableCell({ width: { size: 50, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `Vệ sinh môi trường: ${logData.ve_sinh_moi_truong}`, bold: true, size: 20, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // SECTION 5: VƯỚNG MẮC & KIẾN NGHỊ
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          children: [
            new TextRun({ text: "V. CÁC VƯỚNG MẮC, TỒN TẠI & KIẾN NGHỊ KHÁC", bold: true, size: 24, font: "Times New Roman", color: "1e3f66" })
          ]
        }),
        new Paragraph({ spacing: { before: 100 } }),
        new Paragraph({
          children: [
            new TextRun({ text: logData.ghi_chu_khac || "Không có vướng mắc tồn tại nào.", size: 20, italic: !logData.ghi_chu_khac, font: "Times New Roman" })
          ]
        }),

        new Paragraph({ spacing: { before: 300 } }),

        // SIGNATURE AREA
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
                    new Paragraph({ spacing: { before: 700 } }), // space for signature
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
                      children: [new TextRun({ text: "ĐẠI DIỆN NHÀ THẦU THI CÔNG", bold: true, size: 20, font: "Times New Roman" })]
                    }),
                    new Paragraph({
                      alignment: AlignmentType.CENTER,
                      children: [new TextRun({ text: "(Ký, ghi rõ họ tên)", italic: true, size: 18, font: "Times New Roman" })]
                    }),
                    new Paragraph({ spacing: { before: 700 } }),
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
              new TextRun({ text: "PHỤ LỤC ẢNH CHỤP HIỆN TRƯỜNG THI CÔNG", bold: true, size: 26, color: "0f2b48", font: "Times New Roman" })
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
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: createPhotoRows(photos)
          })
        ] : [])
      ]
    }]
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `Nhat_ky_thi_cong_${logData.ngay.replace(/\//g, "-")}_trang_${logData.trang}.docx`);
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
            new TextRun({ text: "BIÊN BẢN HIỆN TRƯỜNG / PHÁT SINH", bold: true, size: 28, color: "0f2b48", font: "Times New Roman" })
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
            new TextRun({ text: "I. NỘI DUNG SỰ VIỆC / PHÁT SINH", bold: true, size: 22, font: "Times New Roman", color: "1e3f66" })
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
            new TextRun({ text: "II. GIẢI PHÁP XỬ LÝ / ĐỀ XUẤT", bold: true, size: 22, font: "Times New Roman", color: "1e3f66" })
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
            new TextRun({ text: "III. KẾT LUẬN", bold: true, size: 22, font: "Times New Roman", color: "1e3f66" })
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
