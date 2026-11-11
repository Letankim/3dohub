/**
 * 404 Commonly Confused Administrative Phrases & Collocations in Vietnamese.
 * In-House Linguistic Knowledge Base for 3DoHub.
 */

export interface ConfusablePhraseEntry {
  wrong: string;
  correct: string;
  description: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  example: string;
}

export const CONFUSABLE_PHRASES: ConfusablePhraseEntry[] = [
  {
    "wrong": "sát nhập",
    "correct": "sáp nhập",
    "description": "Trong văn bản hành chính, từ ngữ chuẩn mực là 'sáp nhập' (hợp nhất, nhập vào làm một).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Hoàn thành đề án sáp nhập các đơn vị hành chính cấp xã giai đoạn 2023-2025."
  },
  {
    "wrong": "chuẩn đoán",
    "correct": "chẩn đoán",
    "description": "Từ chuẩn xác là 'chẩn đoán' (xác định tình trạng/bệnh tật), 'chuẩn đoán' là lỗi phát âm/dùng sai.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Kết quả chẩn đoán hình ảnh cho thấy bệnh nhân bị viêm phổi."
  },
  {
    "wrong": "thăm quan",
    "correct": "tham quan",
    "description": "Từ chuẩn xác là 'tham quan' (quan sát để học hỏi kinh nghiệm), 'thăm quan' là lỗi dùng sai.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Tổ chức cho cán bộ đi tham quan học tập kinh nghiệm tại các mô hình nông nghiệp mới."
  },
  {
    "wrong": "vô hình chung",
    "correct": "vô hình trung",
    "description": "Từ chuẩn xác là 'vô hình trung' (tự nhiên mà thành, ngẫu nhiên trở thành), không dùng 'vô hình chung'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Việc chậm trễ xử lý hồ sơ vô hình trung đã tạo kẽ hở cho tiêu cực phát sinh."
  },
  {
    "wrong": "tựu chung",
    "correct": "tựu trung",
    "description": "Từ chuẩn xác là 'tựu trung' (tóm lại, chung quy lại), không dùng 'tựu chung'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Tựu trung, dự thảo luật đã thể chế hóa đầy đủ các chủ trương lớn của Đảng."
  },
  {
    "wrong": "sử lý",
    "correct": "xử lý",
    "description": "Từ chuẩn xác là 'xử lý' (giải quyết công việc/văn bản/vi phạm), không dùng 'sử lý'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Khẩn trương xử lý các vướng mắc của người dân và doanh nghiệp."
  },
  {
    "wrong": "xử dụng",
    "correct": "sử dụng",
    "description": "Từ chuẩn xác là 'sử dụng' (dùng vào mục đích nhất định), không dùng 'xử dụng'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Quản lý và sử dụng hiệu quả nguồn vốn ngân sách nhà nước."
  },
  {
    "wrong": "sản suất",
    "correct": "sản xuất",
    "description": "Từ chuẩn xác là 'sản xuất' (chế tạo của cải), 'suất' chỉ dùng trong 'năng suất/suất ăn'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Thúc đẩy phát triển sản xuất kinh doanh nông nghiệp công nghệ cao."
  },
  {
    "wrong": "năng xuất",
    "correct": "năng suất",
    "description": "Từ chuẩn xác là 'năng suất' (hiệu quả lao động trong đơn vị thời gian), không dùng 'năng xuất'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Nâng cao năng suất lao động và năng lực cạnh tranh quốc gia."
  },
  {
    "wrong": "đề suất",
    "correct": "đề xuất",
    "description": "Từ chuẩn xác là 'đề xuất' (đưa ra ý kiến/giải pháp), không dùng 'đề suất'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "suất sắc",
    "correct": "xuất sắc",
    "description": "Từ chuẩn xác là 'xuất sắc' (vượt trội hơn hẳn bình thường), không dùng 'suất sắc'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tặng bằng khen cho tập thể hoàn thành xuất sắc nhiệm vụ được giao."
  },
  {
    "wrong": "sơ xuất",
    "correct": "sơ suất",
    "description": "Từ chuẩn xác là 'sơ suất' (không cẩn thận để xảy ra sai sót nhỏ), không dùng 'sơ xuất'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Do sơ suất trong khâu in ấn dẫn đến nhầm lẫn số liệu."
  },
  {
    "wrong": "xuất ăn",
    "correct": "suất ăn",
    "description": "Từ chuẩn xác là 'suất ăn' (khẩu phần ăn dành cho một người), không dùng 'xuất ăn'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "cọ sát",
    "correct": "cọ xát",
    "description": "Từ chuẩn xác là 'cọ xát' (tiếp xúc, cọ vào nhau sinh lực cản hoặc va chạm thực tế), không dùng 'cọ sát'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tạo điều kiện cho cán bộ trẻ được cọ xát với thực tế cơ sở."
  },
  {
    "wrong": "bổ xung",
    "correct": "bổ sung",
    "description": "Từ chuẩn xác là 'bổ sung' (thêm vào cho đầy đủ), không dùng 'bổ xung'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Đề nghị đơn vị khẩn trương bổ sung tài liệu còn thiếu vào hồ sơ."
  },
  {
    "wrong": "chủ chương",
    "correct": "chủ trương",
    "description": "Từ chuẩn xác là 'chủ trương' (đường lối, ý định chỉ đạo), không dùng 'chủ chương'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chính chu",
    "correct": "chỉn chu",
    "description": "Từ chuẩn xác là 'chỉn chu' (chu đáo, cẩn thận, tươm tất), không dùng 'chính chu'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Hồ sơ trình duyệt được chuẩn bị rất chỉn chu, bài bản."
  },
  {
    "wrong": "xúc tích",
    "correct": "súc tích",
    "description": "Từ chuẩn xác là 'súc tích' (ngắn gọn, cô đọng nhưng chứa đựng nhiều ý nghĩa), không dùng 'xúc tích'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Văn phong báo cáo cần ngắn gọn, rõ ràng và súc tích."
  },
  {
    "wrong": "chau chuốt",
    "correct": "trau chuốt",
    "description": "Từ chuẩn xác là 'trau chuốt' (gọt giũa tỉ mỉ cho đẹp), không dùng 'chau chuốt'.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dành giật",
    "correct": "giành giật",
    "description": "Từ chuẩn xác là 'giành giật' (dùng sức mạnh cướp đoạt hoặc đấu tranh quyết liệt để giành lấy).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Các bác sĩ căng mình giành giật sự sống cho người bệnh nguy kịch."
  },
  {
    "wrong": "giành dụm",
    "correct": "dành dụm",
    "description": "Từ chuẩn xác là 'dành dụm' (tích cóp từng chút một để dành cho tương lai), bắt đầu bằng 'd'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Số tiền dành dụm cả đời của người nông dân."
  },
  {
    "wrong": "trần trừ",
    "correct": "chần chừ",
    "description": "Từ chuẩn xác là 'chần chừ' (do dự, dùng dằng chưa quyết định ngay), cả hai từ tố đều bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Quyết liệt hành động, không được chần chừ làm lỡ thời cơ phát triển."
  },
  {
    "wrong": "bạc mạng",
    "correct": "bạt mạng",
    "description": "Từ chuẩn xác là 'bạt mạng' (liều lĩnh, bất chấp nguy hiểm đến tính mạng), không dùng 'bạc mạng'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Lực lượng cảnh sát giao thông xử lý nghiêm các đối tượng phóng xe bạt mạng."
  },
  {
    "wrong": "suôn xẻ",
    "correct": "suôn sẻ",
    "description": "Từ chuẩn xác là 'suôn sẻ' (trôi chảy, thuận lợi), không dùng 'suôn xẻ'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "dư giả",
    "correct": "dư dả",
    "description": "Từ chuẩn xác là 'dư dả' (thừa thãi, có nhiều hơn mức cần thiết), không dùng 'dư giả'.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chấp vá",
    "correct": "chắp vá",
    "description": "Từ chuẩn xác là 'chắp vá' (ghép nối tạm bợ từ nhiều mảnh), không dùng 'chấp vá'.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "rốt cục",
    "correct": "rốt cuộc",
    "description": "Trong văn bản hành chính nên dùng 'rốt cuộc' (kết cục cuối cùng) thay vì 'rốt cục'.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trấn chỉnh",
    "correct": "chấn chỉnh",
    "description": "Từ chuẩn xác là 'chấn chỉnh' (chỉnh đốn lại cho quy củ, nề nếp), không dùng 'trấn chỉnh'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chặt chẻ",
    "correct": "chặt chẽ",
    "description": "Từ chuẩn xác là 'chặt chẽ' (kín kẽ, liên kết khăng khít), không dùng 'chặt chẻ'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "nghiêm chúc",
    "correct": "nghiêm túc",
    "description": "Từ chuẩn xác là 'nghiêm túc' (đứng đắn, đúng quy định), không dùng 'nghiêm chúc'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chọng yếu",
    "correct": "trọng yếu",
    "description": "Từ chuẩn xác là 'trọng yếu' (quan trọng bậc nhất), không dùng 'chọng yếu'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "tập chung",
    "correct": "tập trung",
    "description": "Từ chuẩn xác là 'tập trung' (dồn vào một điểm hoặc quy tụ lại), không dùng 'tập chung'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chách nhiệm",
    "correct": "trách nhiệm",
    "description": "Từ chuẩn xác là 'trách nhiệm' (phần việc phải gánh vác), không dùng 'chách nhiệm'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chính quền",
    "correct": "chính quyền",
    "description": "Từ chuẩn xác là 'chính quyền' (bộ máy quản lý nhà nước), không dùng 'chính quền'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "hướng dẩn",
    "correct": "hướng dẫn",
    "description": "Từ chuẩn xác là 'hướng dẫn' (chỉ bảo cách thực hiện), không dùng dấu hỏi 'dẩn'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "giải chình",
    "correct": "giải trình",
    "description": "Từ chuẩn xác là 'giải trình' (trình bày, làm rõ lý do), không dùng 'giải chình'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chủ chì",
    "correct": "chủ trì",
    "description": "Từ chuẩn xác là 'chủ trì' (chịu trách nhiệm chính điều khiển cuộc họp/công việc), không dùng 'chủ chì'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "quán chiệt",
    "correct": "quán triệt",
    "description": "Từ chuẩn xác là 'quán triệt' (hiểu sâu sắc và thực hiện đầy đủ), không dùng 'quán chiệt'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "kiểm cha",
    "correct": "kiểm tra",
    "description": "Từ chuẩn xác là 'kiểm tra' (xem xét tình hình thực tế), không dùng 'kiểm cha'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chực ban",
    "correct": "trực ban",
    "description": "Từ chuẩn xác là 'trực ban' (làm nhiệm vụ theo ca trực), không dùng 'chực ban'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chực chiến",
    "correct": "trực chiến",
    "description": "Từ chuẩn xác là 'trực chiến' (sẵn sàng chiến đấu theo phiên trực), không dùng 'chực chiến'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chao đổi",
    "correct": "trao đổi",
    "description": "Từ chuẩn xác là 'trao đổi' (trao qua đổi lại, thảo luận), không dùng 'chao đổi'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "dõ dàng",
    "correct": "rõ ràng",
    "description": "Từ chuẩn xác là 'rõ ràng' (minh bạch, rành mạch), không dùng 'dõ dàng'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "xơ xài",
    "correct": "sơ sài",
    "description": "Từ chuẩn xác là 'sơ sài' (đơn giản, qua loa, thiếu thốn), không dùng 'xơ xài'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chỉnh xửa",
    "correct": "chỉnh sửa",
    "description": "Từ chuẩn xác là 'chỉnh sửa' (sửa chữa, nắn chỉnh lại), không dùng 'chỉnh xửa'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "xáng kiến",
    "correct": "sáng kiến",
    "description": "Từ chuẩn xác là 'sáng kiến' (ý kiến mới, giải pháp mới có ích), không dùng 'xáng kiến'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "sác nhận",
    "correct": "xác nhận",
    "description": "Từ chuẩn xác là 'xác nhận' (chứng thực tính chính xác), không dùng 'sác nhận'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "sác minh",
    "correct": "xác minh",
    "description": "Từ chuẩn xác là 'xác minh' (tìm hiểu để làm rõ sự thật), không dùng 'sác minh'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chia xẻ",
    "correct": "chia sẻ",
    "description": "Trong ngữ cảnh văn bản hành chính (thông tin, kinh nghiệm, tài liệu) từ chuẩn là 'chia sẻ'.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xoạn thảo",
    "correct": "soạn thảo",
    "description": "Từ chuẩn xác là 'soạn thảo' (khởi thảo, viết văn bản), không dùng 'xoạn thảo'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "giám xát",
    "correct": "giám sát",
    "description": "Từ chuẩn xác là 'giám sát' (theo dõi, kiểm tra việc thực hiện), không dùng 'giám xát'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "khảo xát",
    "correct": "khảo sát",
    "description": "Từ chuẩn xác là 'khảo sát' (nghiên cứu, đo đạc thực tế), không dùng 'khảo xát'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "quan xát",
    "correct": "quan sát",
    "description": "Từ chuẩn xác là 'quan sát' (nhìn nhận, theo dõi kỹ lưỡng), không dùng 'quan xát'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "xát hạch",
    "correct": "sát hạch",
    "description": "Từ chuẩn xác là 'sát hạch' (kiểm tra, đánh giá trình độ), không dùng 'xát hạch'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "chiệt để",
    "correct": "triệt để",
    "description": "Từ chuẩn xác là 'triệt để' (đến cùng, không nửa vời), không dùng 'chiệt để'.",
    "category": "spelling",
    "severity": "error",
    "example": ""
  },
  {
    "wrong": "kinh tế trí thức",
    "correct": "kinh tế tri thức",
    "description": "Trong ngữ cảnh kinh tế học, thuật ngữ chuẩn mực là 'kinh tế tri thức' (nền kinh tế dựa trên tri thức/kiến thức khoa học công nghệ).",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Phát triển mạnh mẽ nền kinh tế tri thức và kinh tế số."
  },
  {
    "wrong": "vốn trí thức",
    "correct": "vốn tri thức",
    "description": "Thuật ngữ chuẩn là 'vốn tri thức' (tài sản kiến thức, hiểu biết), không dùng 'vốn trí thức'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Tích lũy vốn tri thức để phục vụ công cuộc đổi mới sáng tạo."
  },
  {
    "wrong": "kho tàng trí thức",
    "correct": "kho tàng tri thức",
    "description": "Nên dùng 'kho tàng tri thức' (kho tàng kiến thức nhân loại), không dùng 'kho tàng trí thức'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Khai thác kho tàng tri thức quý báu của cha ông."
  },
  {
    "wrong": "đội ngũ tri thức",
    "correct": "đội ngũ trí thức",
    "description": "Khi nói về con người hoặc lực lượng lao động trí óc, chuẩn xác là 'đội ngũ trí thức'.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Phát huy vai trò của đội ngũ trí thức và các nhà khoa học."
  },
  {
    "wrong": "tầng lớp tri thức",
    "correct": "tầng lớp trí thức",
    "description": "Chuẩn mực là 'tầng lớp trí thức' (tầng lớp người lao động trí tuệ trong xã hội).",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Liên minh công nhân, nông dân và tầng lớp trí thức."
  },
  {
    "wrong": "giới tri thức",
    "correct": "giới trí thức",
    "description": "Chuẩn mực là 'giới trí thức' (giới người làm việc trí óc).",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Thu hút sự quan tâm, đóng góp của giới trí thức kiều bào."
  },
  {
    "wrong": "khắc phục yếu điểm",
    "correct": "khắc phục điểm yếu",
    "description": "Trong tiếng Việt, 'yếu điểm' có nghĩa là 'điểm trọng yếu/quan trọng nhất'. Để chỉ chỗ còn thiếu sót, phải dùng 'điểm yếu' hoặc 'nhược điểm'.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Tập trung khắc phục những điểm yếu, hạn chế còn tồn tại."
  },
  {
    "wrong": "nhận diện yếu điểm",
    "correct": "nhận diện điểm yếu",
    "description": "Nên dùng 'nhận diện điểm yếu' hoặc 'nhận diện nhược điểm' thay vì 'nhận diện yếu điểm'.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Nhận diện điểm yếu để kịp thời chấn chỉnh quy trình quản lý."
  },
  {
    "wrong": "yếu điểm của đơn vị",
    "correct": "điểm yếu của đơn vị",
    "description": "Nếu muốn nói về hạn chế, khuyết điểm của đơn vị, phải dùng 'điểm yếu của đơn vị' hoặc 'nhược điểm của đơn vị'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Chỉ rõ những mặt mạnh và điểm yếu của đơn vị trong năm qua."
  },
  {
    "wrong": "yếu điểm của dự án",
    "correct": "điểm yếu của dự án",
    "description": "Dùng 'điểm yếu của dự án' hoặc 'nhược điểm của dự án' để chỉ sự khiếm khuyết trong thuyết minh hoặc phương án triển khai.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Đánh giá toàn diện các điểm yếu của dự án trước khi phê duyệt."
  },
  {
    "wrong": "yếu điểm của mình",
    "correct": "điểm yếu của mình",
    "description": "Dùng 'điểm yếu của mình' hoặc 'nhược điểm của bản thân', tránh dùng 'yếu điểm'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Thẳng thắn nhìn nhận điểm yếu của mình để rèn luyện phấn đấu."
  },
  {
    "wrong": "cứu cánh duy nhất",
    "correct": "giải pháp duy nhất",
    "description": "'Cứu cánh' là mục đích cuối cùng cao nhất ('cứu' = rốt ráo, 'cánh' = điểm dừng/đích tới). Không dùng với nghĩa là phương tiện giải cứu hoặc phao cứu sinh.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Coi việc vay vốn là giải pháp duy nhất."
  },
  {
    "wrong": "là một cứu cánh",
    "correct": "là một giải pháp cứu vãn",
    "description": "Thường bị dùng nhầm 'cứu cánh' mang nghĩa biện pháp giải cứu. Nên dùng 'giải pháp cứu vãn' hoặc 'phao cứu sinh'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Chính sách giảm thuế là một giải pháp kịp thời hỗ trợ doanh nghiệp."
  },
  {
    "wrong": "cứu cánh cho doanh nghiệp",
    "correct": "giải pháp hỗ trợ doanh nghiệp",
    "description": "Dùng sai nghĩa từ 'cứu cánh' (nhầm là giải pháp cứu vớt). Nên viết 'giải pháp hỗ trợ doanh nghiệp' hoặc 'phao cứu sinh cho doanh nghiệp'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Quyết định giãn nợ là giải pháp hỗ trợ doanh nghiệp vượt qua khủng hoảng."
  },
  {
    "wrong": "thái độ bàng quang",
    "correct": "thái độ bàng quan",
    "description": "Từ chuẩn xác là 'thái độ bàng quan' (thờ ơ, đứng ngoài xem, không đoái hoài). 'Bàng quang' là bọng đái trong cơ thể người.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Cán bộ, đảng viên không được có thái độ bàng quan trước sai phạm."
  },
  {
    "wrong": "đứng nhìn bàng quang",
    "correct": "đứng nhìn bàng quan",
    "description": "Từ chuẩn xác là 'đứng nhìn bàng quan' (đứng ngoài xem mà không can thiệp giúp đỡ).",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Không thể đứng nhìn bàng quan trước nỗi đau của nhân dân vùng bão lũ."
  },
  {
    "wrong": "người bàng quang",
    "correct": "người bàng quan",
    "description": "Chuẩn xác là 'người bàng quan' (người đứng ngoài xem cuộc chơi/sự việc).",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Đối với người bàng quan, đây chỉ là một việc bình thường."
  },
  {
    "wrong": "thờ ơ bàng quang",
    "correct": "thờ ơ bàng quan",
    "description": "Chuẩn xác là 'thờ ơ bàng quan'. 'Bàng quang' là thuật ngữ giải phẫu học.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Kiên quyết đấu tranh với thói thờ ơ bàng quan, thiếu trách nhiệm."
  },
  {
    "wrong": "bãi bỏ quyết định trái pháp luật",
    "correct": "hủy bỏ quyết định trái pháp luật",
    "description": "Theo Điều 12 Luật Ban hành văn bản QPPL: Khi quyết định có vi phạm pháp luật ngay từ khi ban hành, cơ quan có thẩm quyền phải 'hủy bỏ' (chấm dứt hiệu lực hồi tố kể từ ngày ban hành).",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Ủy ban nhân dân tỉnh ra quyết định hủy bỏ quyết định trái pháp luật của cấp dưới."
  },
  {
    "wrong": "bãi bỏ hành vi trái luật",
    "correct": "hủy bỏ hành vi trái luật",
    "description": "Đối với hành vi vi phạm thẩm quyền hoặc trái luật, thuật ngữ pháp lý chuẩn xác là 'hủy bỏ' hoặc 'chấm dứt hành vi'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Yêu cầu hủy bỏ các biện pháp cưỡng chế trái pháp luật."
  },
  {
    "wrong": "hủy bỏ văn bản hết hiệu lực",
    "correct": "bãi bỏ văn bản hết hiệu lực",
    "description": "Đối với văn bản pháp luật không còn phù hợp hoặc đã có văn bản mới thay thế, thủ tục chuẩn mực của cơ quan ban hành là 'bãi bỏ'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Bãi bỏ Quyết định số 15/2018/QĐ-UBND do không còn phù hợp với luật mới."
  },
  {
    "wrong": "tạm đình chỉ vĩnh viễn",
    "correct": "đình chỉ thi công",
    "description": "Thuật ngữ 'tạm đình chỉ' luôn mang tính có thời hạn. Nếu dừng vĩnh viễn/chấm dứt hẳn thì phải dùng 'đình chỉ'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Ra quyết định đình chỉ thi công công trình vi phạm."
  },
  {
    "wrong": "đình chỉ công tác 15 ngày",
    "correct": "tạm đình chỉ công tác 15 ngày",
    "description": "Khi đình chỉ có thời hạn nhất định để phục vụ thanh tra, kiểm tra, thuật ngữ pháp luật chuẩn xác là 'tạm đình chỉ công tác'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Thủ trưởng cơ quan quyết định tạm đình chỉ công tác 15 ngày đối với công chức A để làm rõ dấu hiệu vi phạm."
  },
  {
    "wrong": "thời hiệu nộp báo cáo",
    "correct": "thời hạn nộp báo cáo",
    "description": "Hạn nộp báo cáo, hồ sơ, tài liệu là 'thời hạn' (khoảng thời gian thực hiện công việc), không phải 'thời hiệu'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Thời hạn nộp báo cáo tài chính là ngày 31 tháng 3."
  },
  {
    "wrong": "thời hạn xử phạt vi phạm",
    "correct": "thời hiệu xử phạt vi phạm",
    "description": "Khoảng thời gian tối đa mà người có thẩm quyền được phép ban hành quyết định xử phạt vi phạm hành chính được luật định gọi là 'thời hiệu xử phạt vi phạm hành chính'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Đã hết thời hiệu xử phạt vi phạm hành chính đối với hành vi xây dựng không phép."
  },
  {
    "wrong": "thời hạn truy cứu trách nhiệm",
    "correct": "thời hiệu truy cứu trách nhiệm",
    "description": "Khoảng thời gian tối đa luật định để khởi tố, xét xử tội phạm gọi là 'thời hiệu truy cứu trách nhiệm hình sự'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Xác định vụ án đã hết thời hiệu truy cứu trách nhiệm hình sự."
  },
  {
    "wrong": "thời hạn khởi kiện vụ án",
    "correct": "thời hiệu khởi kiện vụ án",
    "description": "Thời hạn mà chủ thể được quyền yêu cầu Tòa án giải quyết vụ án dân sự, hành chính gọi là 'thời hiệu khởi kiện'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Kiểm tra thời hiệu khởi kiện của đương sự trước khi thụ lý đơn."
  },
  {
    "wrong": "khiếu nại hành vi tham nhũng",
    "correct": "tố cáo hành vi tham nhũng",
    "description": "Khi công dân phát hiện cán bộ có hành vi tham nhũng gây thất thoát tài sản nhà nước, quyền và nghĩa vụ đúng luật là 'tố cáo' (không phải 'khiếu nại').",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Công dân có quyền và nghĩa vụ tố cáo hành vi tham nhũng của người có chức vụ quyền hạn."
  },
  {
    "wrong": "tố cáo quyết định thu hồi đất",
    "correct": "khiếu nại quyết định thu hồi đất",
    "description": "Khi người bị thu hồi đất không đồng ý với quyết định hành chính áp dụng lên mình, hình thức pháp lý đúng là 'khiếu nại' (hoặc khởi kiện hành chính). Chỉ dùng 'tố cáo' nếu tố cáo người ký quyết định có hành vi vi phạm hình sự.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Người có đất bị thu hồi gửi đơn khiếu nại quyết định phê duyệt phương án bồi thường."
  },
  {
    "wrong": "chưng dụng",
    "correct": "trưng dụng",
    "description": "Từ ngữ pháp lý chuẩn xác là 'trưng dụng' (Nhà nước sử dụng có thời hạn tài sản trong tình trạng khẩn cấp). Trong tiếng Việt không có từ 'chưng dụng'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Quyết định trưng dụng xe cơ giới phục vụ công tác chống bão lụt."
  },
  {
    "wrong": "chưng dụng tài sản",
    "correct": "trưng dụng tài sản",
    "description": "Từ chuẩn mực là 'trưng dụng tài sản'. Không bao giờ dùng 'chưng dụng tài sản'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Thẩm quyền quyết định trưng dụng tài sản của tổ chức, cá nhân."
  },
  {
    "wrong": "chưng mua",
    "correct": "trưng mua",
    "description": "Thuật ngữ chuẩn xác là 'trưng mua' (Nhà nước mua bắt buộc tài sản có bồi hoàn theo giá thị trường). Không có từ 'chưng mua'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Trưng mua lương thực trong tình trạng khẩn cấp quốc gia."
  },
  {
    "wrong": "chưng cầu giám định",
    "correct": "trưng cầu giám định",
    "description": "Thuật ngữ tố tụng chuẩn xác là 'trưng cầu giám định' (cơ quan tiến hành tố tụng ra quyết định trưng cầu tổ chức giám định chuyên môn). Không có từ 'chưng cầu'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Cơ quan Cảnh sát điều tra ra quyết định trưng cầu giám định pháp y."
  },
  {
    "wrong": "chưng cầu ý dân",
    "correct": "trưng cầu ý dân",
    "description": "Thuật ngữ hiến định chuẩn xác là 'trưng cầu ý dân' (Quốc hội quyết định trưng cầu ý kiến cử tri toàn quốc). Không dùng 'chưng cầu'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Đề xuất tổ chức trưng cầu ý dân về việc sửa đổi Hiến pháp."
  },
  {
    "wrong": "bãi miễn chức vụ",
    "correct": "bãi nhiệm hoặc miễn nhiệm",
    "description": "Trong pháp luật công chức và bầu cử, không có từ ghép 'bãi miễn'. Phải phân biệt rõ: 'bãi nhiệm' (do vi phạm, áp dụng với chức vụ bầu) hoặc 'miễn nhiệm' (nghỉ trước thời hạn do lý do cá nhân, sức khỏe).",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Hội đồng nhân dân quyết định bãi nhiệm đại biểu HĐND do vi phạm pháp luật."
  },
  {
    "wrong": "sáng lạng",
    "correct": "xán lạn",
    "description": "Từ chuẩn xác là 'xán lạn' (rực rỡ, tươi sáng), không dùng 'sáng lạng'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Mở ra một tương lai xán lạn cho thế hệ trẻ."
  },
  {
    "wrong": "đọc giả",
    "correct": "độc giả",
    "description": "Từ Hán-Việt chuẩn xác là 'độc giả' (người đọc sách báo), không dùng 'đọc giả'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Cung cấp thông tin chuẩn xác và kịp thời đến đông đảo độc giả cả nước."
  },
  {
    "wrong": "trao dồi",
    "correct": "trau dồi",
    "description": "Từ chuẩn xác là 'trau dồi' (rèn luyện, bồi đắp kiến thức, đạo đức), không dùng 'trao dồi'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Không ngừng trau dồi phẩm chất chính trị và chuyên môn nghiệp vụ."
  },
  {
    "wrong": "chắp bút",
    "correct": "chấp bút",
    "description": "Từ chuẩn xác là 'chấp bút' (cầm bút viết văn bản theo chỉ đạo/ý tưởng của tập thể/lãnh đạo), không dùng 'chắp bút'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Giao Văn phòng chủ trì chấp bút dự thảo báo cáo tổng kết năm."
  },
  {
    "wrong": "chín mùi",
    "correct": "chín muồi",
    "description": "Từ chuẩn xác là 'chín muồi' (đạt tới độ phát triển đầy đủ nhất để chuyển biến), không dùng 'chín mùi'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Nắm bắt cơ hội khi thời cơ cách mạng đã chín muồi."
  },
  {
    "wrong": "đầy ấp",
    "correct": "đầy ắp",
    "description": "Từ chuẩn xác là 'đầy ắp' (chứa đựng tràn đầy, hết chỗ chứa), không dùng 'đầy ấp'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Khoang tàu đầy ắp tôm cá sau chuyến ra khơi bám biển."
  },
  {
    "wrong": "suông sẻ",
    "correct": "suôn sẻ",
    "description": "Từ chuẩn xác là 'suôn sẻ' (trôi chảy, thuận lợi, không gặp trục trặc), không dùng 'suông sẻ'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Quá trình thẩm định dự án diễn ra hết sức suôn sẻ."
  },
  {
    "wrong": "nói suôn",
    "correct": "nói suông",
    "description": "Từ chuẩn xác là 'nói suông' (chỉ nói miệng mà không làm), không dùng 'nói suôn'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Nói đi đôi với làm, kiên quyết chống biểu hiện nói suông."
  },
  {
    "wrong": "giấu diếm",
    "correct": "giấu giếm",
    "description": "Từ chuẩn xác là 'giấu giếm' (cố tình che giấu không cho người khác biết), cả hai từ tố đều bắt đầu bằng 'g'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tuyệt đối không bao che, giấu giếm các hành vi vi phạm kỷ luật."
  },
  {
    "wrong": "dấu giếm",
    "correct": "giấu giếm",
    "description": "Từ chuẩn xác là 'giấu giếm'. 'Dấu' là dấu vết/con dấu, còn 'giấu' là cất giữ/che giấu.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Nghiêm cấm mọi hành vi giấu giếm thông tin dịch bệnh."
  },
  {
    "wrong": "chăn chở",
    "correct": "trăn trở",
    "description": "Từ chuẩn xác là 'trăn trở' (băn khoăn suy nghĩ day dứt khôn nguôi), không dùng 'chăn chở'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Những trăn trở, tâm huyết của các đồng chí lão thành cách mạng."
  },
  {
    "wrong": "trở che",
    "correct": "chở che",
    "description": "Từ chuẩn xác là 'chở che' (che chở, bao bọc, bảo vệ), không dùng 'trở che'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Quân đội được nhân dân hết lòng đùm bọc, chở che."
  },
  {
    "wrong": "giàn xếp",
    "correct": "dàn xếp",
    "description": "Từ chuẩn xác là 'dàn xếp' (thu xếp, hòa giải ổn thỏa).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Các cơ quan chức năng hỗ trợ dàn xếp tranh chấp."
  },
  {
    "wrong": "dàn mướp",
    "correct": "giàn mướp",
    "description": "Từ chuẩn xác là 'giàn mướp' (khung tre/gỗ để cây leo), không dùng 'dàn mướp'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Trồng các giàn mướp, vườn rau tăng gia sản xuất."
  },
  {
    "wrong": "dàn giáo",
    "correct": "giàn giáo",
    "description": "Từ kỹ thuật chuẩn xác là 'giàn giáo' (kết cấu tạm thời nâng đỡ công nhân thi công xây dựng).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Kiểm định an toàn nghiêm ngặt toàn bộ hệ thống giàn giáo thi công."
  },
  {
    "wrong": "dàn khoan",
    "correct": "giàn khoan",
    "description": "Thuật ngữ chuẩn xác là 'giàn khoan' (công trình khai thác dầu khí trên biển hoặc trên đất liền).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Đảm bảo an ninh, an toàn tuyệt đối cho các giàn khoan dầu khí trên thềm lục địa."
  },
  {
    "wrong": "rút cuộc",
    "correct": "rốt cuộc",
    "description": "Từ chuẩn mực là 'rốt cuộc' (cuối cùng thì), không nên viết 'rút cuộc'.",
    "category": "variant",
    "severity": "warning",
    "example": "Đúng: Rốt cuộc, phương án tối ưu đã được Hội đồng thống nhất thông qua."
  },
  {
    "wrong": "kết cuộc",
    "correct": "kết cục",
    "description": "Từ chuẩn xác là 'kết cục' (kết quả cuối cùng của một quá trình/vụ việc), không dùng 'kết cuộc'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Đó là kết cục tất yếu của những hành vi coi thường kỷ cương pháp luật."
  },
  {
    "wrong": "bộc nộ",
    "correct": "bộc lộ",
    "description": "Từ chuẩn xác là 'bộc lộ' (phơi bày ra bên ngoài để nhận thấy), không dùng 'bộc nộ'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Quá trình vận hành đã bộc lộ một số bất cập cần sớm khắc phục."
  },
  {
    "wrong": "buôn ba",
    "correct": "bôn ba",
    "description": "Từ chuẩn xác là 'bôn ba' (lặn lội đi nhiều nơi vất vả vì mục đích lớn), không dùng 'buôn ba'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Bác Hồ đã bôn ba khắp năm châu bốn biển tìm đường cứu nước."
  },
  {
    "wrong": "giẫy giụa",
    "correct": "giãy giụa",
    "description": "Từ chuẩn xác là 'giãy giụa' (cựa quậy liên hồi để thoát khỏi bế tắc), không dùng 'giẫy giụa'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Cá mắc lưới giãy giụa tìm đường thoát thân."
  },
  {
    "wrong": "sai xót",
    "correct": "sai sót",
    "description": "Từ chuẩn xác là 'sai sót' (những chỗ sai sót nhỏ trong công việc), không dùng 'sai xót'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Nghiêm túc kiểm điểm, rút kinh nghiệm về các sai sót trong văn bản."
  },
  {
    "wrong": "sót xa",
    "correct": "xót xa",
    "description": "Từ chuẩn xác là 'xót xa' (nỗi đau đớn thương cảm sâu sắc trong lòng), không dùng 'sót xa'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Bày tỏ niềm tiếc thương và xót xa sâu sắc trước sự hy sinh dũng cảm của các chiến sĩ."
  },
  {
    "wrong": "chua sót",
    "correct": "chua xót",
    "description": "Từ chuẩn xác là 'chua xót' (cảm giác đắng cay tủi hổ), không dùng 'chua sót'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Rút ra bài học chua xót sau sự cố quản lý lỏng lẻo."
  },
  {
    "wrong": "tiêu sài",
    "correct": "tiêu xài",
    "description": "Từ chuẩn xác là 'tiêu xài' (sử dụng tiền bạc vào nhu cầu đời sống), không dùng 'tiêu sài'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Nghiêm cấm việc tiêu xài hoang phí công quỹ ngân sách."
  },
  {
    "wrong": "trầy sước",
    "correct": "trầy xước",
    "description": "Từ chuẩn xác là 'trầy xước' (bị cọ quẹt rách da nhẹ bên ngoài), không dùng 'trầy sước'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Nạn nhân may mắn chỉ bị trầy xước nhẹ sau vụ va chạm."
  },
  {
    "wrong": "trắp vá",
    "correct": "chắp vá",
    "description": "Từ chuẩn xác là 'chắp vá'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Chấm dứt cách làm chắp vá trong quản lý quy hoạch."
  },
  {
    "wrong": "nghỉ nghơi",
    "correct": "nghỉ ngơi",
    "description": "Từ chuẩn xác là 'nghỉ ngơi'. Trước nguyên âm 'o', quy tắc chính tả tiếng Việt viết 'ng' (không viết 'ngh').",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Bố trí thời gian làm việc và nghỉ ngơi hợp lý cho cán bộ chiến sĩ."
  },
  {
    "wrong": "ngành nghê",
    "correct": "ngành nghề",
    "description": "Từ chuẩn xác là 'ngành nghề' (thanh huyền trên chữ nghề).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Đăng ký bổ sung ngành nghề kinh doanh theo quy định."
  },
  {
    "wrong": "khiểm trách",
    "correct": "khiển trách",
    "description": "Hình thức kỷ luật Đảng và chính quyền chuẩn mực là 'khiển trách' (vần -iên), không dùng 'khiểm trách'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Áp dụng hình thức kỷ luật khiển trách đối với đồng chí Nguyễn Văn A."
  },
  {
    "wrong": "nghe phong phanh",
    "correct": "nghe phong thanh",
    "description": "Thành ngữ chuẩn xác là 'nghe phong thanh' (nghe tin đồn thoang thoáng qua tai, chưa được kiểm chứng). 'Phong phanh' chỉ dùng khi nói về áo quần mỏng manh.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Mới chỉ nghe phong thanh chứ chưa có văn bản chỉ đạo chính thức."
  },
  {
    "wrong": "đồn phong phanh",
    "correct": "đồn phong thanh",
    "description": "Từ chuẩn xác là 'đồn phong thanh'. Không dùng 'đồn phong phanh'.",
    "category": "context",
    "severity": "error",
    "example": "Đúng: Không nên tin theo những thông tin đồn phong thanh trên mạng xã hội."
  },
  {
    "wrong": "lãng mạng",
    "correct": "lãng mạn",
    "description": "Từ chuẩn xác là 'lãng mạn' (bay bổng, lý tưởng hóa tình cảm). Không có từ 'lãng mạng'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Cảm hứng lãng mạn cách mạng trong thơ ca kháng chiến."
  },
  {
    "wrong": "mạng phép",
    "correct": "mạn phép",
    "description": "Từ chuẩn xác là 'mạn phép' (xin phép một cách mạo muội, khiêm nhường). Không dùng 'mạng phép'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tôi xin mạn phép phát biểu đôi lời đóng góp vào bản dự thảo."
  },
  {
    "wrong": "chân mạng",
    "correct": "chân mệnh",
    "description": "Thành ngữ Hán-Việt chuẩn xác là 'chân mệnh thiên tử' (người có mệnh trời định thực sự), không dùng 'chân mạng'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Quan niệm về chân mệnh thiên tử trong lịch sử phong kiến."
  },
  {
    "wrong": "để giành",
    "correct": "để dành",
    "description": "Từ chuẩn xác là 'để dành' (giữ lại chưa dùng đến), không dùng 'để giành'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Lương thực dự trữ được để dành phòng khi thiên tai bão lụt."
  },
  {
    "wrong": "tranh dành",
    "correct": "tranh giành",
    "description": "Từ chuẩn xác là 'tranh giành' (đấu tranh để đoạt lấy quyền lợi về mình), bắt đầu bằng 'gi'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Ngăn chặn tình trạng tranh giành khách, chèn ép giá trên thị trường."
  },
  {
    "wrong": "chần trừ",
    "correct": "chần chừ",
    "description": "Từ chuẩn xác là 'chần chừ' (láy vần 'ch'). Không viết 'chần trừ'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tuyệt đối không chần chừ trong công tác cứu hộ cứu nạn."
  },
  {
    "wrong": "bạc ngàn",
    "correct": "bạt ngàn",
    "description": "Từ chuẩn xác là 'bạt ngàn' (mênh mông rộng lớn vô tận trên một diện tích rộng), không dùng 'bạc ngàn'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Những cánh rừng phòng hộ bạt ngàn màu xanh bao bọc làng quê."
  },
  {
    "wrong": "lễ nhận chức",
    "correct": "lễ nhậm chức",
    "description": "Nghi thức chính thức tiếp nhận trọng trách theo quyết định bổ nhiệm hoặc bầu cử chuẩn xác là 'lễ nhậm chức'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Lễ tuyên thệ nhậm chức của người đứng đầu Chính phủ diễn ra trang trọng trước Quốc hội."
  },
  {
    "wrong": "chiết lý",
    "correct": "triết lý",
    "description": "Từ chuẩn xác là 'triết lý' (quan niệm sâu sắc mang tính nền tảng về cuộc sống, tự nhiên, xã hội), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Triết lý giáo dục lấy người học làm trung tâm phát triển toàn diện."
  },
  {
    "wrong": "chiết học",
    "correct": "triết học",
    "description": "Thuật ngữ khoa học chuẩn xác là 'triết học'. Không dùng 'chiết học'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Vận dụng sáng tạo nguyên lý triết học Mác - Lênin vào thực tiễn Việt Nam."
  },
  {
    "wrong": "khởi tố bị cáo",
    "correct": "khởi tố bị can",
    "description": "Trong giai đoạn điều tra, người có hành vi phạm tội chỉ bị 'khởi tố bị can'. Thuật ngữ 'bị cáo' chỉ xuất hiện khi Tòa án ra quyết định đưa vụ án ra xét xử.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Cơ quan Cảnh sát điều tra ra quyết định khởi tố vụ án, khởi tố bị can đối với ông X."
  },
  {
    "wrong": "kháng cáo bản án phúc thẩm",
    "correct": "đề nghị kháng nghị giám đốc thẩm bản án phúc thẩm",
    "description": "Bản án phúc thẩm có hiệu lực pháp luật ngay sau khi tuyên, đương sự KHÔNG CÓ QUYỀN KHÁNG CÁO nữa mà chỉ có quyền làm đơn đề nghị người có thẩm quyền xem xét kháng nghị theo thủ tục Giám đốc thẩm hoặc Tái thẩm.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Đương sự làm đơn đề nghị Viện trưởng Viện kiểm sát nhân dân cấp cao xem xét kháng nghị giám đốc thẩm đối với bản án phúc thẩm."
  },
  {
    "wrong": "chứng thực hợp đồng chuyển nhượng đất",
    "correct": "công chứng hợp đồng chuyển nhượng đất",
    "description": "Theo Luật Đất đai và Luật Công chứng, hợp đồng chuyển nhượng quyền sử dụng đất giữa các cá nhân, tổ chức phải được 'công chứng' tại Văn phòng công chứng hoặc Phòng công chứng (hoặc chứng thực tại UBND cấp xã nơi chưa có tổ chức hành nghề công chứng). Trong giao dịch thương mại chuyên nghiệp, thuật ngữ chuẩn là 'công chứng hợp đồng'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Các bên tiến hành công chứng hợp đồng mua bán nhà đất theo đúng quy định của pháp luật."
  },
  {
    "wrong": "công chứng bản sao",
    "correct": "chứng thực bản sao từ bản chính",
    "description": "Theo Nghị định 23/2015/NĐ-CP, việc xác nhận bản sao đúng với bản chính gọi là 'chứng thực bản sao từ bản chính' (sao y), không gọi là 'công chứng bản sao'.",
    "category": "legal",
    "severity": "warning",
    "example": "Đúng: Hồ sơ đăng ký dự tuyển phải nộp kèm bản sao có chứng thực từ bản chính."
  },
  {
    "wrong": "tinh giảm biên chế",
    "correct": "tinh giản biên chế",
    "description": "Thuật ngữ chính thống trong các văn bản quy phạm pháp luật là 'tinh giản biên chế' (tinh lọc và làm cho đơn giản, gọn nhẹ). Không dùng 'tinh giảm biên chế'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Thực hiện nghiêm túc chính sách tinh giản biên chế gắn với cơ cấu lại đội ngũ cán bộ, công chức."
  },
  {
    "wrong": "trân thành",
    "correct": "chân thành",
    "description": "Từ chuẩn xác là 'chân thành' (thật lòng, thành thực từ đáy lòng), bắt đầu bằng 'ch'. Không dùng 'trân thành'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Xin chân thành cảm ơn sự quan tâm, giúp đỡ quý báu của các đồng chí."
  },
  {
    "wrong": "trân thành cảm ơn",
    "correct": "chân thành cảm ơn",
    "description": "Cụm từ chuẩn mực ở cuối bài phát biểu hoặc thư cảm ơn là 'chân thành cảm ơn' (hoặc 'trân trọng cảm ơn'). Tuyệt đối không ghép lai tạp 'trân thành cảm ơn'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Xin trân trọng cảm ơn! (hoặc: Xin chân thành cảm ơn!)"
  },
  {
    "wrong": "chân trọng",
    "correct": "trân trọng",
    "description": "Từ chuẩn xác là 'trân trọng' (coi trọng một cách kính cẩn, quý báu), bắt đầu bằng 'tr'. Không dùng 'chân trọng'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Trân trọng kính mời đồng chí tham dự hội nghị tổng kết."
  },
  {
    "wrong": "chân quý",
    "correct": "trân quý",
    "description": "Từ chuẩn xác là 'trân quý' (yêu quý và coi trọng như báu vật), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Luôn ghi nhớ và trân quý những tình cảm sâu nặng của đồng bào cả nước."
  },
  {
    "wrong": "chung thực",
    "correct": "trung thực",
    "description": "Từ chuẩn xác là 'trung thực' (ngay thẳng, thật thà, đúng với sự thật), bắt đầu bằng 'tr'. Không dùng 'chung thực'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Báo cáo trung thực, khách quan tình hình thực hiện dự án."
  },
  {
    "wrong": "chung thành",
    "correct": "trung thành",
    "description": "Từ chuẩn xác là 'trung thành' (một lòng một dạ gắn bó với mục tiêu, lý tưởng), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tuyệt đối trung thành với lý tưởng cách mạng của Đảng."
  },
  {
    "wrong": "chung gian",
    "correct": "trung gian",
    "description": "Từ chuẩn xác là 'trung gian' (ở vị trí giữa hai bên kết nối), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Cắt giảm tối đa các khâu trung gian để giảm chi phí lưu thông hàng hóa."
  },
  {
    "wrong": "trung quy",
    "correct": "chung quy",
    "description": "Từ chuẩn xác là 'chung quy' (tóm lại, rút cục lại điều cốt lõi), bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Chung quy lại, nguyên nhân chủ yếu vẫn là do yếu tố con người."
  },
  {
    "wrong": "trung kết",
    "correct": "chung kết",
    "description": "Từ chuẩn xác là 'chung kết' (trận đấu cuối cùng để định đoạt thắng thua), bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Đội tuyển xuất sắc giành quyền vào thi đấu trận chung kết."
  },
  {
    "wrong": "trân thực",
    "correct": "chân thực",
    "description": "Từ chuẩn xác là 'chân thực' (đúng với thực tế, không giả dối hư cấu), bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Bộ phim tài liệu phản ánh chân thực cuộc sống chiến đấu kiên cường của nhân dân ta."
  },
  {
    "wrong": "chục chặc",
    "correct": "trục trặc",
    "description": "Từ chuẩn xác là 'trục trặc' (gặp khó khăn, vướng mắc bất thường không trôi chảy), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Kịp thời khắc phục sự cố trục trặc kỹ thuật trên hệ thống mạng."
  },
  {
    "wrong": "chừng phạt",
    "correct": "trừng phạt",
    "description": "Từ chuẩn xác là 'trừng phạt' (áp dụng biện pháp trừng trị nghiêm khắc đối với hành vi sai trái), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Kiên quyết trừng phạt các hành vi vi phạm chủ quyền lãnh thổ quốc gia."
  },
  {
    "wrong": "chừng trị",
    "correct": "trừng trị",
    "description": "Từ chuẩn xác là 'trừng trị' (trị tội nghiêm khắc theo pháp luật).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Trừng trị nghiêm khắc những kẻ chủ mưu cầm đầu đường dây buôn lậu."
  },
  {
    "wrong": "trừng mực",
    "correct": "chừng mực",
    "description": "Từ chuẩn xác là 'chừng mực' (mức độ vừa phải, biết kiềm chế đúng phép tắc), bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Giữ thái độ chừng mực, nhã nhặn trong khi tiếp xúc, làm việc với công dân."
  },
  {
    "wrong": "chụ trì",
    "correct": "trụ trì",
    "description": "Từ chuẩn xác là 'trụ trì' (vị sư đứng đầu quản lý một ngôi chùa), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Đại đức Thích Tâm An, trụ trì chùa Bái Đính."
  },
  {
    "wrong": "trưng hửng",
    "correct": "chưng hửng",
    "description": "Từ chuẩn xác là 'chưng hửng' (cảm giác hụt hẫng ngỡ ngàng vì sự việc xảy ra trái với mong đợi), bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Mọi người đều chưng hửng khi đối tác bất ngờ hủy buổi ký kết."
  },
  {
    "wrong": "chơ chẽn",
    "correct": "trơ trẽn",
    "description": "Từ chuẩn xác là 'trơ trẽn' (mặt trơ trơ không biết xấu hổ), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Vạch trần những luận điệu xuyên tạc, vu khống trơ trẽn của các thế lực thù địch."
  },
  {
    "wrong": "chơ chọi",
    "correct": "trơ trọi",
    "description": "Từ chuẩn xác là 'trơ trọi' (đơn độc lẻ loi một mình giữa không gian trống trải), bắt đầu bằng 'tr'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Cây cổ thụ đứng trơ trọi giữa cánh đồng sau cơn bão lớn."
  },
  {
    "wrong": "trau chút",
    "correct": "trau chuốt",
    "description": "Từ chuẩn xác là 'trau chuốt' (sửa sang, gọt giũa tỉ mỉ cho câu từ, hình thức đẹp đẽ hơn), có âm đệm 'u' ở cả 2 tiếng.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Từng câu chữ trong bản tuyên ngôn đều được trau chuốt vô cùng công phu."
  },
  {
    "wrong": "chao chuốt",
    "correct": "trau chuốt",
    "description": "Từ chuẩn xác là 'trau chuốt'. Không dùng 'chao chuốt'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Báo cáo cần được trau chuốt lại câu chữ trước khi trình ký."
  },
  {
    "wrong": "tru toàn",
    "correct": "chu toàn",
    "description": "Từ chuẩn xác là 'chu toàn' (lo liệu mọi việc đầy đủ, trọn vẹn, không để sơ hở), bắt đầu bằng 'ch'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Đồng chí luôn chu toàn mọi công việc được tập thể giao phó."
  },
  {
    "wrong": "di rời",
    "correct": "di dời",
    "description": "Từ chuẩn mực trong văn bản quy hoạch, giải phóng mặt bằng là 'di dời' (chuyển dịch đến vị trí khác), dùng chữ 'd'. Không dùng 'di rời'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Hoàn thành công tác bồi thường và di dời các hộ dân trong vùng dự án."
  },
  {
    "wrong": "giập tắt",
    "correct": "dập tắt",
    "description": "Từ chuẩn xác là 'dập tắt' (làm cho tắt hẳn ngọn lửa hoặc ngăn chặn mầm mống bất ổn), dùng chữ 'd'. Tránh viết 'giập tắt'.",
    "category": "variant",
    "severity": "warning",
    "example": "Đúng: Lực lượng cảnh sát phòng cháy chữa cháy đã nhanh chóng dập tắt đám cháy."
  },
  {
    "wrong": "hạ tầng cơ sở",
    "correct": "kết cấu hạ tầng",
    "description": "Trong kinh tế và kỹ thuật, thuật ngữ chuẩn xác là 'kết cấu hạ tầng' hoặc 'hạ tầng kỹ thuật' (đường sá, cầu cống, viễn thông). Cụm từ 'hạ tầng cơ sở' là lỗi dùng thừa từ (ghép trùng nghĩa giữa 'hạ tầng' và 'cơ sở').",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Huy động tối đa các nguồn lực đầu tư phát triển hệ thống kết cấu hạ tầng giao thông đồng bộ, hiện đại."
  },
  {
    "wrong": "thời hiệu ban hành quyết định",
    "correct": "thời hạn ban hành quyết định",
    "description": "Khoảng thời gian quy định cơ quan phải hoàn thành ban hành quyết định gọi là 'thời hạn ban hành' (ví dụ: trong thời hạn 07 ngày làm việc), không dùng 'thời hiệu'.",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Thời hạn ban hành quyết định xử phạt vi phạm hành chính là 07 ngày làm việc kể từ ngày lập biên bản."
  },
  {
    "wrong": "thời hiệu giải quyết khiếu nại",
    "correct": "thời hạn giải quyết khiếu nại",
    "description": "Khoảng thời gian mà người có thẩm quyền phải giải quyết xong khiếu nại (30 ngày hoặc 45 ngày) là 'thời hạn giải quyết khiếu nại'. Chỉ có 'thời hiệu khiếu nại' (90 ngày để người dân gửi đơn).",
    "category": "legal",
    "severity": "error",
    "example": "Đúng: Thời hạn giải quyết khiếu nại lần đầu không quá 30 ngày kể từ ngày thụ lý."
  },
  {
    "wrong": "yếu điểm",
    "correct": "điểm yếu",
    "description": "Trong tiếng Việt chuẩn mực, 'yếu điểm' có nghĩa là 'điểm trọng yếu/quan trọng nhất'. Nếu muốn nói về chỗ thiếu sót, nhược điểm, nên dùng 'điểm yếu' hoặc 'nhược điểm'.",
    "category": "context",
    "severity": "warning",
    "example": "Đúng: Khắc phục điểm yếu của bản thân."
  },
  {
    "wrong": "thiếu xót",
    "correct": "thiếu sót",
    "description": "Cụm từ dễ nhầm: đề xuất 'thiếu sót' thay cho 'thiếu xót'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xuất xắc",
    "correct": "xuất sắc",
    "description": "Cụm từ dễ nhầm: đề xuất 'xuất sắc' thay cho 'xuất xắc'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xát nhập",
    "correct": "sáp nhập",
    "description": "Cụm từ dễ nhầm: đề xuất 'sáp nhập' thay cho 'xát nhập'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sáp xếp",
    "correct": "sắp xếp",
    "description": "Cụm từ dễ nhầm: đề xuất 'sắp xếp' thay cho 'sáp xếp'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giở dang",
    "correct": "dở dang",
    "description": "Cụm từ dễ nhầm: đề xuất 'dở dang' thay cho 'giở dang'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dỡ dang",
    "correct": "dở dang",
    "description": "Cụm từ dễ nhầm: đề xuất 'dở dang' thay cho 'dỡ dang'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chậm chễ",
    "correct": "chậm trễ",
    "description": "Cụm từ dễ nhầm: đề xuất 'chậm trễ' thay cho 'chậm chễ'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trao chuốt",
    "correct": "trau chuốt",
    "description": "Cụm từ dễ nhầm: đề xuất 'trau chuốt' thay cho 'trao chuốt'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chỉnh chu",
    "correct": "chỉn chu",
    "description": "Cụm từ dễ nhầm: đề xuất 'chỉn chu' thay cho 'chỉnh chu'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chính chắn",
    "correct": "chín chắn",
    "description": "Cụm từ dễ nhầm: đề xuất 'chín chắn' thay cho 'chính chắn'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "mạnh dạng",
    "correct": "mạnh dạn",
    "description": "Cụm từ dễ nhầm: đề xuất 'mạnh dạn' thay cho 'mạnh dạng'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hàm xúc",
    "correct": "hàm súc",
    "description": "Cụm từ dễ nhầm: đề xuất 'hàm súc' thay cho 'hàm xúc'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chia sẽ",
    "correct": "chia sẻ",
    "description": "Cụm từ dễ nhầm: đề xuất 'chia sẻ' thay cho 'chia sẽ'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "san sẽ",
    "correct": "san sẻ",
    "description": "Cụm từ dễ nhầm: đề xuất 'san sẻ' thay cho 'san sẽ'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chỉnh sữa",
    "correct": "chỉnh sửa",
    "description": "Cụm từ dễ nhầm: đề xuất 'chỉnh sửa' thay cho 'chỉnh sữa'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sữa chữa",
    "correct": "sửa chữa",
    "description": "Cụm từ dễ nhầm: đề xuất 'sửa chữa' thay cho 'sữa chữa'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "có lẻ",
    "correct": "có lẽ",
    "description": "Cụm từ dễ nhầm: đề xuất 'có lẽ' thay cho 'có lẻ'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cổ máy",
    "correct": "cỗ máy",
    "description": "Cụm từ dễ nhầm: đề xuất 'cỗ máy' thay cho 'cổ máy'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giúp đở",
    "correct": "giúp đỡ",
    "description": "Cụm từ dễ nhầm: đề xuất 'giúp đỡ' thay cho 'giúp đở'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kỹ niệm",
    "correct": "kỷ niệm",
    "description": "Cụm từ dễ nhầm: đề xuất 'kỷ niệm' thay cho 'kỹ niệm'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "nền tản",
    "correct": "nền tảng",
    "description": "Cụm từ dễ nhầm: đề xuất 'nền tảng' thay cho 'nền tản'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "nộ lực",
    "correct": "nỗ lực",
    "description": "Cụm từ dễ nhầm: đề xuất 'nỗ lực' thay cho 'nộ lực'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "rãnh rỗi",
    "correct": "rảnh rỗi",
    "description": "Cụm từ dễ nhầm: đề xuất 'rảnh rỗi' thay cho 'rãnh rỗi'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sẳn sàng",
    "correct": "sẵn sàng",
    "description": "Cụm từ dễ nhầm: đề xuất 'sẵn sàng' thay cho 'sẳn sàng'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sỡ dĩ",
    "correct": "sở dĩ",
    "description": "Cụm từ dễ nhầm: đề xuất 'sở dĩ' thay cho 'sỡ dĩ'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trãi nghiệm",
    "correct": "trải nghiệm",
    "description": "Cụm từ dễ nhầm: đề xuất 'trải nghiệm' thay cho 'trãi nghiệm'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "khuyên cáo",
    "correct": "khuyến cáo",
    "description": "Cụm từ dễ nhầm: đề xuất 'khuyến cáo' thay cho 'khuyên cáo'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "mầm móng",
    "correct": "mầm mống",
    "description": "Cụm từ dễ nhầm: đề xuất 'mầm mống' thay cho 'mầm móng'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bạt bẽo",
    "correct": "bạc bẽo",
    "description": "Cụm từ dễ nhầm: đề xuất 'bạc bẽo' thay cho 'bạt bẽo'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bạt nhược",
    "correct": "bạc nhược",
    "description": "Cụm từ dễ nhầm: đề xuất 'bạc nhược' thay cho 'bạt nhược'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "say xưa",
    "correct": "say sưa",
    "description": "Cụm từ dễ nhầm: đề xuất 'say sưa' thay cho 'say xưa'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xuýt nữa",
    "correct": "suýt nữa",
    "description": "Cụm từ dễ nhầm: đề xuất 'suýt nữa' thay cho 'xuýt nữa'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đau sót",
    "correct": "đau xót",
    "description": "Cụm từ dễ nhầm: đề xuất 'đau xót' thay cho 'đau sót'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sót ruột",
    "correct": "sốt ruột",
    "description": "Cụm từ dễ nhầm: đề xuất 'sốt ruột' thay cho 'sót ruột'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xung sướng",
    "correct": "sung sướng",
    "description": "Cụm từ dễ nhầm: đề xuất 'sung sướng' thay cho 'xung sướng'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xững xờ",
    "correct": "sững sờ",
    "description": "Cụm từ dễ nhầm: đề xuất 'sững sờ' thay cho 'xững xờ'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xúc miệng",
    "correct": "súc miệng",
    "description": "Cụm từ dễ nhầm: đề xuất 'súc miệng' thay cho 'xúc miệng'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sào nấu",
    "correct": "xào nấu",
    "description": "Cụm từ dễ nhầm: đề xuất 'xào nấu' thay cho 'sào nấu'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sỏ siên",
    "correct": "xỏ xiên",
    "description": "Cụm từ dễ nhầm: đề xuất 'xỏ xiên' thay cho 'sỏ siên'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sung quanh",
    "correct": "xung quanh",
    "description": "Cụm từ dễ nhầm: đề xuất 'xung quanh' thay cho 'sung quanh'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xương mù",
    "correct": "sương mù",
    "description": "Cụm từ dễ nhầm: đề xuất 'sương mù' thay cho 'xương mù'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dả tạo",
    "correct": "giả tạo",
    "description": "Cụm từ dễ nhầm: đề xuất 'giả tạo' thay cho 'dả tạo'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dũ dượi",
    "correct": "rũ rượi",
    "description": "Cụm từ dễ nhầm: đề xuất 'rũ rượi' thay cho 'dũ dượi'. Hãy xem ngữ cảnh trước khi thay.",
    "category": "spelling",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tha mưu",
    "correct": "tham mưu",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham mưu\" (đề xuất, giúp cấp trên nghiên cứu, quyết định). \"Tha\" đứng riêng mang nghĩa tha tội, tha thứ, không ghép với \"mưu\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Công an xã tham mưu UBND xã ban hành Thông báo số 780/TB-UBND."
  },
  {
    "wrong": "tha gia",
    "correct": "tham gia",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham gia\" (góp phần vào một hoạt động).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Toàn thể đoàn viên tham gia đầy đủ các buổi sinh hoạt."
  },
  {
    "wrong": "tha khảo",
    "correct": "tham khảo",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham khảo\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tài liệu tham khảo kèm theo kế hoạch."
  },
  {
    "wrong": "tha dự",
    "correct": "tham dự",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham dự\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Thành phần tham dự hội nghị gồm lãnh đạo các phòng, ban."
  },
  {
    "wrong": "tha luận",
    "correct": "tham luận",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham luận\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Các đơn vị gửi bài tham luận trước ngày 20/10."
  },
  {
    "wrong": "tha vấn",
    "correct": "tham vấn",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham vấn\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tổ chức tham vấn ý kiến Nhân dân về dự thảo."
  },
  {
    "wrong": "tha chiếu",
    "correct": "tham chiếu",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham chiếu\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Số liệu tham chiếu theo Phụ lục kèm theo."
  },
  {
    "wrong": "tha nhũng",
    "correct": "tham nhũng",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham nhũng\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tăng cường công tác phòng, chống tham nhũng, lãng phí."
  },
  {
    "wrong": "tha ô",
    "correct": "tham ô",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham ô\" (chiếm đoạt tài sản do mình quản lý).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Xử lý nghiêm hành vi tham ô tài sản nhà nước."
  },
  {
    "wrong": "tha vọng",
    "correct": "tham vọng",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham vọng\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Mục tiêu đặt ra có tính tham vọng nhưng khả thi."
  },
  {
    "wrong": "tha chiến",
    "correct": "tham chiến",
    "description": "Thiếu chữ \"m\": viết đúng là \"tham chiến\".",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Thăm hỏi các cựu chiến binh từng tham chiến."
  },
  {
    "wrong": "tha quan",
    "correct": "tham quan",
    "description": "Có thể thiếu chữ \"m\": thường viết là \"tham quan\" (đi xem để mở rộng hiểu biết).",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Tổ chức cho đoàn viên tham quan khu di tích."
  },
  {
    "wrong": "an thực phẩm",
    "correct": "an toàn thực phẩm",
    "description": "Có thể thiếu chữ \"toàn\": cụm từ chuẩn là \"an toàn thực phẩm\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "an toàn phẩm",
    "correct": "an toàn thực phẩm",
    "description": "Có thể thiếu chữ \"thực\": cụm từ chuẩn là \"an toàn thực phẩm\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ban chấp hành ương",
    "correct": "ban chấp hành trung ương",
    "description": "Có thể thiếu chữ \"trung\": cụm từ chuẩn là \"ban chấp hành trung ương\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ban chấp trung ương",
    "correct": "ban chấp hành trung ương",
    "description": "Có thể thiếu chữ \"hành\": cụm từ chuẩn là \"ban chấp hành trung ương\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ban chấp đảng bộ",
    "correct": "ban chấp hành đảng bộ",
    "description": "Có thể thiếu chữ \"hành\": cụm từ chuẩn là \"ban chấp hành đảng bộ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ban chỉ huy sự",
    "correct": "ban chỉ huy quân sự",
    "description": "Có thể thiếu chữ \"quân\": cụm từ chuẩn là \"ban chỉ huy quân sự\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ban chỉ quân sự",
    "correct": "ban chỉ huy quân sự",
    "description": "Có thể thiếu chữ \"huy\": cụm từ chuẩn là \"ban chỉ huy quân sự\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ban huy quân sự",
    "correct": "ban chỉ huy quân sự",
    "description": "Có thể thiếu chữ \"chỉ\": cụm từ chuẩn là \"ban chỉ huy quân sự\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bảo hiểm hội",
    "correct": "bảo hiểm xã hội",
    "description": "Có thể thiếu chữ \"xã\": cụm từ chuẩn là \"bảo hiểm xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bảo hiểm tế",
    "correct": "bảo hiểm y tế",
    "description": "Có thể thiếu chữ \"y\": cụm từ chuẩn là \"bảo hiểm y tế\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bộ chỉ huy sự",
    "correct": "bộ chỉ huy quân sự",
    "description": "Có thể thiếu chữ \"quân\": cụm từ chuẩn là \"bộ chỉ huy quân sự\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bộ chỉ quân sự",
    "correct": "bộ chỉ huy quân sự",
    "description": "Có thể thiếu chữ \"huy\": cụm từ chuẩn là \"bộ chỉ huy quân sự\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bộ dục và đào tạo",
    "correct": "bộ giáo dục và đào tạo",
    "description": "Có thể thiếu chữ \"giáo\": cụm từ chuẩn là \"bộ giáo dục và đào tạo\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "bộ huy quân sự",
    "correct": "bộ chỉ huy quân sự",
    "description": "Có thể thiếu chữ \"chỉ\": cụm từ chuẩn là \"bộ chỉ huy quân sự\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chiến sĩ đua",
    "correct": "chiến sĩ thi đua",
    "description": "Có thể thiếu chữ \"thi\": cụm từ chuẩn là \"chiến sĩ thi đua\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chiến thi đua",
    "correct": "chiến sĩ thi đua",
    "description": "Có thể thiếu chữ \"sĩ\": cụm từ chuẩn là \"chiến sĩ thi đua\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chính quyền tử",
    "correct": "chính quyền điện tử",
    "description": "Có thể thiếu chữ \"điện\": cụm từ chuẩn là \"chính quyền điện tử\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chương trình mục quốc gia",
    "correct": "chương trình mục tiêu quốc gia",
    "description": "Có thể thiếu chữ \"tiêu\": cụm từ chuẩn là \"chương trình mục tiêu quốc gia\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chương trình mục tiêu gia",
    "correct": "chương trình mục tiêu quốc gia",
    "description": "Có thể thiếu chữ \"quốc\": cụm từ chuẩn là \"chương trình mục tiêu quốc gia\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chất lượng dục",
    "correct": "chất lượng giáo dục",
    "description": "Có thể thiếu chữ \"giáo\": cụm từ chuẩn là \"chất lượng giáo dục\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chịu nhiệm thi hành",
    "correct": "chịu trách nhiệm thi hành",
    "description": "Có thể thiếu chữ \"trách\": cụm từ chuẩn là \"chịu trách nhiệm thi hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chịu trách nhiệm thi",
    "correct": "chịu trách nhiệm thi hành",
    "description": "Có thể thiếu chữ \"hành\": cụm từ chuẩn là \"chịu trách nhiệm thi hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chịu trách thi hành",
    "correct": "chịu trách nhiệm thi hành",
    "description": "Có thể thiếu chữ \"nhiệm\": cụm từ chuẩn là \"chịu trách nhiệm thi hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ hội đồng nhân dân",
    "correct": "chủ tịch hội đồng nhân dân",
    "description": "Có thể thiếu chữ \"tịch\": cụm từ chuẩn là \"chủ tịch hội đồng nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ soạn thảo",
    "correct": "chủ trì soạn thảo",
    "description": "Có thể thiếu chữ \"trì\": cụm từ chuẩn là \"chủ trì soạn thảo\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ trì thảo",
    "correct": "chủ trì soạn thảo",
    "description": "Có thể thiếu chữ \"soạn\": cụm từ chuẩn là \"chủ trì soạn thảo\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ tịch ủy ban nhân",
    "correct": "chủ tịch ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"chủ tịch ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ tịch uỷ ban nhân",
    "correct": "chủ tịch uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"chủ tịch uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ tịch uỷ nhân dân",
    "correct": "chủ tịch uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"chủ tịch uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ tịch ủy nhân dân",
    "correct": "chủ tịch ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"chủ tịch ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ ủy ban nhân dân",
    "correct": "chủ tịch ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"tịch\": cụm từ chuẩn là \"chủ tịch ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "chủ uỷ ban nhân dân",
    "correct": "chủ tịch uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"tịch\": cụm từ chuẩn là \"chủ tịch uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cán bộ chức viên chức",
    "correct": "cán bộ công chức viên chức",
    "description": "Có thể thiếu chữ \"công\": cụm từ chuẩn là \"cán bộ công chức viên chức\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cán bộ công chức chức",
    "correct": "cán bộ công chức viên chức",
    "description": "Có thể thiếu chữ \"viên\": cụm từ chuẩn là \"cán bộ công chức viên chức\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cán công chức viên chức",
    "correct": "cán bộ công chức viên chức",
    "description": "Có thể thiếu chữ \"bộ\": cụm từ chuẩn là \"cán bộ công chức viên chức\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "có hiệu kể từ ngày",
    "correct": "có hiệu lực kể từ ngày",
    "description": "Có thể thiếu chữ \"lực\": cụm từ chuẩn là \"có hiệu lực kể từ ngày\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "có hiệu lực thi",
    "correct": "có hiệu lực thi hành",
    "description": "Có thể thiếu chữ \"hành\": cụm từ chuẩn là \"có hiệu lực thi hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "công lưu trữ",
    "correct": "công tác lưu trữ",
    "description": "Có thể thiếu chữ \"tác\": cụm từ chuẩn là \"công tác lưu trữ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "công tác trữ",
    "correct": "công tác lưu trữ",
    "description": "Có thể thiếu chữ \"lưu\": cụm từ chuẩn là \"công tác lưu trữ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cơ ngang bộ",
    "correct": "cơ quan ngang bộ",
    "description": "Có thể thiếu chữ \"quan\": cụm từ chuẩn là \"cơ quan ngang bộ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cơ quan thuộc phủ",
    "correct": "cơ quan thuộc chính phủ",
    "description": "Có thể thiếu chữ \"chính\": cụm từ chuẩn là \"cơ quan thuộc chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cơ thuộc chính phủ",
    "correct": "cơ quan thuộc chính phủ",
    "description": "Có thể thiếu chữ \"quan\": cụm từ chuẩn là \"cơ quan thuộc chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cơ vật chất",
    "correct": "cơ sở vật chất",
    "description": "Có thể thiếu chữ \"sở\": cụm từ chuẩn là \"cơ sở vật chất\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cải hành chính",
    "correct": "cải cách hành chính",
    "description": "Có thể thiếu chữ \"cách\": cụm từ chuẩn là \"cải cách hành chính\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hoà xã chủ nghĩa việt nam",
    "correct": "cộng hoà xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"hội\": cụm từ chuẩn là \"cộng hoà xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hòa xã chủ nghĩa việt nam",
    "correct": "cộng hòa xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"hội\": cụm từ chuẩn là \"cộng hòa xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hoà xã hội chủ nghĩa việt",
    "correct": "cộng hoà xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"nam\": cụm từ chuẩn là \"cộng hoà xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hòa xã hội chủ nghĩa việt",
    "correct": "cộng hòa xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"nam\": cụm từ chuẩn là \"cộng hòa xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hòa xã hội chủ việt nam",
    "correct": "cộng hòa xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"nghĩa\": cụm từ chuẩn là \"cộng hòa xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hoà xã hội chủ việt nam",
    "correct": "cộng hoà xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"nghĩa\": cụm từ chuẩn là \"cộng hoà xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hòa xã hội nghĩa việt nam",
    "correct": "cộng hòa xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"chủ\": cụm từ chuẩn là \"cộng hòa xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "cộng hoà xã hội nghĩa việt nam",
    "correct": "cộng hoà xã hội chủ nghĩa việt nam",
    "description": "Có thể thiếu chữ \"chủ\": cụm từ chuẩn là \"cộng hoà xã hội chủ nghĩa việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "danh hồ sơ",
    "correct": "danh mục hồ sơ",
    "description": "Có thể thiếu chữ \"mục\": cụm từ chuẩn là \"danh mục hồ sơ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "doanh nhà nước",
    "correct": "doanh nghiệp nhà nước",
    "description": "Có thể thiếu chữ \"nghiệp\": cụm từ chuẩn là \"doanh nghiệp nhà nước\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dịch công trực tuyến",
    "correct": "dịch vụ công trực tuyến",
    "description": "Có thể thiếu chữ \"vụ\": cụm từ chuẩn là \"dịch vụ công trực tuyến\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dự ngân sách",
    "correct": "dự toán ngân sách",
    "description": "Có thể thiếu chữ \"toán\": cụm từ chuẩn là \"dự toán ngân sách\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dự toán sách",
    "correct": "dự toán ngân sách",
    "description": "Có thể thiếu chữ \"ngân\": cụm từ chuẩn là \"dự toán ngân sách\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "dự văn bản",
    "correct": "dự thảo văn bản",
    "description": "Có thể thiếu chữ \"thảo\": cụm từ chuẩn là \"dự thảo văn bản\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giải chủ yếu",
    "correct": "giải pháp chủ yếu",
    "description": "Có thể thiếu chữ \"pháp\": cụm từ chuẩn là \"giải pháp chủ yếu\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giảm nghèo vững",
    "correct": "giảm nghèo bền vững",
    "description": "Có thể thiếu chữ \"bền\": cụm từ chuẩn là \"giảm nghèo bền vững\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giấy chứng nhận quyền dụng đất",
    "correct": "giấy chứng nhận quyền sử dụng đất",
    "description": "Có thể thiếu chữ \"sử\": cụm từ chuẩn là \"giấy chứng nhận quyền sử dụng đất\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giấy chứng nhận quyền sử đất",
    "correct": "giấy chứng nhận quyền sử dụng đất",
    "description": "Có thể thiếu chữ \"dụng\": cụm từ chuẩn là \"giấy chứng nhận quyền sử dụng đất\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "giấy chứng quyền sử dụng đất",
    "correct": "giấy chứng nhận quyền sử dụng đất",
    "description": "Có thể thiếu chữ \"nhận\": cụm từ chuẩn là \"giấy chứng nhận quyền sử dụng đất\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hoàn thành sắc nhiệm vụ",
    "correct": "hoàn thành xuất sắc nhiệm vụ",
    "description": "Có thể thiếu chữ \"xuất\": cụm từ chuẩn là \"hoàn thành xuất sắc nhiệm vụ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hoàn thành xuất sắc vụ",
    "correct": "hoàn thành xuất sắc nhiệm vụ",
    "description": "Có thể thiếu chữ \"nhiệm\": cụm từ chuẩn là \"hoàn thành xuất sắc nhiệm vụ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hoàn tốt nhiệm vụ",
    "correct": "hoàn thành tốt nhiệm vụ",
    "description": "Có thể thiếu chữ \"thành\": cụm từ chuẩn là \"hoàn thành tốt nhiệm vụ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hoàn xuất sắc nhiệm vụ",
    "correct": "hoàn thành xuất sắc nhiệm vụ",
    "description": "Có thể thiếu chữ \"thành\": cụm từ chuẩn là \"hoàn thành xuất sắc nhiệm vụ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hướng thi hành",
    "correct": "hướng dẫn thi hành",
    "description": "Có thể thiếu chữ \"dẫn\": cụm từ chuẩn là \"hướng dẫn thi hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hồ dự thảo",
    "correct": "hồ sơ dự thảo",
    "description": "Có thể thiếu chữ \"sơ\": cụm từ chuẩn là \"hồ sơ dự thảo\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hội chiến binh",
    "correct": "hội cựu chiến binh",
    "description": "Có thể thiếu chữ \"cựu\": cụm từ chuẩn là \"hội cựu chiến binh\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hội hiệp phụ nữ",
    "correct": "hội liên hiệp phụ nữ",
    "description": "Có thể thiếu chữ \"liên\": cụm từ chuẩn là \"hội liên hiệp phụ nữ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hội liên phụ nữ",
    "correct": "hội liên hiệp phụ nữ",
    "description": "Có thể thiếu chữ \"hiệp\": cụm từ chuẩn là \"hội liên hiệp phụ nữ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "hội đồng nhân",
    "correct": "hội đồng nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"hội đồng nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kho bạc nước",
    "correct": "kho bạc nhà nước",
    "description": "Có thể thiếu chữ \"nhà\": cụm từ chuẩn là \"kho bạc nhà nước\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kinh thực hiện",
    "correct": "kinh phí thực hiện",
    "description": "Có thể thiếu chữ \"phí\": cụm từ chuẩn là \"kinh phí thực hiện\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kiểm giám sát",
    "correct": "kiểm tra giám sát",
    "description": "Có thể thiếu chữ \"tra\": cụm từ chuẩn là \"kiểm tra giám sát\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kiểm nhà nước",
    "correct": "kiểm toán nhà nước",
    "description": "Có thể thiếu chữ \"toán\": cụm từ chuẩn là \"kiểm toán nhà nước\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kiểm tra đốc",
    "correct": "kiểm tra đôn đốc",
    "description": "Có thể thiếu chữ \"đôn\": cụm từ chuẩn là \"kiểm tra đôn đốc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kiểm đôn đốc",
    "correct": "kiểm tra đôn đốc",
    "description": "Có thể thiếu chữ \"tra\": cụm từ chuẩn là \"kiểm tra đôn đốc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "kỹ thuật bày",
    "correct": "kỹ thuật trình bày",
    "description": "Có thể thiếu chữ \"trình\": cụm từ chuẩn là \"kỹ thuật trình bày\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "lao tiên tiến",
    "correct": "lao động tiên tiến",
    "description": "Có thể thiếu chữ \"động\": cụm từ chuẩn là \"lao động tiên tiến\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "liên lao động",
    "correct": "liên đoàn lao động",
    "description": "Có thể thiếu chữ \"đoàn\": cụm từ chuẩn là \"liên đoàn lao động\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "liên đoàn động",
    "correct": "liên đoàn lao động",
    "description": "Có thể thiếu chữ \"lao\": cụm từ chuẩn là \"liên đoàn lao động\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "luật ban hành văn bản phạm pháp luật",
    "correct": "luật ban hành văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"quy\": cụm từ chuẩn là \"luật ban hành văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "luật ban hành văn bản quy pháp luật",
    "correct": "luật ban hành văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"phạm\": cụm từ chuẩn là \"luật ban hành văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "luật ban hành văn quy phạm pháp luật",
    "correct": "luật ban hành văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"bản\": cụm từ chuẩn là \"luật ban hành văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "luật hành văn bản quy phạm pháp luật",
    "correct": "luật ban hành văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"luật ban hành văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "luật tổ chức chính quyền phương",
    "correct": "luật tổ chức chính quyền địa phương",
    "description": "Có thể thiếu chữ \"địa\": cụm từ chuẩn là \"luật tổ chức chính quyền địa phương\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "luật tổ chức chính địa phương",
    "correct": "luật tổ chức chính quyền địa phương",
    "description": "Có thể thiếu chữ \"quyền\": cụm từ chuẩn là \"luật tổ chức chính quyền địa phương\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "mặt trận quốc việt nam",
    "correct": "mặt trận tổ quốc việt nam",
    "description": "Có thể thiếu chữ \"tổ\": cụm từ chuẩn là \"mặt trận tổ quốc việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "mặt trận tổ việt nam",
    "correct": "mặt trận tổ quốc việt nam",
    "description": "Có thể thiếu chữ \"quốc\": cụm từ chuẩn là \"mặt trận tổ quốc việt nam\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ngân nhà nước",
    "correct": "ngân hàng nhà nước",
    "description": "Có thể thiếu chữ \"hàng\": cụm từ chuẩn là \"ngân hàng nhà nước\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "nhiệm trọng tâm",
    "correct": "nhiệm vụ trọng tâm",
    "description": "Có thể thiếu chữ \"vụ\": cụm từ chuẩn là \"nhiệm vụ trọng tâm\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "nhiệm vụ tâm",
    "correct": "nhiệm vụ trọng tâm",
    "description": "Có thể thiếu chữ \"trọng\": cụm từ chuẩn là \"nhiệm vụ trọng tâm\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phát kinh tế xã hội",
    "correct": "phát triển kinh tế xã hội",
    "description": "Có thể thiếu chữ \"triển\": cụm từ chuẩn là \"phát triển kinh tế xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phát triển kinh xã hội",
    "correct": "phát triển kinh tế xã hội",
    "description": "Có thể thiếu chữ \"tế\": cụm từ chuẩn là \"phát triển kinh tế xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phát triển tế xã hội",
    "correct": "phát triển kinh tế xã hội",
    "description": "Có thể thiếu chữ \"kinh\": cụm từ chuẩn là \"phát triển kinh tế xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phòng cháy cháy",
    "correct": "phòng cháy chữa cháy",
    "description": "Có thể thiếu chữ \"chữa\": cụm từ chuẩn là \"phòng cháy chữa cháy\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phòng chống nhũng",
    "correct": "phòng chống tham nhũng",
    "description": "Có thể thiếu chữ \"tham\": cụm từ chuẩn là \"phòng chống tham nhũng\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phòng dục và đào tạo",
    "correct": "phòng giáo dục và đào tạo",
    "description": "Có thể thiếu chữ \"giáo\": cụm từ chuẩn là \"phòng giáo dục và đào tạo\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó chủ tịch ủy nhân dân",
    "correct": "phó chủ tịch ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"phó chủ tịch ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó chủ tịch uỷ nhân dân",
    "correct": "phó chủ tịch uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"phó chủ tịch uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó chủ ủy ban nhân dân",
    "correct": "phó chủ tịch ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"tịch\": cụm từ chuẩn là \"phó chủ tịch ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó chủ uỷ ban nhân dân",
    "correct": "phó chủ tịch uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"tịch\": cụm từ chuẩn là \"phó chủ tịch uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó thủ chính phủ",
    "correct": "phó thủ tướng chính phủ",
    "description": "Có thể thiếu chữ \"tướng\": cụm từ chuẩn là \"phó thủ tướng chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó thủ tướng phủ",
    "correct": "phó thủ tướng chính phủ",
    "description": "Có thể thiếu chữ \"chính\": cụm từ chuẩn là \"phó thủ tướng chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó tướng chính phủ",
    "correct": "phó thủ tướng chính phủ",
    "description": "Có thể thiếu chữ \"thủ\": cụm từ chuẩn là \"phó thủ tướng chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó tịch uỷ ban nhân dân",
    "correct": "phó chủ tịch uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"chủ\": cụm từ chuẩn là \"phó chủ tịch uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "phó tịch ủy ban nhân dân",
    "correct": "phó chủ tịch ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"chủ\": cụm từ chuẩn là \"phó chủ tịch ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quy chi tiết",
    "correct": "quy định chi tiết",
    "description": "Có thể thiếu chữ \"định\": cụm từ chuẩn là \"quy định chi tiết\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quy pháp luật",
    "correct": "quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"phạm\": cụm từ chuẩn là \"quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quyền dụng đất",
    "correct": "quyền sử dụng đất",
    "description": "Có thể thiếu chữ \"sử\": cụm từ chuẩn là \"quyền sử dụng đất\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quyền sử đất",
    "correct": "quyền sử dụng đất",
    "description": "Có thể thiếu chữ \"dụng\": cụm từ chuẩn là \"quyền sử dụng đất\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quốc an ninh",
    "correct": "quốc phòng an ninh",
    "description": "Có thể thiếu chữ \"phòng\": cụm từ chuẩn là \"quốc phòng an ninh\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quốc phòng ninh",
    "correct": "quốc phòng an ninh",
    "description": "Có thể thiếu chữ \"an\": cụm từ chuẩn là \"quốc phòng an ninh\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sao y chính",
    "correct": "sao y bản chính",
    "description": "Có thể thiếu chữ \"bản\": cụm từ chuẩn là \"sao y bản chính\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sở dục và đào tạo",
    "correct": "sở giáo dục và đào tạo",
    "description": "Có thể thiếu chữ \"giáo\": cụm từ chuẩn là \"sở giáo dục và đào tạo\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "sở hoạch và đầu tư",
    "correct": "sở kế hoạch và đầu tư",
    "description": "Có thể thiếu chữ \"kế\": cụm từ chuẩn là \"sở kế hoạch và đầu tư\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thanh tra phủ",
    "correct": "thanh tra chính phủ",
    "description": "Có thể thiếu chữ \"chính\": cụm từ chuẩn là \"thanh tra chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "theo quy của pháp luật",
    "correct": "theo quy định của pháp luật",
    "description": "Có thể thiếu chữ \"định\": cụm từ chuẩn là \"theo quy định của pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "theo quy tại",
    "correct": "theo quy định tại",
    "description": "Có thể thiếu chữ \"định\": cụm từ chuẩn là \"theo quy định tại\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thi đua thưởng",
    "correct": "thi đua khen thưởng",
    "description": "Có thể thiếu chữ \"khen\": cụm từ chuẩn là \"thi đua khen thưởng\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thủ chính phủ",
    "correct": "thủ tướng chính phủ",
    "description": "Có thể thiếu chữ \"tướng\": cụm từ chuẩn là \"thủ tướng chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thủ hành chính",
    "correct": "thủ tục hành chính",
    "description": "Có thể thiếu chữ \"tục\": cụm từ chuẩn là \"thủ tục hành chính\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thủ tướng phủ",
    "correct": "thủ tướng chính phủ",
    "description": "Có thể thiếu chữ \"chính\": cụm từ chuẩn là \"thủ tướng chính phủ\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thực hành kiệm chống lãng phí",
    "correct": "thực hành tiết kiệm chống lãng phí",
    "description": "Có thể thiếu chữ \"tiết\": cụm từ chuẩn là \"thực hành tiết kiệm chống lãng phí\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thực hành tiết chống lãng phí",
    "correct": "thực hành tiết kiệm chống lãng phí",
    "description": "Có thể thiếu chữ \"kiệm\": cụm từ chuẩn là \"thực hành tiết kiệm chống lãng phí\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thực hành tiết kiệm chống lãng",
    "correct": "thực hành tiết kiệm chống lãng phí",
    "description": "Có thể thiếu chữ \"phí\": cụm từ chuẩn là \"thực hành tiết kiệm chống lãng phí\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thực hành tiết kiệm chống phí",
    "correct": "thực hành tiết kiệm chống lãng phí",
    "description": "Có thể thiếu chữ \"lãng\": cụm từ chuẩn là \"thực hành tiết kiệm chống lãng phí\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "thực tiết kiệm chống lãng phí",
    "correct": "thực hành tiết kiệm chống lãng phí",
    "description": "Có thể thiếu chữ \"hành\": cụm từ chuẩn là \"thực hành tiết kiệm chống lãng phí\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "triển thực hiện",
    "correct": "triển khai thực hiện",
    "description": "Có thể thiếu chữ \"khai\": cụm từ chuẩn là \"triển khai thực hiện\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trân cảm ơn",
    "correct": "trân trọng cảm ơn",
    "description": "Có thể thiếu chữ \"trọng\": cụm từ chuẩn là \"trân trọng cảm ơn\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trân kính mời",
    "correct": "trân trọng kính mời",
    "description": "Có thể thiếu chữ \"trọng\": cụm từ chuẩn là \"trân trọng kính mời\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trân trọng nghị",
    "correct": "trân trọng đề nghị",
    "description": "Có thể thiếu chữ \"đề\": cụm từ chuẩn là \"trân trọng đề nghị\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trân trọng ơn",
    "correct": "trân trọng cảm ơn",
    "description": "Có thể thiếu chữ \"cảm\": cụm từ chuẩn là \"trân trọng cảm ơn\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trân đề nghị",
    "correct": "trân trọng đề nghị",
    "description": "Có thể thiếu chữ \"trọng\": cụm từ chuẩn là \"trân trọng đề nghị\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trích yếu dung",
    "correct": "trích yếu nội dung",
    "description": "Có thể thiếu chữ \"nội\": cụm từ chuẩn là \"trích yếu nội dung\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trật an toàn xã hội",
    "correct": "trật tự an toàn xã hội",
    "description": "Có thể thiếu chữ \"tự\": cụm từ chuẩn là \"trật tự an toàn xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trật tự an toàn hội",
    "correct": "trật tự an toàn xã hội",
    "description": "Có thể thiếu chữ \"xã\": cụm từ chuẩn là \"trật tự an toàn xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "trật tự an xã hội",
    "correct": "trật tự an toàn xã hội",
    "description": "Có thể thiếu chữ \"toàn\": cụm từ chuẩn là \"trật tự an toàn xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tên cơ ban hành",
    "correct": "tên cơ quan ban hành",
    "description": "Có thể thiếu chữ \"quan\": cụm từ chuẩn là \"tên cơ quan ban hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tên quan ban hành",
    "correct": "tên cơ quan ban hành",
    "description": "Có thể thiếu chữ \"cơ\": cụm từ chuẩn là \"tên cơ quan ban hành\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tìm cứu nạn",
    "correct": "tìm kiếm cứu nạn",
    "description": "Có thể thiếu chữ \"kiếm\": cụm từ chuẩn là \"tìm kiếm cứu nạn\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tòa nhân dân",
    "correct": "tòa án nhân dân",
    "description": "Có thể thiếu chữ \"án\": cụm từ chuẩn là \"tòa án nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "toà nhân dân",
    "correct": "toà án nhân dân",
    "description": "Có thể thiếu chữ \"án\": cụm từ chuẩn là \"toà án nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tòa án nhân",
    "correct": "tòa án nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"tòa án nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "toà án nhân",
    "correct": "toà án nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"toà án nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "tổ chức trị xã hội",
    "correct": "tổ chức chính trị xã hội",
    "description": "Có thể thiếu chữ \"chính\": cụm từ chuẩn là \"tổ chức chính trị xã hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "viện kiểm nhân dân",
    "correct": "viện kiểm sát nhân dân",
    "description": "Có thể thiếu chữ \"sát\": cụm từ chuẩn là \"viện kiểm sát nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "viện kiểm sát nhân",
    "correct": "viện kiểm sát nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"viện kiểm sát nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "viện sát nhân dân",
    "correct": "viện kiểm sát nhân dân",
    "description": "Có thể thiếu chữ \"kiểm\": cụm từ chuẩn là \"viện kiểm sát nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn bản phạm pháp luật",
    "correct": "văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"quy\": cụm từ chuẩn là \"văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn bản quy pháp luật",
    "correct": "văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"phạm\": cụm từ chuẩn là \"văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn bản quy phạm pháp",
    "correct": "văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"luật\": cụm từ chuẩn là \"văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn phòng uỷ nhân dân",
    "correct": "văn phòng uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"văn phòng uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn phòng ủy nhân dân",
    "correct": "văn phòng ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"văn phòng ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn quy phạm pháp luật",
    "correct": "văn bản quy phạm pháp luật",
    "description": "Có thể thiếu chữ \"bản\": cụm từ chuẩn là \"văn bản quy phạm pháp luật\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn ủy ban nhân dân",
    "correct": "văn phòng ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"phòng\": cụm từ chuẩn là \"văn phòng ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "văn uỷ ban nhân dân",
    "correct": "văn phòng uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"phòng\": cụm từ chuẩn là \"văn phòng uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "xét nghị của",
    "correct": "xét đề nghị của",
    "description": "Có thể thiếu chữ \"đề\": cụm từ chuẩn là \"xét đề nghị của\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ý thẩm định",
    "correct": "ý kiến thẩm định",
    "description": "Có thể thiếu chữ \"kiến\": cụm từ chuẩn là \"ý kiến thẩm định\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đoàn niên cộng sản hồ chí minh",
    "correct": "đoàn thanh niên cộng sản hồ chí minh",
    "description": "Có thể thiếu chữ \"thanh\": cụm từ chuẩn là \"đoàn thanh niên cộng sản hồ chí minh\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đoàn thanh cộng sản hồ chí minh",
    "correct": "đoàn thanh niên cộng sản hồ chí minh",
    "description": "Có thể thiếu chữ \"niên\": cụm từ chuẩn là \"đoàn thanh niên cộng sản hồ chí minh\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đoàn thanh niên cộng sản hồ chí",
    "correct": "đoàn thanh niên cộng sản hồ chí minh",
    "description": "Có thể thiếu chữ \"minh\": cụm từ chuẩn là \"đoàn thanh niên cộng sản hồ chí minh\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đoàn viên niên",
    "correct": "đoàn viên thanh niên",
    "description": "Có thể thiếu chữ \"thanh\": cụm từ chuẩn là \"đoàn viên thanh niên\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đơn sự nghiệp công lập",
    "correct": "đơn vị sự nghiệp công lập",
    "description": "Có thể thiếu chữ \"vị\": cụm từ chuẩn là \"đơn vị sự nghiệp công lập\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đơn vị nghiệp công lập",
    "correct": "đơn vị sự nghiệp công lập",
    "description": "Có thể thiếu chữ \"sự\": cụm từ chuẩn là \"đơn vị sự nghiệp công lập\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "đơn vị sự nghiệp lập",
    "correct": "đơn vị sự nghiệp công lập",
    "description": "Có thể thiếu chữ \"công\": cụm từ chuẩn là \"đơn vị sự nghiệp công lập\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "độc lập do hạnh phúc",
    "correct": "độc lập tự do hạnh phúc",
    "description": "Có thể thiếu chữ \"tự\": cụm từ chuẩn là \"độc lập tự do hạnh phúc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "độc lập tự do hạnh",
    "correct": "độc lập tự do hạnh phúc",
    "description": "Có thể thiếu chữ \"phúc\": cụm từ chuẩn là \"độc lập tự do hạnh phúc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "độc lập tự do phúc",
    "correct": "độc lập tự do hạnh phúc",
    "description": "Có thể thiếu chữ \"hạnh\": cụm từ chuẩn là \"độc lập tự do hạnh phúc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "độc lập tự hạnh phúc",
    "correct": "độc lập tự do hạnh phúc",
    "description": "Có thể thiếu chữ \"do\": cụm từ chuẩn là \"độc lập tự do hạnh phúc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "độc tự do hạnh phúc",
    "correct": "độc lập tự do hạnh phúc",
    "description": "Có thể thiếu chữ \"lập\": cụm từ chuẩn là \"độc lập tự do hạnh phúc\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "uỷ ban nhân",
    "correct": "uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ủy ban nhân",
    "correct": "ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"dân\": cụm từ chuẩn là \"ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ủy ban thường quốc hội",
    "correct": "ủy ban thường vụ quốc hội",
    "description": "Có thể thiếu chữ \"vụ\": cụm từ chuẩn là \"ủy ban thường vụ quốc hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "uỷ ban thường quốc hội",
    "correct": "uỷ ban thường vụ quốc hội",
    "description": "Có thể thiếu chữ \"vụ\": cụm từ chuẩn là \"uỷ ban thường vụ quốc hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ủy ban vụ quốc hội",
    "correct": "ủy ban thường vụ quốc hội",
    "description": "Có thể thiếu chữ \"thường\": cụm từ chuẩn là \"ủy ban thường vụ quốc hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "uỷ ban vụ quốc hội",
    "correct": "uỷ ban thường vụ quốc hội",
    "description": "Có thể thiếu chữ \"thường\": cụm từ chuẩn là \"uỷ ban thường vụ quốc hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "uỷ nhân dân",
    "correct": "uỷ ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"uỷ ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ủy nhân dân",
    "correct": "ủy ban nhân dân",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"ủy ban nhân dân\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "uỷ thường vụ quốc hội",
    "correct": "uỷ ban thường vụ quốc hội",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"uỷ ban thường vụ quốc hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "ủy thường vụ quốc hội",
    "correct": "ủy ban thường vụ quốc hội",
    "description": "Có thể thiếu chữ \"ban\": cụm từ chuẩn là \"ủy ban thường vụ quốc hội\".",
    "category": "missing_word",
    "severity": "warning",
    "example": ""
  },
  {
    "wrong": "quyết đinh",
    "correct": "quyết định",
    "description": "Gõ thiếu dấu nặng: 'đinh' là từ có nghĩa riêng (cái đinh), nên chỉ phát hiện được theo cụm. Dạng đúng là 'quyết định'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Ủy ban nhân dân tỉnh đã ban hành quyết định về việc này."
  },
  {
    "wrong": "chiến quyền",
    "correct": "chiếm quyền",
    "description": "Có thể gõ nhầm 'chiếm quyền' (giành lấy quyền điều khiển, quyền quản trị) thành 'chiến quyền'.",
    "category": "spelling",
    "severity": "warning",
    "example": "Đúng: Đối tượng chiếm quyền quản trị tài khoản mạng xã hội của người khác."
  },
  {
    "wrong": "bàng giao",
    "correct": "bàn giao",
    "description": "Từ ngữ chuẩn mực trong văn bản hành chính là 'bàn giao' (chuyển giao công việc, tài sản).",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Tổ chức lễ bàn giao nhiệm vụ và tài sản công."
  },
  {
    "wrong": "dành quyền",
    "correct": "giành quyền",
    "description": "Dùng 'giành quyền' (tranh thủ, đạt được quyền lợi/quyền hạn bằng nỗ lực), không viết 'dành quyền'.",
    "category": "spelling",
    "severity": "error",
    "example": "Đúng: Giành quyền chủ động trong chỉ đạo, điều hành."
  }
];
