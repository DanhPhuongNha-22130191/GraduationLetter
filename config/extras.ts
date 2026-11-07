import type { Language } from "@/config/i18n";

/**
 * Nội dung bổ sung cho thiết kế mới (tiệc, dress code, lời cảm ơn, hashtag...).
 * ⚠️ Các mục đánh dấu [PLACEHOLDER] chưa có dữ liệu thật — hãy thay bằng thông tin đúng.
 */
export const extras = {
  hashtag: "#ClassOf2026",

  // Lễ tốt nghiệp: lấy từ graduationConfig (date/time/venue/address/mapUrl)


  ceremonyEnd: "2026-12-04T11:30:00",

  // [PLACEHOLDER] Danh sách ảnh album mẫu (dùng khi chưa có ảnh thật). Thay bằng ảnh trong /public.
  albumPlaceholder: true,
};

type Copy = {
  quote: string;
  quoteBy: string;
  scrollHint: string;
  scrollCta: string;
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
    scrollCta: "Lướt xuống để xem",
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
    scrollCta: "Scroll down to view",
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
  km: {
    quote: "រាល់ទំព័រសៀវភៅដែលបានបើក រាល់យប់ដែលមិនបានដេក រាល់ការដួល និងការក្រោកឈរឡើងវិញ — ទាំងអស់បាននាំមកដល់ថ្ងៃនេះ។",
    quoteBy: "ដំណើរបួនឆ្នាំ",
    scrollHint: "រំកិលចុះ",
    scrollCta: "រំកិលចុះដើម្បីមើល",
    classOf: "Class of",
    honors: "បរិញ្ញាបត្រ · វិស្វករ",
    ceremony: "ពិធីបញ្ចប់ការសិក្សា",
    party: "ពិធីជប់លៀងអបអរ",
    partyDate: "ថ្ងៃដដែល",
    partyTime: "18:00 - 21:00",
    partyVenue: "ទីកន្លែងនឹងជូនដំណឹងនៅពេលក្រោយ",
    partyAddress: "ទីក្រុងហូជីមិញ",
    dressCode: "សម្លៀកបំពាក់",
    dressCeremony: "សូមស្លៀកពាក់ឈុតណាដែលធ្វើឲ្យអ្នកស្អាត និងមានទំនុកចិត្តបំផុត!",
    dressParty: "Smart casual — ពណ៌អព្យាក្រឹត បៃតង ឬពណ៌ក្រែម",
    directions: "មើលផ្លូវ",
    addToCalendar: "បន្ថែមទៅប្រតិទិន",
    calendarCeremony: "ពិធីបញ្ចប់ការសិក្សា",
    calendarParty: "ពិធីជប់លៀងអបអរ",
    journeyEyebrow: "ពីឆ្នាំ 2022 ដល់ 2026",
    journeyLead: "ការខិតខំ · ការលូតលាស់ · ការដឹងគុណ",
    thanksEyebrow: "ពាក្យដឹងគុណ",
    thanksTitle: "សូមអរគុណ",
    thanksFamily: "គ្រួសារ",
    thanksFamilyText: "សូមអរគុណឪពុកម្តាយ ដែលជាទីពឹងដ៏រឹងមាំ និងជំនឿដ៏ស្ងប់ស្ងាត់បំផុតរបស់កូន។",
    thanksTeachers: "លោកគ្រូ អ្នកគ្រូ",
    thanksTeachersText: "សូមអរគុណលោកគ្រូ អ្នកគ្រូ ដែលបានបង្រៀនចំណេះដឹង ហើយលើសពីនេះ គឺរបៀបធំធាត់។",
    thanksFriends: "មិត្តភក្តិ",
    thanksFriendsText: "សូមអរគុណមិត្តភក្តិ ដែលបានឆ្លងកាត់ deadline និងសំណើចជាមួយគ្នា។",
    contact: "ទំនាក់ទំនង",
    guestbook: "សៀវភៅភ្ញៀវ",
    placeholderTag: "រូបគំរូ — ជំនួសដោយរូបពិត",
  },
};
