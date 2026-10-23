import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { NavBar } from "@/components/layout/navBar/navBar";
import { NavBarSkeleton } from "@/components/layout/navBar/navBarSkeleton";
import "./globals.css";
import { Suspense } from "react";

const geistSans = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alea",
    template: "%s | Alea",
  },
  description: "",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} `}>
      <body>
        <Suspense fallback={<NavBarSkeleton />}>
          <NavBar />
        </Suspense>
        <main>{children}</main>
      </body>
    </html>
  );
}
