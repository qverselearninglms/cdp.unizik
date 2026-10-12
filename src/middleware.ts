import { auth } from "@/auth";
import { NextResponse } from "next/server";

const AUTH_COOKIES_TO_CLEAR = [
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
];
const AUTH_RECOVERY_COOKIE = "cdp_auth_session_recovered";

export default auth((req) => {
    if (!req.nextUrl.pathname.startsWith("/auth/signin")) {
        return NextResponse.next();
    }

    const response = NextResponse.next();
    let clearedAnySessionCookie = false;

    for (const cookieName of AUTH_COOKIES_TO_CLEAR) {
        if (req.cookies.get(cookieName)) {
            response.cookies.delete(cookieName);
            clearedAnySessionCookie = true;
        }
    }

    if (clearedAnySessionCookie) {
        response.cookies.set(AUTH_RECOVERY_COOKIE, "1", {
            path: "/",
            maxAge: 60,
            httpOnly: false,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });
    }

    return response;
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};