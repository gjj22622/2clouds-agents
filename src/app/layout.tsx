import type { Metadata } from "next";
import Link from "next/link";
import { Navigation } from "@/components/Navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "2clouds Agents",
  description: "双云 AI 行銷部訓練與營運平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link className="brand" href="/">
              双云 AI 行銷部
            </Link>
            <Navigation />
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
