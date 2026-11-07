import type { Language } from "@/config/i18n";

/**
 * Nội dung bổ sung cho thiết kế mới (tiệc, dress code, lời cảm ơn, hashtag...).
 * ⚠️ Các mục đánh dấu [PLACEHOLDER] chưa có dữ liệu thật — hãy thay bằng thông tin đúng.
 */
export const extras = {
  hashtag: "#ClassOf2026",

  // Lễ tốt nghiệp: lấy từ graduationConfig (date/time/venue/address/mapUrl)


  ceremonyEnd: "2026-10-21T11:30:00",

  // [PLACEHOLDER] Danh sách ảnh album mẫu (dùng khi chưa có ảnh thật). Thay bằng ảnh trong /public.
  albumPlaceholder: true,
};

type Copy = {
  quote: string;
  quoteBy: string;
  scrollHint: string;
  classOf: string;
  honors: string;
  ceremony: string;
  party: string;
  partyDate: string;
  partyTime: string;
  partyVenue: string;
  partyAddress: string;
  dressCode: string;
  dressCeremony: string;
  dressParty: string;
  directions: string;
  addToCalendar: string;
  calendarCeremony: string;
  calendarParty: string;
  journeyEyebrow: string;
  journeyLead: string;
  thanksEyebrow: string;
  thanksTitle: string;
  thanksFamily: string;
  thanksFamilyText: string;
  thanksTeachers: string;
  thanksTeachersText: string;
  thanksFriends: string;
  thanksFriendsText: string;
  contact: string;
  guestbook: string;
  placeholderTag: string;
};

export const extrasCopy: Record<Language, Copy> = {
  vi: {
    quote: "Mỗi trang sách đã mở, mỗi đêm thức trắng, mỗi lần vấp ngã rồi đứng dậy — tất cả đều dẫn về ngày hôm nay.",
    quoteBy: "Hành trình bốn năm",
    scrollHint: "Cuộn xuống",
    classOf: "Class of",
    honors: "Cử nhân · Kỹ sư",
    ceremony: "Lễ tốt nghiệp",
    party: "Tiệc chúc mừng",
    partyDate: "Cùng ngày",
    partyTime: "18:00 - 21:00",
    partyVenue: "Địa điểm sẽ được thông báo",
    partyAddress: "TP. Hồ Chí Minh",
    dressCode: "Trang phục",
    dressCeremony: "Mọi người cứ mặc bộ nào khiến mình đẹp nhất và tự tin nhất nhé!",
    dressParty: "Smart casual — gam màu trung tính, xanh lục hoặc kem",
    directions: "Chỉ đường",
    addToCalendar: "Thêm vào lịch",
    calendarCeremony: "Lễ tốt nghiệp",
    calendarParty: "Tiệc chúc mừng",
    journeyEyebrow: "Từ khóa 2022 đến 2026",
    journeyLead: "Nỗ lực · Trưởng thành · Tri ân",
    thanksEyebrow: "Lời tri ân",
    thanksTitle: "Biết ơn",
    thanksFamily: "Gia đình",
    thanksFamilyText: "Cảm ơn Ba Mẹ đã là điểm tựa vững chãi và niềm tin lặng lẽ nhất của con.",
    thanksTeachers: "Thầy Cô",
    thanksTeachersText: "Cảm ơn Thầy Cô đã dạy con kiến thức, và hơn hết là cách để trưởng thành.",
    thanksFriends: "Bạn bè",
    thanksFriendsText: "Cảm ơn những người bạn đã cùng chia sẻ những buổi deadline và tiếng cười.",
    contact: "Liên hệ",
    guestbook: "Sổ lưu bút",
    placeholderTag: "Ảnh mẫu — thay bằng ảnh thật",
  },
  en: {
    quote: "Every page turned, every sleepless night, every fall and every rise — all of it led to today.",
    quoteBy: "Four years, one journey",
    scrollHint: "Scroll",
    classOf: "Class of",
    honors: "Bachelor · Engineer",
    ceremony: "Graduation Ceremony",
    party: "Celebration Dinner",
    partyDate: "Same day",
    partyTime: "6:00 – 9:00 PM",
    partyVenue: "Venue to be announced",
    partyAddress: "Ho Chi Minh City",
    dressCode: "Dress code",
    dressCeremony: "Wear whatever makes you look and feel your best and most confident!",
    dressParty: "Smart casual — neutral, green or cream tones",
    directions: "Directions",
    addToCalendar: "Add to calendar",
    calendarCeremony: "Graduation Ceremony",
    calendarParty: "Celebration Dinner",
    journeyEyebrow: "From 2022 to 2026",
    journeyLead: "Effort · Growth · Gratitude",
    thanksEyebrow: "With gratitude",
    thanksTitle: "Thank You",
    thanksFamily: "Family",
    thanksFamilyText: "To my parents — my steadiest ground and quietest belief.",
    thanksTeachers: "Teachers",
    thanksTeachersText: "To my teachers — for knowledge, and above all, for teaching me how to grow.",
    thanksFriends: "Friends",
    thanksFriendsText: "To my friends — for the shared deadlines and the laughter in between.",
    contact: "Contact",
    guestbook: "Guestbook",
    placeholderTag: "Sample photo — replace with real one",
  },
  // Khmer: dùng bản tiếng Anh làm dự phòng (có thể dịch sau)
  km: {} as Copy,
};
extrasCopy.km = extrasCopy.en;
