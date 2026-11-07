import type { Language } from "@/config/i18n";

/**
 * Chuỗi giao diện bổ sung (nút, nhãn, thông báo, aria-label...) cho VI / EN / KM.
 * Không chứa dữ liệu động (tên khách, ảnh, chủ đề, bài hát...) — các giá trị đó truyền vào qua tham số.
 */
export type UiCopy = {
  profile: {
    university: string;
    faculty: string;
  };
  envelope: {
    badge: string;
    title: (year: string | number) => string;
    sealLabel: string;
    namePrompt: string;
    namePlaceholder: string;
    tapToOpen: string;
  };
  hero: {
    portraitAlt: (name: string) => string;
  };
  music: {
    on: string;
    off: string;
  };
  closing: {
    shareTitle: (name: string) => string;
    shareText: (name: string) => string;
    share: string;
    linkCopied: string;
  };
  details: {
    srDate: string;
    srVenue: string;
    dressFor: (guest: string) => string;
  };
  invitation: {
    privateNote: (guest: string) => string;
  };
  rsvp: {
    attendee: string;
    changeName: string;
    changeNameTitle: string;
    restore: (name: string) => string;
    restoreTitle: (name: string) => string;
    clearName: string;
    clearNameTitle: string;
    attendingAs: string;
    originalName: string;
    wishesTitle: string;
  };
  gallery: {
    sync: string;
    emptyCategory: (cat: string) => string;
    emptyCategoryHint: string;
    contributeNow: string;
    contributeTo: (cat: string) => string;
    showing: (from: number, to: number, total: number) => string;
    successMany: (n: number) => string;
    guestAccess: string;
    noPermission: string;
    gotIt: string;
    shareMoments: string;
    steps: [string, string, string];
    photosLabel: string;
    selected: [string, string];
    addPhoto: string;
    clearAll: string;
    removePhoto: string;
    fileHint: (max: number) => string;
    addLink: string;
    entered: [string, string];
    urlHint: string;
    verifiedGuest: string;
    newTopic: string;
    topicHint: string;
    advanced: string;
    priority: string;
    priorityDefault: string;
    priorityHint: string;
    uploadN: (n: number) => string;
    close: string;
    closeTitle: string;
    prev: string;
    prevTitle: string;
    next: string;
    nextTitle: string;
    photoAlt: string;
    // Thông báo / lỗi khi tải ảnh
    invalidFiles: string;
    maxPerUpload: (max: number) => string;
    limitNotice: (n: number, max: number) => string;
    urlProtocol: string;
    noUploadRight: string;
    pickAtLeastOne: string;
    optimizing: (n: number) => string;
    processing: string;
    uploadingN: (i: number, total: number) => string;
    uploadingOne: string;
    uploadedN: (done: number, total: number) => string;
    cloudError: string;
    needOneUrl: string;
    nothingToUpload: string;
    linkBroken: (i: number) => string;
    tooFast: string;
    saveSheetError: string;
    offline: string;
    saveError: string;
  };
};

