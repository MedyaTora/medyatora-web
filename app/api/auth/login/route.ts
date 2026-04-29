import { NextResponse } from "next/server";
import { clearUserSession } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearUserSession();

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("LOGOUT_ERROR", error);

    return NextResponse.json(
      { ok: false, error: "Çıkış yapılamadı." },
      { status: 500 }
    );
  }
}