import { NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.MORETHANPANEL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "API key bulunamadı" },
        { status: 500 }
      );
    }

    const response = await fetch("https://morethanpanel.com/api/v2", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        key: apiKey,
        action: "services",
      }),
      cache: "no-store",
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Servisler çekilemedi", detail: String(error) },
      { status: 500 }
    );
  }
}