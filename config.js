/**
 * ============================================================================
 * CẤU HÌNH THIỆP MỜI LỄ TỐT NGHIỆP (GRADUATION INVITATION CONFIG)
 * ============================================================================
 * Bạn chỉ cần chỉnh sửa các thông tin trong file này để cập nhật toàn bộ
 * nội dung website (tên, ngày giờ, địa điểm, ảnh kỷ niệm, liên hệ, nhạc nền,
 * hoặc kết nối Google Sheets / Firebase) mà không cần sửa code HTML/JS.
 */

window.INVITATION_CONFIG = {
  // 1. THÔNG TIN NHÂN VẬT CHÍNH
  graduate: {
    fullName: "Lê Thị Hiền Anh",
    shortName: "Hiền Anh",
    monogram: "HA",
    // Bảng tuần hoàn ghép tên nhân vật chính (Click vào từng ô sẽ mở Popup giải mã)
    periodicHint: "✨ Chạm vào từng nguyên tố nhé!",
    periodicTiles: [
      {
        atomicNumber: "29",
        mass: "6.94",
        symbol: "Lê",
        elementName: "Lithium",
        realElement: "Lithium (Li)",
        electronConfig: "[He] 2s¹",
        category: "Kim loại kiềm · Nguồn năng lượng bền bỉ",
        accent: "navy",
        chemicalProperty:
          "Lithium là kim loại nhẹ nhất trong Bảng tuần hoàn nhưng sở hữu mật độ tích trữ năng lượng cực cao — là 'trái tim' của các viên pin hiện đại và luôn cháy với ngọn lửa đỏ hồng rực rỡ.",
        personalityTrait:
          "Giống như Lithium nhỏ nhắn mà tràn đầy năng lượng, Hiền Anh luôn mang nguồn năng lượng tích cực, bền bỉ vượt qua hàng trăm giờ thí nghiệm và những mùa đồ án căng thẳng tại Bách Khoa mà chưa bao giờ 'cạn pin'.",
      },
      {
        atomicNumber: "90",
        mass: "232.0",
        symbol: "Thị",
        elementName: "Thorium",
        realElement: "Thorium (Th)",
        electronConfig: "[Rn] 6d² 7s²",
        category: "Họ Actini · Nội lực mạnh mẽ & Bền nhiệt",
        accent: "cyan",
        chemicalProperty:
          "Đặt theo tên thần Sấm Thor, Thorium có điểm nóng chảy cực cao (1750°C), khó bị oxy hóa và ẩn chứa nguồn năng lượng khổng lồ bên trong vẻ ngoài ánh bạc điềm tĩnh.",
        personalityTrait:
          "Nhìn vẻ ngoài dịu dàng, điềm đạm nhưng bên trong là tinh thần 'chịu nhiệt' siêu hạng của dân Kỹ thuật Hóa học — càng gặp áp lực deadline hay phản ứng khó nhằn lại càng bản lĩnh và vững vàng.",
      },
      {
        atomicNumber: "01",
        mass: "1.008",
        symbol: "Hiền",
        elementName: "Hydrogen",
        realElement: "Hydrogen (H)",
        electronConfig: "1s¹",
        category: "Nguyên tố khởi nguồn · Cầu nối liên kết",
        accent: "gold",
        chemicalProperty:
          "Là nguyên tố đầu tiên và phổ biến nhất vũ trụ, Hydrogen tạo nên cầu nối 'liên kết hydro' bền chặt trong phân tử nước (H₂O) và hầu hết các hợp chất hữu cơ của sự sống.",
        personalityTrait:
          "Đúng như tên gọi 'Hiền', luôn ấm áp, chân thành và là 'liên kết hydro' gắn kết gia đình, thầy cô cùng hội bạn thân Lab Hóa Bách Khoa suốt những năm tháng thanh xuân tươi đẹp.",
      },
      {
        atomicNumber: "79",
        mass: "197.0",
        symbol: "Anh",
        elementName: "Aurum",
        realElement: "Aurum – Vàng (Au)",
        electronConfig: "[Xe] 4f¹⁴ 5d¹⁰ 6s¹",
        category: "Kim loại quý · Tinh khiết & Tỏa sáng",
        accent: "navy",
        chemicalProperty:
          "Aurum (Vàng) là kim loại quý hiếm, không bị oxy hóa hay phai màu theo thời gian, dẫn nhiệt – dẫn điện xuất sắc và giữ nguyên vẻ lấp lánh sau mọi quá trình tinh luyện.",
        personalityTrait:
          "'Lửa thử vàng, gian nan thử sức' — những năm tháng rèn giũa tại Khoa Kỹ thuật Hóa học HCMUT chính là quá trình tinh luyện để hôm nay Tân Kỹ sư Hiền Anh tự tin tỏa sáng rực rỡ trên hành trình mới.",
      },
    ],
    headline: "Thư Mời Lễ Tốt Nghiệp",
    degreeTitle: "Tân Kỹ sư Kỹ thuật Hóa học – HCMUT",
    university: "Trường Đại học Bách Khoa – ĐHQG TP.HCM",
    universityShort: "HCMUT",
    // Logo chính thức Trường ĐH Bách Khoa TP.HCM & ĐHQG TP.HCM
    schoolLogoUrl: "./assets/hcmut-logo.png",
    vnuLogoUrl: "./assets/vnuhcm-logo.png",
    faculty: "Khoa Kỹ thuật Hóa học",
    facultyEn: "Faculty of Chemical Engineering",
    invitationNote:
      "Sau những năm tháng miệt mài bên giảng đường, phòng thí nghiệm và những đồ án thức trắng đêm tại mái trường Bách Khoa, cuối cùng hành trình thanh xuân rực rỡ này cũng chạm đến cột mốc tốt nghiệp. Sự hiện diện của gia đình, thầy cô và bạn bè chính là món quà ý nghĩa nhất dành cho Hiền Anh trong ngày trọng đại này.",
  },

  // 2. THÔNG TIN SỰ KIỆN & ĐẾM NGƯỢC
  event: {
    // Định dạng ISO 8601 có múi giờ +07:00 để đồng hồ đếm ngược luôn chính xác
    startISO: "2026-11-29T09:00:00+07:00",
    endISO: "2026-11-29T12:00:00+07:00",
    dayOfWeek: "Chủ Nhật",
    dateDisplay: "29 / 11 / 2026",
    dateText: "Chủ Nhật, ngày 29/11/2026",
    timeRange: "09:00 sáng – 12:00 trưa",
    venueName: "Tòa B2 – Khoa Kỹ thuật Hóa học",
    venueAddress: "Cổng 1, 268 Lý Thường Kiệt, P.14, Q.10, TP.HCM",
    fullAddress:
      "Tòa B2 Khoa Kỹ thuật Hóa học, Cổng 1, 268 Lý Thường Kiệt, P.14, Q.10, TP.HCM",
    googleMapsUrl:
      "https://www.google.com/maps/search/?api=1&query=268+L%C3%BD+Th%C6%B0%E1%BB%9Dng+Ki%E1%BB%87t,+Ph%C6%B0%E1%BB%9Dng+14,+Qu%E1%BA%ADn+10,+TP.HCM",
    parkingNote:
      "Quý khách đi xe máy hoặc ô tô vui lòng vào qua Cổng 1 (268 Lý Thường Kiệt) và gửi xe tại khu vực bãi giữ xe trong khuôn viên trường, sau đó di chuyển về phía Tòa B2 – Khoa Kỹ thuật Hóa học.",
  },

  // 3. HÀNH TRÌNH BÁCH KHOA (PHOTO GALLERY)
  // Thay đổi đường dẫn `src` thành ảnh thật của bạn (ví dụ: "./assets/gallery/anh-1.jpg")
  gallery: [
    {
      src: "./assets/gallery/lab-experiment.svg",
      alt: "Phòng thí nghiệm Kỹ thuật Hóa học",
      tag: "Phòng Lab B2",
      caption: "Những buổi chiều miệt mài chuẩn độ và thí nghiệm tại Khoa Hóa.",
      aspect: "tall",
    },
    {
      src: "./assets/gallery/campus-morning.svg",
      alt: "Nắng sớm sân trường Bách Khoa",
      tag: "268 Lý Thường Kiệt",
      caption: "Ánh nắng sớm quen thuộc trên sân trường Bách Khoa mỗi sáng lên lớp.",
      aspect: "square",
    },
    {
      src: "./assets/gallery/thesis-desk.svg",
      alt: "Bàn làm đồ án tốt nghiệp",
      tag: "Đồ án Tốt nghiệp",
      caption: "Ly cà phê sữa đá, những bản vẽ công thức và đêm trắng chạy deadline đồ án.",
      aspect: "square",
    },
    {
      src: "./assets/gallery/graduation-cap.svg",
      alt: "Mũ cử nhân và bằng tốt nghiệp",
      tag: "Cột mốc 2026",
      caption: "Tự hào khoác lên màu áo xanh Bách Khoa trong ngày hái quả ngọt.",
      aspect: "tall",
    },
    {
      src: "./assets/gallery/friends-celebration.svg",
      alt: "Tung mũ tốt nghiệp cùng bạn bè",
      tag: "Thanh xuân rực rỡ",
      caption: "Cảm ơn những người bạn đã cùng nhau đi qua trọn vẹn tuổi trẻ đại học.",
      aspect: "wide",
    },
    {
      src: "./assets/gallery/bouquet-diploma.svg",
      alt: "Hoa hướng dương ngày tốt nghiệp",
      tag: "Khởi đầu mới",
      caption: "Khép lại một chương thật đẹp để sẵn sàng cho những chân trời mới.",
      aspect: "square",
    },
  ],

  // 5. THÔNG TIN LIÊN HỆ NHANH
  contact: {
    phone: "0886691104",
    phoneDisplay: "0886 691 104",
    zaloUrl: "https://zalo.me/0886691104",
    facebookUrl: "https://www.facebook.com/hienanh911",
    facebookHandle: "fb.com/hienanh911",
  },

  // 5. NHẠC NỀN ("Nụ Cười 18 20 – Doãn Hiếu")
  // Mặc định tích hợp sẵn giai điệu Piano Ballad "Nụ Cười 18 20" chạy trực tiếp không cần file ngoài.
  // Nếu bạn muốn phát bản MP3 có lời hát, chỉ cần chép file vào `assets/music/nu-cuoi-18-20.mp3`
  // rồi điền `mp3Url: "./assets/music/nu-cuoi-18-20.mp3"`.
  music: {
    mp3Url: "./assets/music/nu-cuoi-18-20.mp3",
    volume: 0.42,
    title: "Nụ Cười 18 20",
  },

  // 6. CẤU HÌNH SỔ LƯU BÚT & XÁC NHẬN THAM DỰ (RSVP)
  rsvp: {
    storageKey: "hcmut_graduation_rsvp_hienanh_2026",
    // Chế độ lưu trữ:
    // - 'auto'          : Tự động lưu thật qua /api/wishes (khi chạy server.ps1) hoặc localStorage
    // - 'google-sheets' : Đồng bộ 2 chiều (đọc & ghi) với Google Sheets qua file google-apps-script.gs
    // - 'firebase'      : Đồng bộ 2 chiều qua Firebase Realtime Database REST URL
    backendMode: "google-sheets",
    // Dán URL Web App từ Google Apps Script vào đây (xem hướng dẫn trong google-apps-script.gs)
    googleSheetsWebhookUrl: "https://script.google.com/macros/s/AKfycbwdpYbuI1Dq27GrNKSQHa50FQ9ByNehWE8WV5RFaIdyBYO5b6axYpCPVvxPWVO0e0z1dg/exec",
    // Hoặc dán URL Firebase Realtime Database (VD: "https://your-app-default-rtdb.asia-southeast1.firebasedatabase.app")
    firebaseDatabaseUrl: "",
    // Lời chúc mẫu hiển thị ban đầu để sổ lưu bút thêm ấm áp
    seedWishes: [
      {
        id: "seed-1",
        name: "Gia đình nhỏ",
        relationship: "Gia đình",
        attendance: "attending",
        message:
          "Chúc mừng con gái yêu đã hoàn thành xuất sắc chặng đường đại học tại Bách Khoa! Cả nhà rất tự hào về Tân Kỹ sư Hiền Anh.",
        likes: 3,
        createdAt: "2026-11-22T08:30:00+07:00",
      },
      {
        id: "seed-2",
        name: "Hội bạn thân Lab Hóa",
        relationship: "Bạn bè",
        attendance: "attending",
        message:
          "Nhất định có mặt từ 9h sáng ở Tòa B2 để chụp 1001 tấm ảnh! Chúc Hiền Anh luôn tỏa sáng trên con đường phía trước nhé!",
        likes: 2,
        createdAt: "2026-11-23T14:15:00+07:00",
      },
    ],
  },
};
