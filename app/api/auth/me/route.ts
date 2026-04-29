import { NextResponse } from "next/server";
import { getCurrentUser, getPublicUser } from "@/lib/auth/current-user";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({
        ok: true,
        user: null,
      });
    }

    return NextResponse.json({
      ok: true,
      user: getPublicUser(currentUser),
    });
  } catch (error) {
    console.error("AUTH_ME_ERROR", error);

    return NextResponse.json(
      {
        ok: false,
        user: null,
        error: "Kullanıcı bilgisi alınamadı.",
      },
      { status: 500 }
    );
  }
}