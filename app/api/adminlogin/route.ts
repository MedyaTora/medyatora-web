import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, route: 'adminlogin works' })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    if (
      body.username !== process.env.ADMIN_USERNAME ||
      body.password !== process.env.ADMIN_PASSWORD
    ) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre yanlış' },
        { status: 401 }
      )
    }

    const res = NextResponse.json({ success: true })

    res.cookies.set('medyatora_admin', process.env.ADMIN_SECRET || 'fallback_secret', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return res
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sunucu hatası' },
      { status: 500 }
    )
  }
}