import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { authLimiter, getIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getIp(request);

  const { success } = await authLimiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        error: "Muitas tentativas de login. Aguarde alguns minutos e tente novamente.",
      },
      {
        status: 429,
      },
    );
  }

  const body = await request.json().catch(() => ({}));

  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { error: "Informe e-mail e senha." },
      { status: 400 },
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );

  console.log("ANTES DO LOGIN");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("ERRO SUPABASE LOGIN:", error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 401,
      },
    );
  }

  if (data.session) {
    console.log(
      "ACCESS TOKEN LENGTH:",
      data.session.access_token.length
    );

    console.log(
      "APP METADATA:",
      JSON.stringify(data.user?.app_metadata)
    );

    console.log(
      "USER METADATA:",
      JSON.stringify(data.user?.user_metadata)
    );
  }

  return NextResponse.json({
    success: true,
    user: data.user,
  });
}