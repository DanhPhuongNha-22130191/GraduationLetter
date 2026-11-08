import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  checkPassword,
  createSessionToken,
  isAdminConfigured,
  isAdminRequest,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
  maxAge,
});

/** Trạng thái đăng nhập */
export async function GET(request: Request) {
  return NextResponse.json(
    { configured: isAdminConfigured(), loggedIn: isAdminRequest(request) },
    { headers: { "Cache-Control": "no-store" } }
  );
}

/** Đăng nhập */
export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { success: false, error: "Chưa cấu hình ADMIN_PASSWORD trên Vercel" },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    // ignore
  }

  if (!password || !checkPassword(password)) {
    // Làm chậm việc dò mật khẩu
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ success: false, error: "Sai mật khẩu" }, { status: 401 });
  }

  const token = createSessionToken();
  if (!token) {
    return NextResponse.json({ success: false, error: "Không tạo được phiên đăng nhập" }, { status: 500 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, token, cookieOptions(ADMIN_SESSION_SECONDS));
  return res;
}

/** Đăng xuất */
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_COOKIE, "", cookieOptions(0));
  return res;
}