export const uiCopy: Record<Language, UiCopy> = {
  vi: {
    profile: {
      university: "Trường Đại Học Nông Lâm TP.HCM",
      faculty: "Khoa Công Nghệ Thông Tin",
    },
    envelope: {
      badge: "THIỆP MỜI TỐT NGHIỆP",
      title: (y) => `LỄ TỐT NGHIỆP ${y}`,
      sealLabel: "Con dấu sáp - Mở thiệp",
      namePrompt: "Cho mình xin tên bạn để gọi cho thân nhé",
      namePlaceholder: "Nhập tên của bạn (không bắt buộc)",
      tapToOpen: "Chạm để mở thiệp",
    },
    hero: {
      portraitAlt: (name) => `Chân dung ${name} trong lễ phục tốt nghiệp`,
    },
    music: { on: "Bật nhạc nền", off: "Tắt nhạc nền" },
    closing: {
      shareTitle: (name) => `Lễ Tốt Nghiệp — ${name}`,
      shareText: (name) => `Thân mời bạn đến tham dự Lễ Tốt Nghiệp của ${name}!`,
      share: "Chia sẻ thiệp",
      linkCopied: "Đã sao chép liên kết",
    },
    details: {
      srDate: "Ngày",
      srVenue: "Địa điểm",
      dressFor: (g) => `${g} cứ mặc bộ nào khiến mình đẹp nhất và tự tin nhất nhé!`,
    },
    invitation: {
      privateNote: (g) => `Đôi lời gửi gắm riêng đến ${g}`,
    },
    rsvp: {
      attendee: "Người tham dự:",
      changeName: "Đổi tên khác",
      changeNameTitle: "Đổi tên người tham dự khác",
      restore: (n) => `Khôi phục (${n})`,
      restoreTitle: (n) => `Dùng lại tên trên thiệp (${n})`,
      clearName: "Xóa tên người tham dự",
      clearNameTitle: "Xóa tên để nhập tên mới",
      attendingAs: "Xác nhận tham dự với tên:",
      originalName: "Tên ban đầu trên thiệp:",
      wishesTitle: "LỜI CHÚC TỪ NGƯỜI THÂN YÊU",
    },
    gallery: {
      sync: "Đồng bộ lại kho ảnh",
      emptyCategory: (c) => `Chưa có bức ảnh nào thuộc chủ đề "${c}".`,
      emptyCategoryHint: "Hãy là người đầu tiên chia sẻ khoảnh khắc đẹp trong chủ đề này cùng Nhã nhé! ✨",
      contributeNow: "Đóng góp ảnh ngay",
      contributeTo: (c) => `Đóng góp ảnh cho "${c}" ngay`,
      showing: (a, b, n) => `Hiển thị ${a}–${b} trên ${n} bức ảnh kỷ niệm`,
      successMany: (n) => `Đã tải lên thành công ${n} bức ảnh kỷ niệm vào bộ sưu tập của Nhã!`,
      guestAccess: "QUYỀN TRUY CẬP KHÁCH MỜI",
      noPermission: "Khách mời hiện chưa được cấp quyền đóng góp ảnh cho kho kỷ niệm. Vui lòng liên hệ Nhã để mở quyền nhé! 💌",
      gotIt: "Đã hiểu",
      shareMoments: "Chia Sẻ Khoảnh Khắc",
      steps: ["Chọn ảnh", "Thông tin", "Gửi"],
      photosLabel: "Hình ảnh kỷ niệm:",
      selected: ["Đã chọn", "bức ảnh"],
      addPhoto: "Thêm ảnh",
      clearAll: "Xóa hết",
      removePhoto: "Xóa ảnh này",
      fileHint: (m) => `Hỗ trợ chọn tối đa ${m} ảnh mỗi lần (PNG, JPG, JPEG, WEBP) giúp tải nhanh & bảo toàn chất lượng`,
      addLink: "+ Thêm link",
      entered: ["Đã nhập", "liên kết ảnh"],
      urlHint: 'Dán liên kết ảnh trực tiếp (URL) và nhấn "+ Thêm link" để thêm nhiều ảnh',
      verifiedGuest: "Khách mời đã xác thực",
      newTopic: "Chủ đề mới",
      topicHint: "💡 Gợi ý: Nhập tên chủ đề bạn muốn đặt (VD: Du Lịch, Hội Bạn Thân, Kỷ Niệm Cấp 3...).",
      advanced: "Tùy chọn hiển thị nâng cao",
      priority: "Thứ tự ưu tiên:",
      priorityDefault: "Mặc định là 1",
      priorityHint: "Số càng nhỏ (1, 2, 3...) sẽ được ưu tiên hiển thị ở các trang đầu tiên.",
      uploadN: (n) => `Tải ${n} Ảnh Lên Kho Kỷ Niệm`,
      close: "Đóng xem ảnh (Phím Esc)",
      closeTitle: "Đóng (Esc)",
      prev: "Xem ảnh trước (Phím mũi tên trái)",
      prevTitle: "Ảnh trước (←)",
      next: "Xem ảnh kế tiếp (Phím mũi tên phải)",
      nextTitle: "Ảnh sau (→)",
      photoAlt: "Kỷ niệm lễ tốt nghiệp",
      invalidFiles: "Vui lòng chọn các tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP)",
      maxPerUpload: (m) => `Mỗi lần gửi tối đa ${m} ảnh để đảm bảo chất lượng và tốc độ cao nhất.`,
      limitNotice: (n, m) => `Hệ thống đã chọn ${n} ảnh đầu tiên (giới hạn tối đa ${m} ảnh mỗi lần gửi để đảm bảo tốc độ và chất lượng tốt nhất).`,
      urlProtocol: "Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://",
      noUploadRight: "Bạn không có quyền tải ảnh lên kho kỷ niệm.",
      pickAtLeastOne: "Vui lòng chọn ít nhất 1 bức ảnh từ thiết bị để tải lên",
      optimizing: (n) => `Đang tối ưu & nén (${n} ảnh)...`,
      processing: "Đang xử lý ảnh...",
      uploadingN: (i, n) => `Đang tải ảnh (${i}/${n}) lên Cloud...`,
      uploadingOne: "Đang tải ảnh lên Cloud...",
      uploadedN: (d, n) => `Đã tải xong (${d}/${n}) ảnh`,
      cloudError: "Có lỗi xảy ra khi tải ảnh lên Cloud. Vui lòng kiểm tra kết nối và thử lại!",
      needOneUrl: "Vui lòng nhập ít nhất 1 đường dẫn (link) ảnh hợp lệ",
      nothingToUpload: "Không có ảnh nào để tải lên.",
      linkBroken: (i) => `Link ảnh #${i} không thể hiển thị. Vui lòng kiểm tra lại URL!`,
      tooFast: "Bạn đang gửi yêu cầu quá nhanh. Vui lòng thử lại sau giây lát.",
      saveSheetError: "Không thể lưu thông tin ảnh. Vui lòng thử lại!",
      offline: "Thiết bị đang ngoại tuyến. Vui lòng kiểm tra kết nối mạng!",
      saveError: "Có lỗi xảy ra khi lưu ảnh. Vui lòng thử lại!",
    },
  },

  en: {
    profile: {
      university: "Nong Lam University – Ho Chi Minh City",
      faculty: "Faculty of Information Technology",
    },
    envelope: {
      badge: "OFFICIAL GRADUATION INVITATION",
      title: (y) => `GRADUATION ${y}`,
      sealLabel: "Wax seal — open the invitation",
      namePrompt: "May I have your name, so this invitation feels just for you?",
      namePlaceholder: "Your name (optional)",
      tapToOpen: "Tap to open",
    },
    hero: {
      portraitAlt: (name) => `Portrait of ${name} in graduation gown`,
    },
    music: { on: "Play background music", off: "Mute background music" },
    closing: {
      shareTitle: (name) => `Graduation Ceremony — ${name}`,
      shareText: (name) => `You're warmly invited to ${name}'s graduation ceremony!`,
      share: "Share invitation",
      linkCopied: "Link copied",
    },
    details: {
      srDate: "Date",
      srVenue: "Venue",
      dressFor: (g) => `${g}, wear whatever makes you look and feel your best and most confident!`,
    },
    invitation: {
      privateNote: (g) => `A personal note for ${g}`,
    },
    rsvp: {
      attendee: "Attendee:",
      changeName: "Change name",
      changeNameTitle: "Use a different attendee name",
      restore: (n) => `Restore (${n})`,
      restoreTitle: (n) => `Use the name on the invitation (${n})`,
      clearName: "Clear attendee name",
      clearNameTitle: "Clear to type a new name",
      attendingAs: "Attending as:",
      originalName: "Original invite name:",
      wishesTitle: "WISHES FROM LOVED ONES",
    },
    gallery: {
      sync: "Refresh gallery",
      emptyCategory: (c) => `No photos in "${c}" yet.`,
      emptyCategoryHint: "Be the first to share a lovely moment in this topic with Nha! ✨",
      contributeNow: "Add photos now",
      contributeTo: (c) => `Add photos to "${c}"`,
      showing: (a, b, n) => `Showing ${a}–${b} of ${n} photos`,
      successMany: (n) => `Successfully added ${n} photos to Nha's collection!`,
      guestAccess: "GUEST ACCESS",
      noPermission: "Photo contributions haven't been enabled for you yet. Please contact Nha to get access! 💌",
      gotIt: "Got it",
      shareMoments: "Share a Moment",
      steps: ["Photos", "Details", "Send"],
      photosLabel: "Photos:",
      selected: ["Selected", "photos"],
      addPhoto: "Add photo",
      clearAll: "Clear all",
      removePhoto: "Remove this photo",
      fileHint: (m) => `Up to ${m} photos per upload (PNG, JPG, JPEG, WEBP) — fast and full quality`,
      addLink: "+ Add link",
      entered: ["Added", "photo links"],
      urlHint: 'Paste a direct image link (URL) and tap "+ Add link" to add more photos',
      verifiedGuest: "Verified guest",
      newTopic: "New topic",
      topicHint: "💡 Tip: type the topic name you'd like (e.g. Travel, Best Friends, High School...).",
      advanced: "Advanced display options",
      priority: "Display priority:",
      priorityDefault: "Default is 1",
      priorityHint: "Smaller numbers (1, 2, 3...) are shown first.",
      uploadN: (n) => `Upload ${n} Photos`,
      close: "Close viewer (Esc)",
      closeTitle: "Close (Esc)",
      prev: "Previous photo (Left arrow)",
      prevTitle: "Previous (←)",
      next: "Next photo (Right arrow)",
      nextTitle: "Next (→)",
      photoAlt: "Graduation memory",
      invalidFiles: "Please choose valid image files (PNG, JPG, JPEG, WEBP)",
      maxPerUpload: (m) => `You can send up to ${m} photos at a time for the best speed and quality.`,
      limitNotice: (n, m) => `The first ${n} photos were selected (max ${m} photos per upload for the best speed and quality).`,
      urlProtocol: "Image links must start with http:// or https://",
      noUploadRight: "You don't have permission to upload photos.",
      pickAtLeastOne: "Please choose at least 1 photo from your device",
      optimizing: (n) => `Optimizing & compressing (${n} photos)...`,
      processing: "Processing photo...",
      uploadingN: (i, n) => `Uploading photo (${i}/${n})...`,
      uploadingOne: "Uploading photo...",
      uploadedN: (d, n) => `Uploaded (${d}/${n}) photos`,
      cloudError: "Something went wrong while uploading. Please check your connection and try again!",
      needOneUrl: "Please enter at least 1 valid image link",
      nothingToUpload: "There are no photos to upload.",
      linkBroken: (i) => `Image link #${i} can't be displayed. Please check the URL!`,
      tooFast: "You're sending requests too quickly. Please try again in a moment.",
      saveSheetError: "Couldn't save the photo details. Please try again!",
      offline: "You're offline. Please check your network connection!",
      saveError: "Something went wrong while saving. Please try again!",
    },
  },

  km: {
    profile: {
      university: "សាកលវិទ្យាល័យ ណុងឡាំ ទីក្រុងហូជីមិញ",
      faculty: "មហាវិទ្យាល័យបច្ចេកវិទ្យាព័ត៌មាន",
    },
    envelope: {
      badge: "លិខិតអញ្ជើញបញ្ចប់ការសិក្សា",
      title: (y) => `ពិធីបញ្ចប់ការសិក្សា ${y}`,
      sealLabel: "ត្រាក្រមួន - បើកលិខិតអញ្ជើញ",
      namePrompt: "សូមប្រាប់ឈ្មោះរបស់អ្នក ដើម្បីឲ្យលិខិតនេះពិសេសសម្រាប់អ្នក",
      namePlaceholder: "ឈ្មោះរបស់អ្នក (មិនចាំបាច់)",
      tapToOpen: "ចុចដើម្បីបើកលិខិត",
    },
    hero: {
      portraitAlt: (name) => `រូប ${name} ក្នុងឈុតបញ្ចប់ការសិក្សា`,
    },
    music: { on: "បើកតន្ត្រី", off: "បិទតន្ត្រី" },
    closing: {
      shareTitle: (name) => `ពិធីបញ្ចប់ការសិក្សា — ${name}`,
      shareText: (name) => `សូមគោរពអញ្ជើញចូលរួមពិធីបញ្ចប់ការសិក្សារបស់ ${name}!`,
      share: "ចែករំលែកលិខិត",
      linkCopied: "បានចម្លងតំណ",
    },
    details: {
      srDate: "កាលបរិច្ឆេទ",
      srVenue: "ទីកន្លែង",
      dressFor: (g) => `${g} សូមស្លៀកពាក់ឈុតណាដែលធ្វើឲ្យអ្នកស្អាត និងមានទំនុកចិត្តបំផុត!`,
    },
    invitation: {
      privateNote: (g) => `ពាក្យផ្ញើពិសេសជូន ${g}`,
    },
    rsvp: {
      attendee: "អ្នកចូលរួម៖",
      changeName: "ប្តូរឈ្មោះ",
      changeNameTitle: "ប្រើឈ្មោះអ្នកចូលរួមផ្សេង",
      restore: (n) => `ឈ្មោះដើម (${n})`,
      restoreTitle: (n) => `ប្រើឈ្មោះលើលិខិត (${n})`,
      clearName: "លុបឈ្មោះអ្នកចូលរួម",
      clearNameTitle: "លុបដើម្បីវាយឈ្មោះថ្មី",
      attendingAs: "ចូលរួមក្នុងនាម៖",
      originalName: "ឈ្មោះដើមលើលិខិត៖",
      wishesTitle: "ពាក្យជូនពរពីមនុស្សជាទីស្រលាញ់",
    },
    gallery: {
      sync: "ធ្វើបច្ចុប្បន្នភាពវិចិត្រសាល",
      emptyCategory: (c) => `មិនទាន់មានរូបភាពក្នុងប្រធានបទ "${c}" នៅឡើយទេ។`,
      emptyCategoryHint: "សូមក្លាយជាអ្នកដំបូងដែលចែករំលែកពេលវេលាដ៏ស្រស់ស្អាតក្នុងប្រធានបទនេះ! ✨",
      contributeNow: "បន្ថែមរូបភាពឥឡូវនេះ",
      contributeTo: (c) => `បន្ថែមរូបភាពទៅ "${c}"`,
      showing: (a, b, n) => `បង្ហាញ ${a}–${b} នៃរូបភាព ${n}`,
      successMany: (n) => `បានបន្ថែមរូបភាព ${n} ទៅក្នុងបណ្តុំអនុស្សាវរីយ៍ដោយជោគជ័យ!`,
      guestAccess: "សិទ្ធិភ្ញៀវ",
      noPermission: "អ្នកមិនទាន់មានសិទ្ធិបន្ថែមរូបភាពនៅឡើយទេ។ សូមទាក់ទង Nhã ដើម្បីបើកសិទ្ធិ! 💌",
      gotIt: "យល់ហើយ",
      shareMoments: "ចែករំលែកពេលវេលា",
      steps: ["រូបភាព", "ព័ត៌មាន", "ផ្ញើ"],
      photosLabel: "រូបភាពអនុស្សាវរីយ៍៖",
      selected: ["បានជ្រើស", "រូបភាព"],
      addPhoto: "បន្ថែមរូប",
      clearAll: "លុបទាំងអស់",
      removePhoto: "លុបរូបនេះ",
      fileHint: (m) => `អាចជ្រើសរូបរហូតដល់ ${m} ក្នុងមួយដង (PNG, JPG, JPEG, WEBP)`,
      addLink: "+ បន្ថែមតំណ",
      entered: ["បានបញ្ចូល", "តំណរូបភាព"],
      urlHint: 'បិទភ្ជាប់តំណរូបភាព (URL) ហើយចុច "+ បន្ថែមតំណ" ដើម្បីបន្ថែមរូបច្រើន',
      verifiedGuest: "ភ្ញៀវបានផ្ទៀងផ្ទាត់",
      newTopic: "ប្រធានបទថ្មី",
      topicHint: "💡 គន្លឹះ៖ វាយឈ្មោះប្រធានបទដែលអ្នកចង់បាន (ឧ. ដំណើរកម្សាន្ត មិត្តជិតស្និទ្ធ...)។",
      advanced: "ជម្រើសបង្ហាញកម្រិតខ្ពស់",
      priority: "លំដាប់អាទិភាព៖",
      priorityDefault: "លំនាំដើមគឺ 1",
      priorityHint: "លេខកាន់តែតូច (1, 2, 3...) នឹងបង្ហាញមុនគេ។",
      uploadN: (n) => `ផ្ទុករូបភាព ${n} ឡើង`,
      close: "បិទការមើលរូប (Esc)",
      closeTitle: "បិទ (Esc)",
      prev: "រូបមុន (ព្រួញឆ្វេង)",
      prevTitle: "រូបមុន (←)",
      next: "រូបបន្ទាប់ (ព្រួញស្តាំ)",
      nextTitle: "រូបបន្ទាប់ (→)",
      photoAlt: "អនុស្សាវរីយ៍បញ្ចប់ការសិក្សា",
      invalidFiles: "សូមជ្រើសឯកសាររូបភាពត្រឹមត្រូវ (PNG, JPG, JPEG, WEBP)",
      maxPerUpload: (m) => `អាចផ្ញើរូបភាពបានច្រើនបំផុត ${m} ក្នុងមួយដង។`,
      limitNotice: (n, m) => `បានជ្រើសរូបភាព ${n} ដំបូង (អតិបរមា ${m} រូបក្នុងមួយដង)។`,
      urlProtocol: "តំណរូបភាពត្រូវចាប់ផ្តើមដោយ http:// ឬ https://",
      noUploadRight: "អ្នកមិនមានសិទ្ធិផ្ទុករូបភាពឡើងទេ។",
      pickAtLeastOne: "សូមជ្រើសរូបភាពយ៉ាងហោចណាស់ 1 ពីឧបករណ៍របស់អ្នក",
      optimizing: (n) => `កំពុងបង្រួមរូបភាព (${n})...`,
      processing: "កំពុងដំណើរការរូបភាព...",
      uploadingN: (i, n) => `កំពុងផ្ទុករូបភាព (${i}/${n})...`,
      uploadingOne: "កំពុងផ្ទុករូបភាព...",
      uploadedN: (d, n) => `បានផ្ទុករួច (${d}/${n})`,
      cloudError: "មានបញ្ហាពេលផ្ទុករូបភាព។ សូមពិនិត្យការតភ្ជាប់ ហើយព្យាយាមម្តងទៀត!",
      needOneUrl: "សូមបញ្ចូលតំណរូបភាពត្រឹមត្រូវយ៉ាងហោចណាស់ 1",
      nothingToUpload: "គ្មានរូបភាពសម្រាប់ផ្ទុកទេ។",
      linkBroken: (i) => `តំណរូបភាព #${i} មិនអាចបង្ហាញបានទេ។ សូមពិនិត្យ URL ម្តងទៀត!`,
      tooFast: "អ្នកកំពុងផ្ញើសំណើលឿនពេក។ សូមព្យាយាមម្តងទៀតបន្តិចក្រោយ។",
      saveSheetError: "មិនអាចរក្សាទុកព័ត៌មានរូបភាពបានទេ។ សូមព្យាយាមម្តងទៀត!",
      offline: "ឧបករណ៍របស់អ្នកគ្មានអ៊ីនធឺណិត។ សូមពិនិត្យការតភ្ជាប់!",
      saveError: "មានបញ្ហាពេលរក្សាទុករូបភាព។ សូមព្យាយាមម្តងទៀត!",
    },
  },
};
