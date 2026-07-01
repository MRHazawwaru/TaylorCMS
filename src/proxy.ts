import { withAuth } from "next-auth/middleware";

export default withAuth(
  {
    callbacks: {
      // Mengizinkan masuk hanya jika user memiliki token dan rolenya adalah ADMIN
      authorized: ({ token }) => token?.role === "ADMIN",
    },
    pages: {
      signIn: "/admin/login", // Redirect otomatis ke sini jika tidak punya akses
    },
  }
);

export const config = {
  /*
   * Mengunci halaman /admin dan semua sub-halamannya (seperti /admin/services),
   * tetapi mengecualikan kata 'login' agar halaman login admin tetap bisa diakses publik.
   * Jalur /api, _next (statis), dan favicon tidak akan pernah tersentuh oleh gembok ini.
   */
  matcher: ["/admin", "/admin/((?!login).*)"],
};