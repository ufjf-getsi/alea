import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import { NavBar } from "@/components/layout/navBar/navBar";
import "./globals.css";

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
        <main>
          <NavBar />
          {children}
        </main>
      </body>
    </html>
  );
}
