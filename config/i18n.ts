export type Language = "vi" | "en" | "km";

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
  gallery: {
    eyebrow: string;
    title: string;
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
    gallery: {
      eyebrow: "BỘ SƯU TẬP KỶ NIỆM",
      title: "KHOẢNH KHẮC ĐÁNG NHỚ",
      items: [
        {
          id: "g1",
          title: "Lễ Trao Bằng Kỷ Niệm",
          category: "Kỷ Niệm",
          src: "/images/graduation/photo1.jpg",
          alt: "Lễ tốt nghiệp Công nghệ thông tin Danh Phương Nhã",
        },
        {
          id: "g2",
          title: "Nụ Cười Ngày Ra Trường",
          category: "Chân Dung",
          src: "/images/graduation/photo2.jpg",
          alt: "Hình ảnh tốt nghiệp Danh Phương Nhã",
        },
        {
          id: "g3",
          title: "Khoảnh Khắc Cùng Bạn Bè",
          category: "Tình Bạn",
          src: "/images/graduation/photo3.jpg",
          alt: "Hình ảnh bạn bè chúc mừng tốt nghiệp",
        },
        {
          id: "g4",
          title: "Góc Sân Trường Nông Lâm",
          category: "Kỷ Ức",
          src: "/images/graduation/photo4.jpg",
          alt: "Trường Đại Học Nông Lâm TP.HCM",
        },
        {
          id: "g5",
          title: "Hoa & Bằng Tốt Nghiệp",
          category: "Vinh Danh",
          src: "/images/graduation/photo5.jpg",
          alt: "Bằng tốt nghiệp Công nghệ thông tin",
        },
        {
          id: "g6",
          title: "Mở Ra Chặng Đường Mới",
          category: "Tương Lai",
          src: "/images/graduation/photo6.jpg",
          alt: "Tốt nghiệp IT 2026",
        },
        {
          id: "g7",
          title: "Nụ Cười Rạng Rỡ",
          category: "Kỷ Niệm",
          src: "/images/graduation/photo7.jpg",
          alt: "Hình ảnh kỷ niệm tốt nghiệp",
        },
        {
          id: "g8",
          title: "Khoảnh Khắc Đáng NhỚ",
          category: "Chân Dung",
          src: "/images/graduation/photo8.jpg",
          alt: "Chân dung tân kỹ sư IT",
        },
        {
          id: "g9",
          title: "Tự Hào Ngày Tốt Nghiệp",
          category: "Vinh Danh",
          src: "/images/graduation/photo9.jpg",
          alt: "Tự hào ngày tốt nghiệp",
        },
      ],
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
    gallery: {
      eyebrow: "MEMORIES",
      title: "MEMORABLE MOMENTS",
      items: [
        {
          id: "g1",
          title: "Commencement Ceremony",
          category: "Memories",
          src: "/images/graduation/photo1.jpg",
          alt: "Danh Phuong Nha Graduation Ceremony",
        },
        {
          id: "g2",
          title: "Graduation Smile",
          category: "Portrait",
          src: "/images/graduation/photo2.jpg",
          alt: "Graduation Cap",
        },
        {
          id: "g3",
          title: "Moments With Friends",
          category: "Friendship",
          src: "/images/graduation/photo3.jpg",
          alt: "Friends celebrating graduation",
        },
        {
          id: "g4",
          title: "Nong Lam Campus",
          category: "Campus",
          src: "/images/graduation/photo4.jpg",
          alt: "Nong Lam University campus",
        },
        {
          id: "g5",
          title: "Flowers & Diploma",
          category: "Honors",
          src: "/images/graduation/photo5.jpg",
          alt: "IT Diploma and Flowers",
        },
        {
          id: "g6",
          title: "Opening A New Chapter",
          category: "Future",
          src: "/images/graduation/photo6.jpg",
          alt: "IT Graduation 2026",
        },
        {
          id: "g7",
          title: "Bright Smile",
          category: "Memories",
          src: "/images/graduation/photo7.jpg",
          alt: "Graduation Memory Photo",
        },
        {
          id: "g8",
          title: "Precious Moment",
          category: "Portrait",
          src: "/images/graduation/photo8.jpg",
          alt: "IT Engineer Portrait",
        },
        {
          id: "g9",
          title: "Proud Day",
          category: "Honors",
          src: "/images/graduation/photo9.jpg",
          alt: "Proud Graduation Day",
        },
      ],
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
    gallery: {
      eyebrow: "កម្រងរូបភាព",
      title: "រូបភាពអនុស្សាវរីយ៍",
      items: [
        {
          id: "g1",
          title: "ពិធីប្រគល់សញ្ញាបត្រ",
          category: "អនុស្សាវរីយ៍",
          src: "/images/graduation/photo1.jpg",
          alt: "ពិធីប្រគល់សញ្ញាបត្រ Danh Phuong Nha",
        },
        {
          id: "g2",
          title: "ស្នាមញញឹមថ្ងៃបញ្ចប់ការសិក្សា",
          category: "រូបថតផ្ទាល់ខ្លួន",
          src: "/images/graduation/photo2.jpg",
          alt: "រូបថត Danh Phuong Nha",
        },
        {
          id: "g3",
          title: "កម្រងរូបភាពជាមួយមិត្តភក្តិ",
          category: "មិត្តភាព",
          src: "/images/graduation/photo3.jpg",
          alt: "មិត្តភក្តិអបអរសាទរ",
        },
        {
          id: "g4",
          title: "ទិដ្ឋភាពសាកលវិទ្យាល័យ",
          category: "ការចងចាំ",
          src: "/images/graduation/photo4.jpg",
          alt: "សាកលវិទ្យាល័យកសិកម្ម និងរុក្ខាប្រមាញ់",
        },
        {
          id: "g5",
          title: "បាច់ផ្កា និងសញ្ញាបត្រ",
          category: "កិត្តិយស",
          src: "/images/graduation/photo5.jpg",
          alt: "សញ្ញាបត្រ IT",
        },
        {
          id: "g6",
          title: "បើកទំព័រជីវិតថ្មី",
          category: "អនាគត",
          src: "/images/graduation/photo6.jpg",
          alt: "ការបញ្ចប់ការសិក្សា ២០២៦",
        },
        {
          id: "g7",
          title: "ស្នាមញញឹមស្រស់ស្រាយ",
          category: "អនុស្សាវរីយ៍",
          src: "/images/graduation/photo7.jpg",
          alt: "រូបថតអនុស្សាវរីយ៍",
        },
        {
          id: "g8",
          title: "ខណៈពេលដ៏មានតម្លៃ",
          category: "រូបថតផ្ទាល់ខ្លួន",
          src: "/images/graduation/photo8.jpg",
          alt: "រូបថតវិស្វករ IT",
        },
        {
          id: "g9",
          title: "ថ្ងៃដ៏មានមោទនភាព",
          category: "កិត្តិយស",
          src: "/images/graduation/photo9.jpg",
          alt: "ថ្ងៃបញ្ចប់ការសិក្សា",
        },
      ],
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
