import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { adminLimiter, getIp } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email)) {
    return NextResponse.json(
      { error: "Acesso negado." },
      { status: 403 },
    );
  }

  const ip = getIp(request);
  const { success } = await adminLimiter.limit(`${user.id}:${ip}`);
  if (!success) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente mais tarde." },
      { status: 429 },
    );
  }

  const { data, error } = await supabase.rpc("get_platform_users");

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json({ users: data });
}
