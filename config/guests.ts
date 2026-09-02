import { GuestPronounMode } from "@/context/guest-context";

export interface GuestProfile {
  name: string;
  mode: GuestPronounMode;
  customMessage?: string;
  specialPhoto?: string;
}

/**
 * Danh sách khách mời đặc biệt / VIP / Bạn bè thân thiết (Được cấu hình sẵn)
 * Bạn có thể thêm bất kỳ ai vào đây để có:
 * 1. Link siêu ngắn đẹp: ?u=giabao hoặc ?u=thayhoang
 * 2. Tùy biến tâm thư riêng cho từng người
 */
export const guestRegistry: Record<string, GuestProfile> = {
  // Ví dụ bạn bè thân thiết:
  giabao: {
    name: "Gia Bảo",
    mode: "friend",
    customMessage:
      "Cảm ơn Bảo vì những năm tháng đại học luôn đồng hành, cùng nhau thức trắng đêm làm đồ án và chia sẻ mọi niềm vui nỗi buồn. Sự hiện diện của Bảo là niềm vui lớn của Nhã!",
  },
  
  // Ví dụ Thầy Cô / Người lớn:
  thayhoang: {
    name: "Thầy Hoàng",
    mode: "elder",
    customMessage:
      "Con xin gửi lời tri ân sâu sắc nhất đến Thầy vì sự chỉ dạy tận tình, truyền cảm hứng và tiếp thêm tri thức cho con suốt hành trình đại học tại Khoa CNTT.",
  },

  // Ví dụ Anh / Chị / Tiền bối:
  anhnam: {
    name: "Anh Nam",
    mode: "senior",
    customMessage:
      "Em cảm ơn Anh vì luôn là người anh gương mẫu, định hướng và chia sẻ cho em nhiều kinh nghiệm quý báu trong học tập cũng như công việc.",
  },

  // Ví dụ Đàn em / Hậu bối:
  belinh: {
    name: "Bé Linh",
    mode: "junior",
    customMessage:
      "Cảm ơn em đã luôn ủng hộ và chia sẻ cùng anh. Chúc em cũng sẽ có một hành trình đại học thật rực rỡ và thành công!",
  },
};

/**
 * Tra cứu thông tin khách mời qua slug (không phân biệt hoa thường, hỗ trợ dấu gạch ngang)
 */
export function findGuestBySlug(slug: string): GuestProfile | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase().replace(/[-_]/g, "");
  
  for (const [key, profile] of Object.entries(guestRegistry)) {
    if (key.toLowerCase().replace(/[-_]/g, "") === normalized) {
      return profile;
    }
  }
  return null;
}
