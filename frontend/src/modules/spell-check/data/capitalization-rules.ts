/**
 * Administrative Capitalization Rules (NĐ 30/2020 & HD 05-HD/VPTW).
 */

export interface CapitalizationRule {
  id: string;
  category: string;
  severity: string;
  description: string;
  source: string;
}

export const CAPITALIZATION_RULES: CapitalizationRule[] = [
  {
    "id": "CAP_SENTENCE_START",
    "category": "capitalization",
    "severity": "warning",
    "description": "Chữ cái đầu câu hoặc đầu đoạn văn phải viết hoa.",
    "source": "Nghị định 30/2020/NĐ-CP Phụ lục II"
  },
  {
    "id": "CAP_PROPER_NAME_VI",
    "category": "capitalization",
    "severity": "warning",
    "description": "Tên người, tên địa lí Việt Nam viết hoa chữ cái đầu của các âm tiết tạo thành tên riêng.",
    "source": "Nghị định 30/2020/NĐ-CP Phụ lục II"
  },
  {
    "id": "CAP_SPECIAL_NOUNS",
    "category": "capitalization",
    "severity": "warning",
    "description": "Danh từ đặc biệt trong văn bản hành chính (Nhân dân, Nhà nước, Đảng, Bác) viết hoa chữ cái đầu.",
    "source": "Nghị định 30/2020/NĐ-CP Phụ lục II"
  },
  {
    "id": "CAP_LEGAL_STRUCT_REF",
    "category": "capitalization",
    "severity": "warning",
    "description": "Viện dẫn phần, chương, mục, tiểu mục, điều của một văn bản cụ thể thì viết hoa chữ cái đầu của Phần, Chương, Mục, Tiểu mục, Điều (khoản và điểm viết thường).",
    "source": "Nghị định 30/2020/NĐ-CP Phụ lục II"
  },
  {
    "id": "CAP_POST_COLON_QUOTE",
    "category": "capitalization",
    "severity": "warning",
    "description": "Viết hoa chữ cái đầu của âm tiết thứ nhất sau dấu hai chấm và dấu ngoặc kép mở (: “...).",
    "source": "Nghị định 30/2020/NĐ-CP Phụ lục II"
  }
];
