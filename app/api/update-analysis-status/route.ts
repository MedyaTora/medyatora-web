import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ANALYSIS_STATUSES = [
  "pending",
  "in_review",
  "contacted",
  "completed",
] as const;

type AnalysisStatus = (typeof ALLOWED_ANALYSIS_STATUSES)[number];

function createAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase environment variables eksik.");
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

function isValidAnalysisStatus(value: unknown): value is AnalysisStatus {
  return (
    typeof value === "string" &&
    ALLOWED_ANALYSIS_STATUSES.includes(value as AnalysisStatus)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const id = typeof body?.id === "string" ? body.id.trim() : "";
    const status = body?.status;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Geçerli başvuru id ve status gerekli." },
        { status: 400 }
      );
    }

    if (!isValidAnalysisStatus(status)) {
      return NextResponse.json(
        { error: "Geçersiz başvuru durumu." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();

    const { data: existingItem, error: existingError } = await supabase
      .from("analysis_requests")
      .select("id, status")
      .eq("id", id)
      .single();

    if (existingError || !existingItem) {
      return NextResponse.json(
        { error: existingError?.message || "Başvuru bulunamadı." },
        { status: 404 }
      );
    }

    const { error: updateError } = await supabase
      .from("analysis_requests")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || "Başvuru güncellenemedi." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        id,
        previousStatus: existingItem.status,
        nextStatus: status,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Sunucu hatası oluştu.",
      },
      { status: 500 }
    );
  }
}