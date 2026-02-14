import { NextRequest, NextResponse } from "next/server";

const VALID_USERNAME = process.env.AUTH_USERNAME || "admin";
const VALID_PASSWORD = process.env.AUTH_PASSWORD || "admin123";

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();

  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("auth_token", "authenticated", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }

  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
