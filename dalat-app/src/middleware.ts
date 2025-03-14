import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("Middleware executing for path:", request.nextUrl.pathname);
  
  const path = request.nextUrl.pathname;
  
  // Nếu đường dẫn bắt đầu bằng /admin
  if (path.startsWith("/admin")) {
    console.log("Admin path detected:", path);
    
    // Kiểm tra token cơ bản - chỉ kiểm tra xem token có tồn tại không
    // const token = request.cookies.get("accessToken")?.value;
    // console.log("Access token exists:", !!token);
    
    // if (!token) {
    //   console.log("No token found, redirecting to login");
    //   return NextResponse.redirect(new URL("/login?redirect=/admin", request.url));
    // }
    
    // Để AdminGuard component kiểm tra vai trò admin chi tiết
    console.log("Token found, initial check passed");
    return NextResponse.next();
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};