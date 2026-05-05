import crypto from "crypto";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_STATE_COOKIE = "medyatora_google_oauth_state";
const PRODUCTION_GOOGLE_REDIRECT_URL =
  "https://medyatora.store/api/auth/google/callback";

function getRedirectUrl(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return PRODUCTION_GOOGLE_REDIRECT_URL;
  }

  return (
    process.env.GOOGLE_OAUTH_REDIRECT_URL ||
    `${new URL(request.url).origin}/api/auth/google/callback`
  );
}

function createState() {
  return crypto.randomBytes(24).toString("hex");
}

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = getRedirectUrl(request);

  if (!clientId) {
    return NextResponse.json(
      {
        success: false,
        ok: false,
        error: "GOOGLE_CLIENT_ID eksik.",
      },
      { status: 500 }
    );
  }

  const state = createState();
  const authUrl = new URL(GOOGLE_AUTH_URL);

  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl.toString());

  response.cookies.set({
    name: GOOGLE_OAUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 10 * 60,
  });

  return response;
}