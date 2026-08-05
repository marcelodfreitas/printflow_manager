// import { NextResponse, type NextRequest } from "next/server";
// import { updateSession } from "@/lib/supabase/middleware";
// import { getIp, pageLimiter } from "@/lib/rate-limit";

// export async function middleware(request: NextRequest) {
//   const { success } = await pageLimiter.limit(getIp(request));
//   if (!success) {
//     return NextResponse.json(
//       { error: "Muitas requisições. Tente novamente mais tarde." },
//       { status: 429 },
//     );
//   }

//   return await updateSession(request);
// }

// export const config = {
//   matcher: [
//     "/((?!api|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
//   ],
// };

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // console.log("MIDDLEWARE EXECUTOU");
  return NextResponse.next();
}

export const config = {
  matcher: ["/:path*"],
};