export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
}

export interface JourneyStep {
  step: string;
  title: string;
  period: string;
  description: string;
  iconName: string;
}

export const graduationConfig = {
  name: "Danh Phương Nhã",
  major: "Công nghệ thông tin",
  classCode: "DH22DTB",
  university: "Trường Đại Học Nông Lâm TP.HCM",
  faculty: "Khoa Công Nghệ Thông Tin",
  year: "2026",
  period: "2022 – 2026",
  subTitle: "With gratitude, pride & a new beginning.",
  
  // Hình ảnh cá nhân & Logo trường
  avatarUrl: "/images/graduation/Avatar.jpg",
  universityLogoUrl: "/images/graduation/Logo-Dai-Hoc-Nong-Lam-HCM-HCMUAF.webp",

  // Thông tin liên hệ
  phone: "0332 600 543",
  email: "danhphnha@gmail.com",
  mottoQuote: "The future belongs to those who believe in the beauty of their dreams.",

  // Endpoint Google Sheets gửi dữ liệu RSVP, Lượt xem & Danh sách khách mời
  googleScriptUrl: "https://script.google.com/macros/s/AKfycbzLnIdJdxJnvsYjOn2zTeRIDXb68My9vHVHTP2_JZ_kfKApb00j1jYRhBOFJr7dcDFAQw/exec",

  // Cấu hình Cloudinary tải ảnh kỷ niệm trực tiếp từ khách
  cloudinaryCloudName: "ddrqfuaji",
  cloudinaryUploadPreset: "graduation_guest",

  // Thông tin ngày lễ
  date: "Thứ Tư, Ngày 21 Tháng 10 Năm 2026",
  time: "08:00 - 11:30 AM",
  venue: "Hội trường Phượng Vĩ P100 — Trường ĐH Nông Lâm TP.HCM",
  address: "Khu Phố 6, P. Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh",
  mapUrl: "https://maps.google.com/?q=Hoi+truong+Phuong+Vi+Truong+Dai+Hoc+Nong+Lam+TP.HCM",

  // Ngày đếm ngược (ISO format YYYY-MM-DDTHH:mm:ss)
  graduationDate: "2026-10-21T08:00:00",

  // Lời mời & Thông điệp
  invitationTitle: "THÂN MỜI",
  invitationMessage: "Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).\n\nVới tất cả niềm vui và sự biết ơn, Nhã thân mời gia đình, bạn bè và những người thân yêu đến chung vui trong ngày đặc biệt này.",
  
  thankYouMessage: "Sự đồng hành, dạy bảo của Thầy Cô, tình yêu thương của Cha Mẹ cùng sự sẻ chia của bạn bè là hành trang quý giá nhất trên con đường học tập và trưởng thành của Nhã.",

  // Hành trình học tập (Timeline)
  journey: [
    {
      step: "01",
      title: "START — Khởi Đầu",
      period: "2022",
      description: "Đặt những bước chân đầu tiên vào khoa Công nghệ thông tin (Lớp DH22DTB) Trường ĐH Nông Lâm TP.HCM.",
      iconName: "Compass",
    },
    {
      step: "02",
      title: "LEARN — Tích Lũy",
      period: "2023 - 2024",
      description: "Thức trắng cùng những dòng code, vượt qua thử thách đồ án và tích lũy kiến thức chuyên môn IT.",
      iconName: "Code",
    },
    {
      step: "03",
      title: "GROW — Trưởng Thành",
      period: "2024 - 2025",
      description: "Thực tập thực tế, mài dũa kỹ năng phần mềm, định hình bản thân và hoàn thành chương trình học.",
      iconName: "Sprout",
    },
    {
      step: "04",
      title: "GRADUATE — Về Đích",
      period: "2026",
      description: "Chính thức nhận tấm bằng kỹ sư IT. Khép lại 4 năm đại học và mở ra chương mới rực rỡ.",
      iconName: "GraduationCap",
    },
  ] as JourneyStep[],

  // Bộ sưu tập khoảnh khắc (Moments Gallery - do khách mời tải lên hoặc nạp từ Cloud)
  gallery: [] as GalleryItem[],

  // Âm nhạc
  audioUrl: "/audio/invitation-bg.mp3",
};
