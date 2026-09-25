import { GuestPronounMode } from "@/context/guest-context";
import { graduationConfig } from "@/config/graduation";

export interface GuestProfile {
  slug?: string;
  name: string;
  mode: GuestPronounMode;
  customMessage?: string;
  customTime?: string;
  customDate?: string;
  canUpload?: boolean;
  specialPhoto?: string;
}

/**
 * Danh sách khách mời mặc định được cấu hình sẵn các lời chúc hay, chân thành và thân thiết
 */
export const defaultGuestRegistry: Record<string, GuestProfile> = {
  phuongnha: {
    slug: "phuongnha",
    name: "Phương Nhã",
    mode: "friend",
    customMessage: "Hành trình 4 năm đại học cuối cùng cũng đã khép lại trọn vẹn. Cảm ơn bản thân vì đã luôn nỗ lực không ngừng nghỉ, và biết ơn gia đình, thầy cô cùng tất cả những người bạn tuyệt vời đã luôn đồng hành bên Nhã! ✨🎓",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  giabao: {
    slug: "giabao",
    name: "Gia Bảo",
    mode: "friend",
    customMessage: "Gia Bảo ơi! Qua dự lễ tốt nghiệp và chụp cùng tui vài kiểu ảnh kỷ niệm nhen 🥹 Chớp mắt một cái là tụi mình đã đi hết 4 năm đại học rồi. Bạn bè thì nhiều nhưng tri kỷ cùng đồng hành chẳng có mấy ai. Ngày đặc biệt này có mặt m thì niềm vui của t mới trọn vẹn được á! Hẹn gặp m nhaaa 🤍🎓",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  thaovan: {
    slug: "thaovan",
    name: "Thảo Vân",
    mode: "friend",
    customMessage: "Thảo Vân ơi, ngày trọng đại của t nhất định m phải có mặt đó nha 🥹 Cảm ơn m suốt những năm tháng qua luôn là người bạn đồng hành số một, chở t đi khắp nơi không ngại nắng mưa. Nhẩm lại tụi mình quen nhau cũng gần 10 năm rồi đó má, nhanh ghê luôn! Bạn thân cả đời đếm trên đầu ngón tay thôi nên hôm tốt nghiệp phải cùng t chụp thật nhiều tấm hình kỷ niệm nhen 🤍 T tốt nghiệp xong đi làm giàu là m chuẩn bị làm tài xế VIP của t đó nhen =))) Hẹn m nhaaa ✨🎓",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  nhuquynh: {
    slug: "nhuquynh",
    name: "Như Quỳnh",
    mode: "friend",
    customMessage: "Quỳnh ơiii, qua chung vui tốt nghiệp và chụp hình với t nhaaa 🥹 Thoắt cái là hết 4 năm đại học rồi, không biết kịp hít thở không khí dân IT bao lâu hay lại nhận lệnh lên đường phục vụ Tổ quốc nữa =))) Nên hôm nay có dịp là phải chụp lưu niệm cho đã nhen! Lỡ t đi NVQS thiệt thì m ở ngoài ráng cày lên sếp bự, đợi t về dắt t apply ké chứ 2 năm không gõ code chắc quên hết trơn haha. Nhất định phải qua với t nhen 🤍✨",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  nhutquang: {
    slug: "nhutquang",
    name: "Nhựt Quang",
    mode: "friend",
    customMessage: "Nhựt Quang ơii! Ngày t chính thức nhận bằng kỹ sư m không qua là giận thiệt không thèm nhìn mặt luôn đó nha 😤 Đùa chứ 4 năm đại học trôi qua lẹ quá, có m chung vui chụp tấm hình kỷ niệm thì mới trọn vẹn được. Sắp xếp thời gian qua với t nha người anh em ơi! 🎓📸",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  myxuyen: {
    slug: "myxuyen",
    name: "Anh Xuyên",
    mode: "friend",
    customMessage: "Anh Xuyên ơi! Hôm tốt nghiệp của em, anh nhớ ghé qua trường chung vui và chụp cùng em vài tấm hình kỷ niệm thật đẹp nhaaa 🎓✨ Ngày quan trọng này có anh đến chung vui là em quý và vui lắm luôn á!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  huutri: {
    slug: "huutri",
    name: "Hữu Trí",
    mode: "friend",
    customMessage: "Hữu Trí ơi! Ngày Nhã tốt nghiệp, Trí nhớ sắp xếp qua trường chụp với Nhã vài bức hình lưu niệm nhen 🥹 Bạn bè ở đây cũng không có nhiều, có Trí đến chung vui và sẻ chia khoảnh khắc này cùng Nhã thì quý giá biết bao. Hẹn gặp Trí hôm đó nhaaa! ✨🎓",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  tanthanh: {
    slug: "tanthanh",
    name: "Tấn Thành",
    mode: "friend",
    customMessage: "Tấn Thành ơii! Ngày lễ tốt nghiệp của anh, em nhớ qua trường chụp ảnh kỷ niệm với anh nhen 🥹 4 năm đại học cuối cùng cũng cán đích rồi, có em ghé chung vui là ngày hôm đó thêm rực rỡ và ý nghĩa hơn bao giờ hết luôn á. Nhất định phải qua đó nhaaa! 🎓🤍",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  minhkhoi: {
    slug: "minhkhoi",
    name: "Minh Khôi",
    mode: "friend",
    customMessage: "Pỏm ơii! Ngày t nhận bằng tốt nghiệp m nhớ sắp xếp qua trường chụp với t vài tấm ảnh kỷ niệm nhen 📸✨ 4 năm thanh xuân trôi qua nhanh như một cái chớp mắt, ngày này có m cùng chung vui và ghi lại khoảnh khắc là vui hết sảy luôn á. Hẹn gặp m nhaaa!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  tuankiet: {
    slug: "tuankiet",
    name: "Kiệt",
    mode: "friend",
    customMessage: "Kiệt ơi! Hôm lễ tốt nghiệp của Nhã, Kiệt nhớ ghé trường cùng chung vui và chụp với Nhã mấy kiểu ảnh kỷ niệm nhen 🎓✨ Bao nhiêu năm nỗ lực mới có ngày này, có Kiệt đến chia vui là Nhã trân quý và vui lắm luôn á. Hẹn gặp Kiệt hôm đó nha!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  hien: {
    slug: "hien",
    name: "Minh Hiển",
    mode: "friend",
    customMessage: "Minh Hiển ơi! Ngày Nhã chính thức nhận bằng tốt nghiệp, Hiển nhớ dành chút thời gian ghé qua trường chụp với Nhã vài tấm hình kỷ niệm nha 📸✨ Có bạn bè thân thiết đến chung vui trong ngày này thì khoảnh khắc tốt nghiệp mới thật sự trọn vẹn. Rất mong được đón tiếp Hiển nhen!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  nhuy: {
    slug: "nhuy",
    name: "Ý",
    mode: "friend",
    customMessage: "Ý ơi! Ngày lễ tốt nghiệp của Nhã, Ý nhớ ghé qua trường chung vui và chụp cùng Nhã những tấm hình kỷ niệm thật xinh xắn nhaaa 🎓🌸 Sau bao nhiêu năm tháng miệt mài học tập, có Ý cùng chia sẻ niềm vui trong ngày đặc biệt này là Nhã quý lắm luôn á. Hẹn gặp Ý nha!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  quy: {
    slug: "quy",
    name: "Anh Quý",
    mode: "senior",
    customMessage: "Anh Quý ơi! Em chính thức tốt nghiệp đại học rồi nè anh 🎓📸 Ngày lễ nhận bằng của em, anh Quý nhớ sắp xếp chút thời gian ghé qua trường chụp với em vài tấm hình kỷ niệm nha anh. Có người anh thân thiết đến chung vui là niềm vinh hạnh và vui vẻ lớn của em á!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  utmy: {
    slug: "utmy",
    name: "Út Iu",
    mode: "senior",
    customMessage: "Út iu dấu ơi! Cuối cùng ngày em cầm tấm bằng tốt nghiệp trên tay cũng đã tới rồi nè 🎉✨ Út nhớ ghé qua trường chụp thật nhiều hình kỷ niệm đẹp với em nhaaa. Cảm ơn Út thời gian qua luôn yêu thương và ủng hộ em hết mình. Mãi yêu Út, hẹn gặp Út ngày tốt nghiệp nhen! 🤍🎓",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  anhthi: {
    slug: "anhthi",
    name: "Anh Hai",
    mode: "senior",
    customMessage: "Anh Hai ơi! Hành trình 4 năm đại học của em trai đã chính thức về đích rồi nè 🎓✨ Ngày em nhận bằng tốt nghiệp, Anh Hai nhớ sắp xếp thời gian ghé qua trường chung vui và chụp với em vài kiểu ảnh kỷ niệm nha. Sự có mặt của Anh Hai là niềm tự hào và động lực rất lớn đối với em á!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  anhnam: {
    slug: "anhnam",
    name: "Anh Hai",
    mode: "senior",
    customMessage: "Anh Hai ơi! Ngày em nhận bằng tốt nghiệp đại học, Anh Hai nhớ chở Chị Hai cùng qua trường chung vui và chụp với em những bức ảnh kỷ niệm thật đẹp nhaaa 🎓✨ Có cả Anh Hai và Chị Hai đến dự là ngày đặc biệt của em sẽ trọn vẹn và ấm áp lắm luôn á!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  benhi: {
    slug: "benhi",
    name: "Haii Nhii",
    mode: "senior",
    customMessage: "Chị Hai Nhi ơi! Em Nhã đã chính thức hoàn thành chặng đường đại học và nhận bằng tốt nghiệp rồi nè 🎓🎉 Chị Hai nhớ ghé trường chụp hình kỷ niệm cùng em nha. Có Chị Hai sang chung vui là ngày tốt nghiệp của em thêm rộn ràng và vui vẻ lắm luôn á!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  bean: {
    slug: "bean",
    name: "Bé An",
    mode: "junior",
    customMessage: "Bé An ơi! Anh Hai Nhã đã chính thức tốt nghiệp đại học rồi nè 🎓🎉 Bé An nhớ lên trường chung vui và chụp với anh Hai thật nhiều tấm hình kỷ niệm thật đẹp nhen. Cố gắng học giỏi sau này cũng nhận bằng rực rỡ như anh Hai nha!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  bame: {
    slug: "bame",
    name: "Ba Mẹ",
    mode: "elder",
    customMessage: "Kính gửi Ba Mẹ kính yêu của con! Hành trình 4 năm đại học của con đã chính thức hoàn thành, và tấm bằng kỹ sư hôm nay là món quà tri ân sâu sắc nhất con dành tặng Ba Mẹ. Con kính mời Ba Mẹ cùng em gái Phương Anh lên dự lễ tốt nghiệp để cùng con ghi lại những khoảnh khắc gia đình thiêng liêng và tự hào nhất. Sự hiện diện của Ba Mẹ là niềm hạnh phúc lớn nhất của cuộc đời con! 🤍🎓",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  bac5: {
    slug: "bac5",
    name: "Út với Dượng 5",
    mode: "elder",
    customMessage: "Dạ con kính chào Út và Dượng 5! Hôm nay con đã hoàn thành xong chương trình đại học và chính thức nhận bằng tốt nghiệp 🎓✨ Con kính mời Út và Dượng Năm sắp xếp thời gian lên trường chung vui và chụp với con vài tấm hình kỷ niệm. Sự hiện diện và lời chúc của Út, Dượng là niềm vinh hạnh rất lớn đối với con ạ!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  canha: {
    slug: "canha",
    name: "Cả Nhà Mình",
    mode: "elder",
    customMessage: "Dạ con kính gửi Cả Nhà Mình! Trải qua 4 năm miệt mài học tập, con đã chính thức tốt nghiệp đại học. Con kính mời cả gia đình mình cùng lên trường tham dự buổi lễ và chụp những bức hình kỷ niệm thật ý nghĩa cùng con. Ngày trọng đại này có đầy đủ cả nhà bên cạnh là điều tuyệt vời và ấm áp nhất đối với con ạ! 🎓🤍",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  di9: {
    slug: "di9",
    name: "Dì với Dượng 9",
    mode: "elder",
    customMessage: "Dạ con kính chào Dì và Dượng 9! Con đã hoàn thành 4 năm đại học và chính thức nhận tấm bằng kỹ sư 🎓✨ Con kính mời Dì 9 và Dượng 9 dành chút thời gian ghé qua trường chung vui và chụp ảnh lưu niệm cùng con trong ngày đặc biệt này ạ. Con cảm ơn Dì và Dượng rất nhiều!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  di3: {
    slug: "di3",
    name: "Dì Ba",
    mode: "elder",
    customMessage: "Dạ con kính chào Dì Ba! Con đã chính thức tốt nghiệp đại học rồi ạ 🎓✨ Con kính mời Dì Ba sắp xếp thời gian lên trường tham dự buổi lễ và chụp cùng con vài tấm ảnh kỷ niệm nha Dì. Sự hiện diện của Dì Ba là niềm vui và vinh hạnh lớn đối với con ạ!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  diut: {
    slug: "diut",
    name: "Dì Út",
    mode: "elder",
    customMessage: "Dạ con kính chào Dì Út! Hành trình đại học của con đã khép lại bằng tấm bằng tốt nghiệp 🎓🎉 Con kính mời Dì Út lên trường chung vui và chụp với con những tấm hình kỷ niệm thật đẹp trong ngày này nha Dì. Con mong được đón tiếp Dì Út lắm ạ!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
  cau5: {
    slug: "cau5",
    name: "Cậu Năm",
    mode: "elder",
    customMessage: "Dạ con kính chào Cậu Năm! Con đã chính thức hoàn thành 4 năm học và nhận bằng tốt nghiệp kỹ sư 🎓✨ Con kính mời Cậu Năm bớt chút thời gian lên trường tham dự và chụp với con những bức ảnh kỷ niệm ý nghĩa. Sự có mặt của Cậu Năm là niềm tự hào và vinh hạnh rất lớn cho con ạ!",
    customTime: "10:00 - 11:30 sáng",
    customDate: "30/10/2026",
    canUpload: true,
  },
};

/**
 * Chuẩn hóa giá trị vai xưng (mode) được nhập từ Google Sheet sang GuestPronounMode
 */
export function normalizePronounMode(modeStr?: string): GuestPronounMode {
  if (!modeStr) return "friend";
  const m = modeStr.trim().toLowerCase();
  if (
    m === "elder" ||
    m === "con" ||
    m === "thay" ||
    m === "thầy" ||
    m === "co" ||
    m === "cô" ||
    m === "nguoi lon" ||
    m === "kinh moi" ||
    m === "kính mời"
  ) {
    return "elder";
  }
  if (
    m === "senior" ||
    m === "em" ||
    m === "anh" ||
    m === "chi" ||
    m === "chị" ||
    m === "than ai" ||
    m === "thân ái"
  ) {
    return "senior";
  }
  if (
    m === "junior" ||
    m === "moi" ||
    m === "mời" ||
    m === "hau boi" ||
    m === "dan em" ||
    m === "đàn em" ||
    m === "be" ||
    m === "bé"
  ) {
    return "junior";
  }
  return "friend";
}

/**
 * Chuyển đổi chuỗi ngày giờ tùy chỉnh thành timestamp milliseconds để so sánh
 */
export function parseDateTimeToTimestamp(dateStr?: string, timeStr?: string): number | null {
  if (!dateStr && !timeStr) return null;

  const defaultTarget = new Date(graduationConfig.graduationDate);
  let year = defaultTarget.getFullYear();
  let month = defaultTarget.getMonth();
  let day = defaultTarget.getDate();
  let hours = defaultTarget.getHours();
  let minutes = defaultTarget.getMinutes();

  if (dateStr && dateStr.trim()) {
    const trimmed = dateStr.trim();
    const matchDMY = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    const matchYMD = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
    const matchDM = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})$/);

    if (matchDMY) {
      day = parseInt(matchDMY[1], 10);
      month = parseInt(matchDMY[2], 10) - 1;
      year = parseInt(matchDMY[3], 10);
    } else if (matchYMD) {
      year = parseInt(matchYMD[1], 10);
      month = parseInt(matchYMD[2], 10) - 1;
      day = parseInt(matchYMD[3], 10);
    } else if (matchDM) {
      day = parseInt(matchDM[1], 10);
      month = parseInt(matchDM[2], 10) - 1;
    }
  }

  if (timeStr && timeStr.trim()) {
    const trimmedTime = timeStr.trim();
    const timeMatch = trimmedTime.match(/(\d{1,2})[:h](\d{2})/i) || trimmedTime.match(/(\d{1,2})[:h]/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const isPM = /pm|chiều|chieu|tối|toi|afternoon|evening|រសៀល|យប់/i.test(trimmedTime);
      const isAM = /am|sáng|sang|morning|ព្រឹក/i.test(trimmedTime);

      if (isPM && h < 12) {
        h += 12;
      } else if (isAM && h === 12) {
        h = 0;
      }
      hours = h;
      minutes = m;
    }
  }

  return new Date(year, month, day, hours, minutes, 0).getTime();
}

/**
 * Tìm ngày giờ tốt nghiệp sớm nhất trong toàn bộ danh sách Khách Mời từ Google Sheet
 */
export function getEarliestGraduationDateTime(
  registry?: Record<string, GuestProfile>
): { earliestDate?: string; earliestTime?: string } {
  let targetRegistry = registry;
  if (!targetRegistry && typeof window !== "undefined") {
    try {
      const cached =
        localStorage.getItem("cached_guest_registry") ||
        sessionStorage.getItem("cached_guest_registry");
      if (cached) {
        targetRegistry = JSON.parse(cached);
      }
    } catch {
      // ignore
    }
  }
  if (!targetRegistry) {
    targetRegistry = defaultGuestRegistry;
  }

  let minTimestamp = Infinity;
  let result: { earliestDate?: string; earliestTime?: string } = {};

  for (const profile of Object.values(targetRegistry)) {
    if (profile.customDate || profile.customTime) {
      const ts = parseDateTimeToTimestamp(profile.customDate, profile.customTime);
      if (ts !== null && ts < minTimestamp) {
        minTimestamp = ts;
        result = {
          earliestDate: profile.customDate,
          earliestTime: profile.customTime,
        };
      }
    }
  }

  return result;
}

/**
 * Tìm kiếm nhanh khách mời từ bộ nhớ đệm đồng bộ (LocalStorage / SessionStorage)
 */
export function getCachedGuestSync(slug: string): GuestProfile | null {
  if (typeof window === "undefined" || !slug) return null;
  const cleanSlug = slug.trim().toLowerCase().replace(/[-_]/g, "");
  try {
    const raw =
      localStorage.getItem("cached_guest_registry") ||
      sessionStorage.getItem("cached_guest_registry");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed[cleanSlug]) {
        return parsed[cleanSlug];
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/**
 * Tải danh sách khách mời từ Google Sheet (Sheet 3 / KhachMoi)
 */
export async function fetchGuestsFromSheet(forceRefresh = false): Promise<Record<string, GuestProfile>> {
  const cacheKey = "cached_guest_registry";

  // 1. Kiểm tra cache LocalStorage / SessionStorage nếu không yêu cầu làm mới dữ liệu
  if (!forceRefresh && typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Fetch siêu tốc từ /api/guests (Server API Proxy) hoặc trực tiếp từ Google Apps Script
  try {
    const apiUrl =
      typeof window !== "undefined"
        ? `/api/guests${forceRefresh ? `?refresh=1&_t=${Date.now()}` : ""}`
        : `${graduationConfig.googleScriptUrl}?action=getGuests&sheet=guests`;

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: forceRefresh ? "no-store" : "default",
    });

    if (res.ok) {
      let rawList: unknown;
      try {
        rawList = await res.json();
      } catch (parseErr) {
        console.warn("[Guests fetch] Could not parse response as JSON:", parseErr);
      }

      if (Array.isArray(rawList) && rawList.length > 0) {
        const registry: Record<string, GuestProfile> = {};

        rawList.forEach((item: Record<string, unknown>) => {
          const rawSlug =
            item.slug ||
            item.Slug ||
            item.id ||
            item.ID ||
            item.ma ||
            item.Ma;
          const name =
            item.guestName ||
            item.GuestName ||
            item.name ||
            item.Name ||
            item.ten ||
            item.Ten ||
            item.viewer ||
            item.hoTen ||
            item.HoTen;

          if (rawSlug && name) {
            const slug = String(rawSlug).trim().toLowerCase().replace(/[-_]/g, "");
            const rawMode = (item.role || item.Role || item.mode || item.Mode || item.vaiXung || item.VaiXung || item.danhXung || "") as string;
            const mode = normalizePronounMode(rawMode);
            const customMessage = (item.customMessage ||
              item.CustomMessage ||
              item.note ||
              item.Note ||
              item.message ||
              item.Message ||
              item.loiChuc ||
              item.LoiChuc ||
              item.tamThu ||
              item.TamThu ||
              undefined) as string | undefined;
            const customTime = (item.customTime ||
              item.CustomTime ||
              item.thoiGian ||
              item.ThoiGian ||
              item.thoiGianMoi ||
              item.ThoiGianMoi ||
              item.time ||
              item.Time ||
              item.gio ||
              item.Gio ||
              undefined) as string | undefined;
            const customDate = (item.customDate ||
              item.CustomDate ||
              item.ngay ||
              item.Ngay ||
              item.ngayMoi ||
              item.NgayMoi ||
              item.date ||
              item.Date ||
              undefined) as string | undefined;

            const rawCanUpload =
              item.canUpload !== undefined
                ? item.canUpload
                : item.CanUpload !== undefined
                ? item.CanUpload
                : item.quyenUpAnh !== undefined
                ? item.quyenUpAnh
                : item.QuyenUpAnh !== undefined
                ? item.QuyenUpAnh
                : item.allowUpload !== undefined
                ? item.allowUpload
                : item.upAnh !== undefined
                ? item.upAnh
                : item.upload;

            let canUpload = true;
            if (rawCanUpload !== undefined && rawCanUpload !== null && String(rawCanUpload).trim() !== "") {
              const s = String(rawCanUpload).trim().toLowerCase();
              if (s === "false" || s === "0" || s === "khong" || s === "không" || s === "no" || s === "cấm" || s === "cam" || s === "tat" || s === "tắt") {
                canUpload = false;
              } else {
                canUpload = true;
              }
            }

            const specialPhoto = (item.specialPhoto ||
              item.SpecialPhoto ||
              item.cloudinaryImageLink ||
              item.photoUrl ||
              item.photo ||
              item.Photo ||
              undefined) as string | undefined;

            const profile: GuestProfile = {
              slug: String(rawSlug).trim(),
              name: String(name).trim(),
              mode,
              customMessage: customMessage ? String(customMessage).trim() : undefined,
              customTime: customTime ? String(customTime).trim() : undefined,
              customDate: customDate ? String(customDate).trim() : undefined,
              canUpload,
              specialPhoto: specialPhoto ? String(specialPhoto).trim() : undefined,
            };

            registry[slug] = profile;

            // Lưu thêm theo tên chuẩn hóa để tra cứu linh hoạt
            const cleanNameKey = String(name).trim().toLowerCase().replace(/[-_]/g, "");
            if (cleanNameKey && !registry[cleanNameKey]) {
              registry[cleanNameKey] = profile;
            }
          }
        });

        if (Object.keys(registry).length > 0) {
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem(cacheKey, JSON.stringify(registry));
              sessionStorage.setItem(cacheKey, JSON.stringify(registry));
            } catch {
              // ignore
            }
          }
          return registry;
        } else {
          console.warn("[Guests fetch] No valid guest entries found with slug and name in payload.");
        }
      } else if (rawList !== undefined) {
        console.warn("[Guests fetch] Received non-array or empty payload from guests API:", rawList);
      }
    } else {
      console.warn(`[Guests fetch] API responded with HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("Could not fetch guests from Google Sheet:", err);
  }

  // If fetch failed or returned no entries, fallback to cached registry if available
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
          console.warn("[Guests fetch] Falling back to previously cached guest registry due to fetch failure or empty response.");
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return defaultGuestRegistry;
}

/**
 * Tra cứu thông tin khách mời qua slug (không phân biệt hoa thường, hỗ trợ dấu gạch ngang)
 */
export function findGuestBySlug(
  slug: string,
  customRegistry?: Record<string, GuestProfile>
): GuestProfile | null {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase().replace(/[-_]/g, "");

  // 1. Kiểm tra trong registry truyền vào
  if (customRegistry) {
    if (customRegistry[cleanSlug]) {
      return customRegistry[cleanSlug];
    }
    for (const [key, profile] of Object.entries(customRegistry)) {
      const cleanKey = key.trim().toLowerCase().replace(/[-_]/g, "");
      const cleanName = profile.name.trim().toLowerCase().replace(/[-_]/g, "");
      const cleanProfileSlug = profile.slug ? profile.slug.trim().toLowerCase().replace(/[-_]/g, "") : "";
      if (cleanKey === cleanSlug || cleanName === cleanSlug || cleanProfileSlug === cleanSlug) {
        return profile;
      }
    }
    // Khi customRegistry mới nhất được truyền vào, KHÔNG rơi xuống cache LocalStorage cũ
    return null;
  }

  // 2. Kiểm tra trong cache đồng bộ (LocalStorage / SessionStorage)
  const cachedProfile = getCachedGuestSync(cleanSlug);
  if (cachedProfile) {
    return cachedProfile;
  }

  // 3. Kiểm tra trong registry mặc định
  if (defaultGuestRegistry[cleanSlug]) {
    return defaultGuestRegistry[cleanSlug];
  }

  return null;
}

/**
 * Tải toàn bộ ảnh kỷ niệm đã được mọi người đóng góp từ Google Sheet / Cloud
 * Tự động đồng bộ với Google Sheets và lưu bộ nhớ đệm
 */
export async function fetchPhotosFromSheet(forceRefresh = false): Promise<import("@/config/graduation").GalleryItem[]> {
  const cacheKey = "cached_cloud_photos_v2";

  // 1. Ưu tiên fetch từ /api/photos (server-side verification đã lọc sạch 404 và ảnh đã xóa)
  if (typeof window !== "undefined") {
    try {
      const apiUrl = `/api/photos${forceRefresh ? `?refresh=1&_t=${Date.now()}` : ""}`;
      const res = await fetch(apiUrl, {
        cache: forceRefresh ? "no-store" : "default",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(data));
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
            // Dọn sạch key cache cũ v1
            localStorage.removeItem("cached_cloud_photos");
            sessionStorage.removeItem("cached_cloud_photos");
          } catch {
            // ignore
          }
          return data;
        }
      }
    } catch {
      // Fallback xuống Google Script trực tiếp nếu lỗi route nội bộ
    }
  }

  // 2. Fallback trực tiếp: Google Apps Script (Sheet AnhKyNiem)
  const seenUrls = new Set<string>();
  const freshPhotos: import("@/config/graduation").GalleryItem[] = [];
  let fetchSucceeded = false;

  try {
    if (graduationConfig.googleScriptUrl) {
      const res = await fetch(`${graduationConfig.googleScriptUrl}?action=getPhotos&sheet=photos`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        fetchSucceeded = true;
        const rawList = await res.json();
        if (Array.isArray(rawList)) {
          rawList.forEach((item: Record<string, unknown>, idx: number) => {
            const rawUrl =
              item.cloudinaryImageLink ||
              item.photoUrl ||
              item.PhotoUrl ||
              item["Link Ảnh Cloudinary"] ||
              item["Link Ảnh"] ||
              item["Link"] ||
              item["Ảnh"] ||
              item.photo ||
              item.Photo ||
              item.src ||
              item.Src ||
              item.url ||
              item.Url ||
              item.specialPhoto ||
              item.SpecialPhoto ||
              item.link ||
              item.Link;

            if (rawUrl && typeof rawUrl === "string") {
              const cleanUrl = rawUrl.trim();
              if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("/")) {
                if (!seenUrls.has(cleanUrl)) {
                  seenUrls.add(cleanUrl);
                  const rawCaption = String(item.label || item.Label || item.caption || item.Caption || item["Lời Nhắn / Kỷ Niệm"] || item["Lời Nhắn"] || item["Kỷ Niệm"] || item.title || item.Title || item.loiChuc || "").trim();
                  const category = String(item.topic || item.Topic || item.category || item.Category || item["Chủ Đề"] || item["Chủ đề"] || item.chuDe || item.ChuDe || "Kỷ Niệm").trim();
                  const title = rawCaption || category || "Ảnh kỷ niệm";

                  const rawPriority =
                    item.priorityLevel ??
                    item.PriorityLevel ??
                    item.priority ??
                    item.Priority ??
                    item["Mức độ ưu tiên"] ??
                    item["Mức Độ Ưu Tiên"] ??
                    item["Mức độ"] ??
                    item["Mức Độ"] ??
                    item["Độ ưu tiên"] ??
                    item["Độ Ưu Tiên"] ??
                    item["Ưu tiên"] ??
                    item["Ưu Tiên"] ??
                    item["Thứ tự"] ??
                    item["Thứ Tự"] ??
                    item.order ??
                    item.Order;

                  let priority = 1;
                  if (rawPriority !== undefined && rawPriority !== null && String(rawPriority).trim() !== "") {
                    const num = Number(rawPriority);
                    if (!isNaN(num)) {
                      priority = num;
                    }
                  }

                  const filename = cleanUrl.split("/").pop()?.replace(/[^a-zA-Z0-9_-]/g, "") || idx;
                  freshPhotos.push({
                    id: `cloud-${idx}-${filename}`,
                    title,
                    category: category || "Kỷ Niệm",
                    src: cleanUrl,
                    alt: rawCaption || `Ảnh kỷ niệm [${category}]`,
                    priority,
                    uploadIdx: idx,
                  });
                }
              }
            }
          });
        }
      }
    }
  } catch (err) {
    console.warn("Could not fetch cloud photos:", err);
  }

  // Sắp xếp:
  // 1. Mức độ ưu tiên nhỏ hơn xếp trước (1, 2, 3...)
  // 2. Cùng mức ưu tiên: Ảnh mới hơn (uploadIdx lớn hơn) xếp lên đầu
  freshPhotos.sort((a, b) => {
    const pA = typeof a.priority === "number" && !isNaN(a.priority) ? a.priority : 1;
    const pB = typeof b.priority === "number" && !isNaN(b.priority) ? b.priority : 1;
    if (pA !== pB) return pA - pB;
    const idxA = a.uploadIdx ?? 0;
    const idxB = b.uploadIdx ?? 0;
    return idxB - idxA;
  });

  // 3. Quét thêm ảnh riêng từ danh sách khách mời (specialPhoto)
  try {
    const dynamicRegistry = await fetchGuestsFromSheet();
    Object.values(dynamicRegistry).forEach((guest, idx) => {
      if (guest.specialPhoto && typeof guest.specialPhoto === "string") {
        const cleanUrl = guest.specialPhoto.trim();
        if ((cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://") || cleanUrl.startsWith("/")) && !seenUrls.has(cleanUrl)) {
          seenUrls.add(cleanUrl);
          freshPhotos.push({
            id: `special-${guest.slug || idx}`,
            title: `Khoảnh khắc cùng ${guest.name}`,
            category: "Kỷ Niệm",
            src: cleanUrl,
            alt: `Ảnh kỷ niệm đóng góp bởi ${guest.name}`,
          });
        }
      }
    });
  } catch {
    // ignore
  }

  // 4. Cập nhật lại cache đồng bộ khi fetch thành công
  if (fetchSucceeded && freshPhotos.length > 0 && typeof window !== "undefined") {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(freshPhotos));
      sessionStorage.setItem(cacheKey, JSON.stringify(freshPhotos));
    } catch {
      // ignore
    }
  }

  // 5. Nếu fetch không thành công hoặc trả về rỗng, fallback sang cache trước đó nếu có
  if (!fetchSucceeded && typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(cacheKey) || sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.warn("[Photos fetch] Returning cached cloud photos due to fetch failure");
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }

  return freshPhotos;
}

