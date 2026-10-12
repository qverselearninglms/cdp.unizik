import { auth } from "@/auth";
import { NextResponse } from "next/server";

const AUTH_COOKIES_TO_CLEAR = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
];

export default auth((req) => {
    if (!req.nextUrl.pathname.startsWith("/auth/signin")) {
        return NextResponse.next();
    }

    const response = NextResponse.next();

    for (const cookieName of AUTH_COOKIES_TO_CLEAR) {
        if (req.cookies.get(cookieName)) {
            response.cookies.delete(cookieName);
        }
    }

    return response;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};