export type Language = "vi" | "en" | "km";

/**
 * Tự động chuyển đổi thời gian linh hoạt đa ngôn ngữ (VI, EN, KM)
 * Ví dụ: "09:30 - 11:30 sáng" -> EN: "09:30 - 11:30 AM", KM: "09:30 - 11:30 ព្រឹក"
 */
export function formatLocalizedTime(timeStr?: string, lang: Language = "vi"): string {
  if (!timeStr) return "";
  const trimmed = timeStr.trim();

  const isMorning = /sáng|sang|am|morning|ព្រឹក/i.test(trimmed);
  const isAfternoon = /chiều|chieu|pm|afternoon|រសៀល/i.test(trimmed);
  const isEvening = /tối|toi|evening|night|យប់/i.test(trimmed);
  const isNoon = /trưa|trua|noon/i.test(trimmed);

  if (!isMorning && !isAfternoon && !isEvening && !isNoon) {
    return trimmed;
  }

  const cleaned = trimmed
    .replace(/(sáng|sang|am|pm|chiều|chieu|tối|toi|trưa|trua|morning|afternoon|evening|ព្រឹក|រសៀល|យប់)/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  if (lang === "vi") {
    if (isMorning) return `${cleaned} sáng`;
    if (isAfternoon) return `${cleaned} chiều`;
    if (isEvening) return `${cleaned} tối`;
    if (isNoon) return `${cleaned} trưa`;
    return trimmed;
  }

  if (lang === "en") {
    if (isMorning) return `${cleaned} AM`;
    if (isAfternoon || isEvening || isNoon) return `${cleaned} PM`;
    return trimmed;
  }

  if (lang === "km") {
    if (isMorning) return `${cleaned} ព្រឹក`;
    if (isAfternoon) return `${cleaned} រសៀល`;
    if (isEvening) return `${cleaned} យប់`;
    if (isNoon) return `${cleaned} ថ្ងៃត្រង់`;
    return trimmed;
  }

  return trimmed;
}

const KM_DIGITS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];
const toKhmerNumber = (num: number | string): string =>
  String(num).split("").map((c) => (c >= "0" && c <= "9" ? KM_DIGITS[Number(c)] : c)).join("");

const DAYS_OF_WEEK = {
  vi: ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  km: ["ថ្ងៃអាទិត្យ", "ថ្ងៃច័ន្ទ", "ថ្ងៃអង្គារ", "ថ្ងៃពុធ", "ថ្ងៃព្រហស្បតិ៍", "ថ្ងៃសុក្រ", "ថ្ងៃសៅរ៍"],
};

const EN_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const KM_MONTHS = [
  "មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា",
  "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"
];

/**
 * Tự động chuyển đổi ngày tháng năm linh hoạt đa ngôn ngữ (VI, EN, KM)
 * Hỗ trợ các định dạng: 21/10/2026, 2026-10-21, 21-10-2026
 */
export function formatLocalizedDate(dateStr?: string, lang: Language = "vi"): string {
  if (!dateStr) return "";
  const trimmed = dateStr.trim();

  let d = 0, m = 0, y = 0;

  // Format DD/MM/YYYY or DD-MM-YYYY
  const matchDMY = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  // Format YYYY-MM-DD
  const matchYMD = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  // Format DD/MM
  const matchDM = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})$/);

  if (matchDMY) {
    d = parseInt(matchDMY[1], 10);
    m = parseInt(matchDMY[2], 10);
    y = parseInt(matchDMY[3], 10);
  } else if (matchYMD) {
    y = parseInt(matchYMD[1], 10);
    m = parseInt(matchYMD[2], 10);
    d = parseInt(matchYMD[3], 10);
  } else if (matchDM) {
    d = parseInt(matchDM[1], 10);
    m = parseInt(matchDM[2], 10);
    y = 2026;
  }

  if (d > 0 && m >= 1 && m <= 12 && y > 0) {
    const dateObj = new Date(y, m - 1, d);
    const dayOfWeekIdx = dateObj.getDay();

    if (lang === "vi") {
      const dayName = DAYS_OF_WEEK.vi[dayOfWeekIdx];
      return `${dayName}, Ngày ${d} Tháng ${m} Năm ${y}`;
    }

    if (lang === "en") {
      const dayName = DAYS_OF_WEEK.en[dayOfWeekIdx];
      const monthName = EN_MONTHS[m - 1];
      return `${dayName}, ${monthName} ${d}, ${y}`;
    }

    if (lang === "km") {
      const dayName = DAYS_OF_WEEK.km[dayOfWeekIdx];
      const monthName = KM_MONTHS[m - 1];
      return `${dayName} ទី${toKhmerNumber(d)} ខែ${monthName} ឆ្នាំ${toKhmerNumber(y)}`;
    }
  }

  return trimmed;
}

