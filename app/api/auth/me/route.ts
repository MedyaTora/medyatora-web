import { NextResponse } from "next/server";
import { getCurrentUser, getPublicUser } from "@/lib/auth/current-user";

export async function GET() {
  try {
    const user = await getCurrentUser();

    return NextResponse.json({
      ok: true,
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("ME_ERROR", error);

    return NextResponse.json(
      { ok: false, user: null, error: "Kullanıcı bilgisi alınamadı." },
      { status: 500 }
    );
  }
}