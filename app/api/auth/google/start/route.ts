import crypto from "crypto";
import { NextResponse } from "next/server";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_OAUTH_STATE_COOKIE = "medyatora_google_oauth_state";

function getBaseUrl(request: Request) {
  const envRedirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URL;

  if (envRedirectUrl) {
    try {
      const url = new URL(envRedirectUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Env bozuksa request origin'e düşer.
    }
  }

  return new URL(request.url).origin;
}

function getRedirectUrl(request: Request) {
  const envRedirectUrl = process.env.GOOGLE_OAUTH_REDIRECT_URL;

  if (envRedirectUrl) {
    return envRedirectUrl;
  }

  return `${getBaseUrl(request)}/api/auth/google/callback`;
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