export interface TranslationSchema {
  nav: {
    home: string;
    invitation: string;
    details: string;
    gallery: string;
    rsvp: string;
  };
  hero: {
    invitationCard: string;
    ceremony: string;
    degree: string;
    major: string;
    subTitle: string;
    openBtn: string;
    swipeDown: string;
  };
  invitation: {
    title: string;
    guestEyebrow: string;
    defaultGuest: string;
    para1: string;
    para2: string;
  };
  details: {
    eyebrow: string;
    title: string;
    graduate: string;
    major: string;
    date: string;
    time: string;
    venue: string;
    dateVal: string;
    timeVal: string;
    venueVal: string;
    addressVal: string;
    copy: string;
    copied: string;
  };
  countdown: {
    eyebrow: string;
    title: string;
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  journey: {
    eyebrow: string;
    title: string;
    stepPrefix: string;
    steps: Array<{
      step: string;
      title: string;
      period: string;
      description: string;
      iconName: string;
    }>;
  };
  greetings: {
    elder: string;
    senior: string;
    junior: string;
    friend: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    allTab: string;
    uploadBtn: string;
    uploadModalTitle: string;
    uploadModalDesc: string;
    uploadNameLabel: string;
    uploadCaptionLabel: string;
    uploadCaptionPlaceholder: string;
    uploadCategoryLabel: string;
    uploadCustomCategoryPlaceholder: string;
    uploadOtherCategoryBtn: string;
    uploadSourceFileTab: string;
    uploadSourceUrlTab: string;
    uploadUrlPlaceholder: string;
    uploadSelectFile: string;
    uploadChangeFile: string;
    uploadSubmitBtn: string;
    uploadingBtn: string;
    uploadSuccessTitle: string;
    uploadSuccessDesc: string;
    uploadRestrictedTitle: string;
    uploadRestrictedDesc: string;
    emptyText: string;
    paginationPage: string;
    paginationOf: string;
    paginationPhotos: string;
    paginationPrev: string;
    paginationNext: string;
    items: Array<{
      id: string;
      title: string;
      category: string;
      src: string;
      alt: string;
    }>;
  };
  location: {
    eyebrow: string;
    title: string;
    viewMap: string;
  };
  rsvp: {
    eyebrow: string;
    title: string;
    subtitle: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    attendLabel: string;
    attendYes: string;
    attendNo: string;
    guestLabel: string;
    guestUnit: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitBtn: string;
    submittingBtn: string;
    successTitle: string;
    successDesc: string;
    resetBtn: string;
  };
  closing: {
    thankYou: string;
    message: string;
    classLabel: string;
    periodLabel: string;
    motto: string;
    madeWith: string;
  };
}

export const translations: Record<Language, TranslationSchema> = {
  vi: {
    nav: {
      home: "Trang chủ",
      invitation: "Lời mời",
      details: "Chi tiết",
      gallery: "Khoảnh khắc",
      rsvp: "Tham dự",
    },
    hero: {
      invitationCard: "THIỆP MỜI TỐT NGHIỆP",
      ceremony: "LỄ TỐT NGHIỆP",
      degree: "Kỹ sư",
      major: "Công nghệ thông tin — 2026",
      subTitle: "Tri ân, tự hào & chặng đường mới rực rỡ.",
      openBtn: "MỞ THIỆP",
      swipeDown: "Vuốt xuống",
    },
    invitation: {
      title: "THÂN MỜI",
      guestEyebrow: "THÂN MỜI",
      defaultGuest: "Quý Khách & Người Thân",
      para1: "Sau những năm tháng học tập, nỗ lực và trưởng thành tại Trường Đại học Nông Lâm TP.HCM, Danh Phương Nhã đã chính thức hoàn thành hành trình đại học ngành Công nghệ thông tin (Lớp DH22DTB).",
      para2: "Với tất cả niềm vui và sự biết ơn, Nhã thân mời gia đình, Thầy Cô, bạn bè và những người thân yêu đến chung vui trong ngày đặc biệt này.",
    },
    details: {
      eyebrow: "THÔNG TIN SỰ KIỆN",
      title: "NGÀY ĐẶC BIỆT",
      graduate: "TÂN KỸ SƯ",
      major: "CHUYÊN NGÀNH",
      date: "NGÀY LỄ",
      time: "THỜI GIAN",
      venue: "ĐỊA ĐIỂM",
      dateVal: "Thứ Tư, Ngày 21 Tháng 10 Năm 2026",
      timeVal: "08:00 - 11:30 sáng",
      venueVal: "Hội trường Phượng Vĩ P100 — Trường ĐH Nông Lâm TP.HCM",
      addressVal: "Khu Phố 6, P. Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh",
      copy: "Sao chép",
      copied: "Đã sao chép",
    },
    countdown: {
      eyebrow: "ĐẾM NGƯỢC THỜI GIAN",
      title: "ĐẾM NGƯỢC ĐẾN NGÀY LỄ TỐT NGHIỆP",
      days: "NGÀY",
      hours: "GIỜ",
      minutes: "PHÚT",
      seconds: "GIÂY",
    },
    journey: {
      eyebrow: "CỘT MỐC ĐÁNG NHỚ",
      title: "HÀNH TRÌNH TỐT NGHIỆP",
      stepPrefix: "BƯỚC",
      steps: [
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
          description: "Thức trắng cùng những dòng code, vượt qua các đồ án môn học và tích lũy kiến thức chuyên môn IT.",
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
          description: "Chính thức nhận tấm bằng Kỹ sư IT. Khép lại 4 năm đại học và mở ra chặng đường mới rực rỡ.",
          iconName: "GraduationCap",
        },
      ],
    },
    greetings: {
      elder: "Kính mời",
      senior: "Thân ái mời",
      junior: "Mời",
      friend: "Thân mời",
    },
    gallery: {
      eyebrow: "BỘ SƯU TẬP KỶ NIỆM",
      title: "KHOẢNH KHẮC ĐÁNG NHỚ",
      allTab: "Tất cả khoảnh khắc",
      uploadBtn: "Hãy tải ảnh bạn và Nhã đã chụp chung lên để kho kỷ niệm thêm nhiều ảnh ",
      uploadModalTitle: "Đóng Góp Ảnh Kỷ Niệm",
      uploadModalDesc: "Gửi tặng những bức ảnh kỷ niệm tuyệt đẹp giữa bạn và Nhã để lưu giữ mãi khoảnh khắc đáng nhớ này.",
      uploadNameLabel: "Tên của bạn",
      uploadCaptionLabel: "Lời nhắn / Kỷ niệm gắn liền với bức ảnh",
      uploadCaptionPlaceholder: "Kỷ niệm chuyến đi chơi, đồ án môn học, kỷ niệm sinh nhật...",
      uploadCategoryLabel: "Chủ đề ảnh",
      uploadCustomCategoryPlaceholder: "Nhập tên chủ đề riêng (VD: Hội bạn thân, Kỷ niệm cấp 3...)",
      uploadOtherCategoryBtn: "+ Khác / Tự nhập...",
      uploadSourceFileTab: "Tải tệp ảnh",
      uploadSourceUrlTab: "Dán link ảnh (URL)",
      uploadUrlPlaceholder: "Dán đường dẫn ảnh (https://...)",
      uploadSelectFile: "Bấm hoặc kéo thả ảnh vào đây (chọn nhiều ảnh cùng lúc)",
      uploadChangeFile: "Thêm ảnh khác",
      uploadSubmitBtn: "Tải Ảnh Lên Kho Kỷ Niệm",
      uploadingBtn: "Đang tải ảnh lên Cloud...",
      uploadSuccessTitle: "Tải Ảnh Thành Công! 🎉",
      uploadSuccessDesc: "Cảm ơn bạn rất nhiều! Các bức ảnh kỷ niệm đã được thêm vào bộ sưu tập của Nhã.",
      uploadRestrictedTitle: "Dành Riêng Cho Khách Mời",
      uploadRestrictedDesc: "Tính năng đóng góp ảnh kỷ niệm chỉ mở cho khách mời có tên trong danh sách của Nhã. Vui lòng mở thiệp bằng liên kết riêng mà Nhã đã gửi cho bạn nhé! 💌",
      emptyText: "Kho kỷ niệm đang chờ những bức ảnh đầu tiên! Hãy bấm nút 'Đóng Góp Ảnh' phía trên để cùng Nhã lưu giữ khoảnh khắc nhé ✨",
      paginationPage: "Trang",
      paginationOf: "trên",
      paginationPhotos: "bức ảnh kỷ niệm",
      paginationPrev: "Trang trước",
      paginationNext: "Trang sau",
      items: [],
    },
    location: {
      eyebrow: "ĐỊA ĐIỂM & BẢN ĐỒ",
      title: "HỘI TRƯỜNG PHƯỢNG VĨ P100",
      viewMap: "XEM BẢN ĐỒ GOOGLE MAPS",
    },
    rsvp: {
      eyebrow: "XÁC NHẬN THAM DỰ",
      title: "SỰ HIỆN DIỆN CỦA BẠN",
      subtitle: "Sự hiện diện của bạn là niềm vinh hạnh và khiến ngày đặc biệt này trở nên ý nghĩa hơn.",
      nameLabel: "Họ và Tên *",
      namePlaceholder: "Nhập họ và tên của bạn...",
      phoneLabel: "Số Điện Thoại",
      phonePlaceholder: "0xxx xxx xxx",
      attendLabel: "Bạn sẽ đến tham dự chứ? *",
      attendYes: "✓ Có, mình sẽ tham dự 🎓",
      attendNo: "✗ Rất tiếc, mình vắng mặt 💌",
      guestLabel: "Số người đi cùng",
      guestUnit: "người đi cùng",
      messageLabel: "Lời chúc & nhắn gửi",
      messagePlaceholder: "Gửi lời chúc mừng tốt nghiệp hoặc nhắn nhủ đôi lời...",
      submitBtn: "GỬI XÁC NHẬN",
      submittingBtn: "ĐANG GỬI XÁC NHẬN...",
      successTitle: "CẢM ƠN BẠN RẤT NHIỀU!",
      successDesc: "Nhã đã nhận được phản hồi của bạn. Rất mong được đón tiếp bạn tại buổi lễ tốt nghiệp! 🌿✨",
      resetBtn: "Gửi xác nhận khác",
    },
    closing: {
      thankYou: "CẢM ƠN BẠN RẤT NHIỀU",
      message: "Sự đồng hành, dạy bảo của Thầy Cô, tình yêu thương của Cha Mẹ cùng sự sẻ chia của bạn bè là hành trang quý giá nhất trên con đường học tập và trưởng thành của Nhã.",
      classLabel: "CÔNG NGHỆ THÔNG TIN • KHOÁ 2022 - 2026",
      periodLabel: "NIÊN KHÓA 2022 – 2026",
      motto: "Tương lai thuộc về những ai tin vào vẻ đẹp từ những giấc mơ của mình.",
      madeWith: "Được tạo với tất cả lòng biết ơn",
    },
  },
  en: {
    nav: {
      home: "Home",
      invitation: "Invitation",
      details: "Details",
      gallery: "Moments",
      rsvp: "RSVP",
    },
    hero: {
      invitationCard: "GRADUATION INVITATION",
      ceremony: "GRADUATION CEREMONY",
      degree: "Engineer",
      major: "Information Technology — 2026",
      subTitle: "With gratitude, pride & a new beginning.",
      openBtn: "OPEN INVITATION",
      swipeDown: "Scroll Down",
    },
    invitation: {
      title: "CORDIALLY INVITED",
      guestEyebrow: "CORDIALLY INVITED",
      defaultGuest: "Honored Guests & Friends",
      para1: "After years of dedication, effort, and personal growth at Nong Lam University Ho Chi Minh City, Danh Phuong Nha has officially completed the journey toward an Engineering Degree in Information Technology (Class DH22DTB).",
      para2: "With joy and deepest gratitude, Nha warmly invites family, mentors, and beloved friends to join in celebrating this special milestone.",
    },
    details: {
      eyebrow: "EVENT DETAILS",
      title: "THE BIG DAY",
      graduate: "GRADUATE",
      major: "MAJOR",
      date: "DATE",
      time: "TIME",
      venue: "VENUE",
      dateVal: "Wednesday, October 21, 2026",
      timeVal: "08:00 - 11:30 AM",
      venueVal: "Phuong Vi Hall P100 — Nong Lam University HCMC",
      addressVal: "Quarter 6, Linh Trung Ward, Thu Duc City, Ho Chi Minh City",
      copy: "Copy",
      copied: "Copied",
    },
    countdown: {
      eyebrow: "COUNTDOWN TO THE MOMENT",
      title: "COUNTDOWN TO GRADUATION DAY",
      days: "DAYS",
      hours: "HOURS",
      minutes: "MINUTES",
      seconds: "SECONDS",
    },
    journey: {
      eyebrow: "MILESTONES",
      title: "MY ACADEMIC JOURNEY",
      stepPrefix: "STEP",
      steps: [
        {
          step: "01",
          title: "START — The Beginning",
          period: "2022",
          description: "Stepping into the IT Faculty (Class DH22DTB) at Nong Lam University HCMC with passion & ambition.",
          iconName: "Compass",
        },
        {
          step: "02",
          title: "LEARN — Knowledge",
          period: "2023 - 2024",
          description: "Late nights of coding, overcoming complex software projects, and building core IT expertise.",
          iconName: "Code",
        },
        {
          step: "03",
          title: "GROW — Maturity",
          period: "2024 - 2025",
          description: "Hands-on internships, honing engineering skills, shaping career goals, and finishing academic program.",
          iconName: "Sprout",
        },
        {
          step: "04",
          title: "GRADUATE — Commencement",
          period: "2026",
          description: "Officially receiving the IT Engineering Degree. Closing 4 memorable years and stepping into the future.",
          iconName: "GraduationCap",
        },
      ],
    },
    greetings: {
      elder: "Respectfully Invited",
      senior: "Cordially Invited",
      junior: "Invited",
      friend: "Warmly Invited",
    },
    gallery: {
      eyebrow: "MEMORIES",
      title: "MEMORABLE MOMENTS",
      allTab: "All Moments",
      uploadBtn: "Upload photos of you and Nhã to enrich our memory album ",
      uploadModalTitle: "Contribute Memory Photos",
      uploadModalDesc: "Share your cherished photos with Nhã to preserve these unforgettable moments forever.",
      uploadNameLabel: "Your Name",
      uploadCaptionLabel: "Caption / Memory story",
      uploadCaptionPlaceholder: "Trip to the beach, year 3 project together...",
      uploadCategoryLabel: "Photo Category",
      uploadCustomCategoryPlaceholder: "Enter custom topic name (e.g. Best friends, Trip...)",
      uploadOtherCategoryBtn: "+ Other / Custom...",
      uploadSourceFileTab: "Upload File",
      uploadSourceUrlTab: "Paste Image URL",
      uploadUrlPlaceholder: "Paste image link (https://...)",
      uploadSelectFile: "Click or drag & drop a photo here to upload",
      uploadChangeFile: "Change Photo",
      uploadSubmitBtn: "Upload Photo to Album",
      uploadingBtn: "Uploading to Cloud...",
      uploadSuccessTitle: "Uploaded Successfully! 🎉",
      uploadSuccessDesc: "Thank you so much! Your memory photo has been added to Nhã's collection.",
      uploadRestrictedTitle: "Exclusive For Invited Guests",
      uploadRestrictedDesc: "Photo contribution is reserved for guests on Nhã's guest list. Please access the invitation using the personal link sent to you! 💌",
      emptyText: "The memory album is waiting for the first photos! Click 'Upload Photo' above to share your cherished memories with Nhã ✨",
      paginationPage: "Page",
      paginationOf: "of",
      paginationPhotos: "memory photos",
      paginationPrev: "Previous page",
      paginationNext: "Next page",
      items: [],
    },
    location: {
      eyebrow: "LOCATION & DIRECTIONS",
      title: "JOIN ME",
      viewMap: "VIEW MAP",
    },
    rsvp: {
      eyebrow: "RSVP CONFIRMATION",
      title: "YOUR PRESENCE MATTERS",
      subtitle: "Your presence will make this special day even more meaningful.",
      nameLabel: "Full Name *",
      namePlaceholder: "Enter your full name...",
      phoneLabel: "Phone Number",
      phonePlaceholder: "0xxx xxx xxx",
      attendLabel: "Will You Attend? *",
      attendYes: "✓ Yes, I will attend 🎓",
      attendNo: "✗ Regretfully absent 💌",
      guestLabel: "Accompanying Guests",
      guestUnit: "guest(s) with me",
      messageLabel: "Best Wishes & Notes",
      messagePlaceholder: "Send your congratulations or warm wishes...",
      submitBtn: "SUBMIT RSVP",
      submittingBtn: "SUBMITTING...",
      successTitle: "THANK YOU SO MUCH!",
      successDesc: "Nha has received your confirmation. Looking forward to welcoming you on Graduation Day! 🌿✨",
      resetBtn: "Submit another response",
    },
    closing: {
      thankYou: "THANK YOU SO MUCH",
      message: "The mentorship of teachers, the love of parents, and the companionship of friends are the most precious treasures on my journey of learning and growth.",
      classLabel: "INFORMATION TECHNOLOGY • CLASS OF 2026",
      periodLabel: "ACADEMIC YEARS 2022 – 2026",
      motto: "The future belongs to those who believe in the beauty of their dreams.",
      madeWith: "Made with heartfelt gratitude",
    },
  },
  km: {
    nav: {
      home: "ទំព័រដើម",
      invitation: "លិខិតអញ្ជើញ",
      details: "ព័ត៌មានលម្អិត",
      gallery: "អនុស្សាវរីយ៍",
      rsvp: "ការចូលរួម",
    },
    hero: {
      invitationCard: "លិខិតអញ្ជើញពិធីប្រគល់សញ្ញាបត្រ",
      ceremony: "ពិធីប្រគល់សញ្ញាបត្រ",
      degree: "វិស្វករ",
      major: "បច្ចេកវិទ្យាព័ត៌មាន — 2026",
      subTitle: "ដោយក្តីដឹងគុណ មោទនភាព និងការចាប់ផ្តើមថ្មី។",
      openBtn: "បើកលិខិតអញ្ជើញ",
      swipeDown: "អូសចុះក្រោម",
    },
    invitation: {
      title: "សូមគោរពអញ្ជើញ",
      guestEyebrow: "សូមគោរពអញ្ជើញ",
      defaultGuest: "ភ្ញៀវកិត្តិយស និងមិត្តភក្តិ",
      para1: "បន្ទាប់ពីការខិតខំប្រឹងប្រែងសិក្សា និងការលូតលាស់នៅសាកលវិទ្យាល័យកសិកម្ម និងរុក្ខាប្រមាញ់ទីក្រុងហូជីមិញ Danh Phuong Nha បានបញ្ចប់ការសិក្សាជាផ្លូវការថ្នាក់វិស្វករបច្ចេកវិទ្យាព័ត៌មាន (ថ្នាក់ DH22DTB)។",
      para2: "ដោយក្តីរីករាយ និងការដឹងគុណ ខ្ញុំបាទសូមគោរពអញ្ជើញ លោកអ្នកឧកញ៉ា លោក លោកស្រី លោកគ្រូ អ្នកគ្រូ មិត្តភក្តិ និងបងប្អូនទាំងអស់ មកចូលរួមអបអរសាទរក្នុងថ្ងៃដ៏ពិសេសនេះ។",
    },
    details: {
      eyebrow: "ព័ត៌មានលម្អិតព្រឹត្តិការណ៍",
      title: "ថ្ងៃពិសេស",
      graduate: "វិស្វករថ្មី",
      major: "ជំនាញ",
      date: "កាលបរិច្ឆេទ",
      time: "ពេលវេលា",
      venue: "ទីតាំង",
      dateVal: "ថ្ងៃពុធ ទី២១ ខែតុលា ឆ្នាំ២០២៦",
      timeVal: "០៨:០០ - ១១:៣០ ព្រឹក",
      venueVal: "សាលប្រជុំ Phuong Vi P100 — សាកលវិទ្យាល័យកសិកម្ម និងរុក្ខាប្រមាញ់ ទីក្រុងហូជីមិញ",
      addressVal: "ភូមិភាគ៦ សង្កាត់ Linh Trung ក្រុង Thu Duc ទីក្រុងហូជីមិញ",
      copy: "ចម្លង",
      copied: "បានចម្លង",
    },
    countdown: {
      eyebrow: "រាប់ថយក្រោយ",
      title: "រាប់ថយក្រោយដល់ថ្ងៃពិធីប្រគល់សញ្ញាបត្រ",
      days: "ថ្ងៃ",
      hours: "ម៉ោង",
      minutes: "នាទី",
      seconds: "វិនាទី",
    },
    journey: {
      eyebrow: "ដំណាក់កាលសំខាន់ៗ",
      title: "ដំណើរការសិក្សា",
      stepPrefix: "ជំហាន",
      steps: [
        {
          step: "01",
          title: "START — ចាប់ផ្តើម",
          period: "2022",
          description: "ឈានជើងដំបូងចូលរៀនជំនាញបច្ចេកវិទ្យាព័ត៌មាន (ថ្នាក់ DH22DTB) នៅសាកលវិទ្យាល័យកសិកម្ម និងរុក្ខាប្រមាញ់ ទីក្រុងហូជីមិញ។",
          iconName: "Compass",
        },
        {
          step: "02",
          title: "LEARN — សិក្សាស្រាវជ្រាវ",
          period: "2023 - 2024",
          description: "ខិតខំសរសេរកូដ ជំនះរាល់ការលំបាកក្នុងគម្រោងសិក្សា និងក្រេបយកចំណេះដឹងឯកទេស IT។",
          iconName: "Code",
        },
        {
          step: "03",
          title: "GROW — ការលូតលាស់",
          period: "2024 - 2025",
          description: "ចុះអនុវត្តការងារជាក់ស្តែង ពង្រឹងជំនាញបច្ចេកវិទ្យា និងបញ្ចប់កម្មវិធីសិក្សា។",
          iconName: "Sprout",
        },
        {
          step: "04",
          title: "GRADUATE — ជោគជ័យ",
          period: "2026",
          description: "ទទួលបានសញ្ញាបត្រវិស្វករ IT ជាផ្លូវការ។ បញ្ចប់ការសិក្សា ៤ ឆ្នាំ និងបើកទំព័រជីវិតថ្មីដ៏ត្រចះត្រចង់។",
          iconName: "GraduationCap",
        },
      ],
    },
    greetings: {
      elder: "សូមគោរពអញ្ជើញ",
      senior: "សូមអញ្ជើញដោយរាប់អាន",
      junior: "សូមអញ្ជើញ",
      friend: "សូមអញ្ជើញ",
    },
    gallery: {
      eyebrow: "កម្រងរូបភាព",
      title: "រូបភាពអនុស្សាវរីយ៍",
      allTab: "អនុស្សាវរីយ៍ទាំងអស់",
      uploadBtn: "សូមបង្ហោះរូបថតអ្នកនិង Nhã ដើម្បីឱ្យអាល់ប៊ុមអនុស្សាវរីយ៍កាន់តែមានតម្លៃ ",
      uploadModalTitle: "ចែករំលែករូបថតអនុស្សាវរីយ៍",
      uploadModalDesc: "ផ្ញើរូបថតដ៏ស្រស់ស្អាតរវាងអ្នក និង Nhã ដើម្បីរក្សាពេលវេលាដែលមិនអាចបំភ្លេចបាននេះ។",
      uploadNameLabel: "ឈ្មោះរបស់អ្នក",
      uploadCaptionLabel: "ចំណងជើង / រឿងរ៉ាវអនុស្សាវរីយ៍",
      uploadCaptionPlaceholder: "ដំណើរកម្សាន្ត, គម្រោងឆ្នាំទី៣...",
      uploadCategoryLabel: "ប្រភេទរូបថត",
      uploadCustomCategoryPlaceholder: "បញ្ចូលឈ្មោះប្រធានបទ (ឧ. មិត្តភក្តិ, អនុស្សាវរីយ៍...)",
      uploadOtherCategoryBtn: "+ ផ្សេងទៀត...",
      uploadSourceFileTab: "បង្ហោះឯកសារ",
      uploadSourceUrlTab: "បិទភ្ជាប់តំណ (URL)",
      uploadUrlPlaceholder: "បិទភ្ជាប់តំណរូបភាព (https://...)",
      uploadSelectFile: "ចុច ឬទម្លាក់រូបថតនៅទីនេះដើម្បីបង្ហោះ",
      uploadChangeFile: "ប្តូររូបថតផ្សេង",
      uploadSubmitBtn: "បង្ហោះរូបថតទៅកាន់អាល់ប៊ុម",
      uploadingBtn: "កំពុងបង្ហោះទៅ Cloud...",
      uploadSuccessTitle: "បង្ហោះដោយជោគជ័យ! 🎉",
      uploadSuccessDesc: "អរគុណច្រើន! រូបថតអនុស្សាវរីយ៍របស់អ្នកត្រូវបានបញ្ចូលទៅក្នុងអាល់ប៊ុមរបស់ Nhã។",
      uploadRestrictedTitle: "ផ្តាច់មុខសម្រាប់ភ្ញៀវកិត្តិយស",
      uploadRestrictedDesc: "ការចែករំលែករូបថតគឺសម្រាប់តែភ្ញៀវដែលមានឈ្មោះក្នុងបញ្ជីអញ្ជើញរបស់ Nhã ប៉ុណ្ណោះ។ សូមបើកលិខិតអញ្ជើញតាមរយៈតំណភ្ជាប់ផ្ទាល់ខ្លួនរបស់អ្នក! 💌",
      emptyText: "អាល់ប៊ុមអនុស្សាវរីយ៍កំពុងរង់ចាំរូបថតដំបូង! សូមចុចប៊ូតុងខាងលើដើម្បីចែករំលែករូបថតជាមួយ Nhã ✨",
      paginationPage: "ទំព័រ",
      paginationOf: "នៃ",
      paginationPhotos: "រូបថតអនុស្សាវរីយ៍",
      paginationPrev: "ទំព័រមុន",
      paginationNext: "ទំព័របន្ទាប់",
      items: [],
    },
    location: {
      eyebrow: "ទីតាំង និងផែនទី",
      title: "សាលប្រជុំ PHUONG VI P100",
      viewMap: "មើលផែនទី",
    },
    rsvp: {
      eyebrow: "បញ្ជាក់ការចូលរួម",
      title: "វត្តមានរបស់អ្នក",
      subtitle: "វត្តមានរបស់លោកអ្នកនឹងធ្វើឱ្យថ្ងៃពិសេសនេះកាន់តែមានន័យ។",
      nameLabel: "ឈ្មោះពេញ *",
      namePlaceholder: "បញ្ចូលឈ្មោះពេញរបស់អ្នក...",
      phoneLabel: "លេខទូរស័ព្ទ",
      phonePlaceholder: "0xxx xxx xxx",
      attendLabel: "តើអ្នកនឹងចូលរួមទេ? *",
      attendYes: "✓ បាទ/ចាស ខ្ញុំនឹងចូលរួម 🎓",
      attendNo: "✗ សោកស្តាយ ខ្ញុំមិនអាចចូលរួមបានទេ 💌",
      guestLabel: "ចំនួនអ្នករួមដំណើរ",
      guestUnit: "អ្នករួមដំណើរ",
      messageLabel: "សារជូនពរ",
      messagePlaceholder: "ផ្ញើសារជូនពរ...",
      submitBtn: "ផ្ញើការបញ្ជាក់",
      submittingBtn: "កំពុងផ្ញើ...",
      successTitle: "សូមអរគុណយ៉ាងជ្រាលជ្រៅ!",
      successDesc: "ខ្ញុំបានទទួលការបញ្ជាក់របស់អ្នកហើយ។ រង់ចាំទទួលស្វាគមន៍អ្នកក្នុងថ្ងៃពិសេស! 🌿✨",
      resetBtn: "ផ្ញើការឆ្លើយតបផ្សេងទៀត",
    },
    closing: {
      thankYou: "សូមអរគុណយ៉ាងជ្រាលជ្រៅ",
      message: "ការណែនាំពីលោកគ្រូអ្នកគ្រូ ក្តីស្រឡាញ់ពីឪពុកម្តាយ និងការចែករំលែកពីមិត្តភក្តិ គឺជាកាដូដ៏មានតម្លៃបំផុតក្នុងដំណើរការសិក្សារបស់ខ្ញុំ។",
      classLabel: "បច្ចេកវិទ្យាព័ត៌មាន • ថ្នាក់ឆ្នាំ ២០២៦",
      periodLabel: "ឆ្នាំសិក្សា 2022 – 2026",
      motto: "The future belongs to those who believe in the beauty of their dreams.",
      madeWith: "បង្កើតឡើងដោយក្តីដឹងគុណ",
    },
  },
};
