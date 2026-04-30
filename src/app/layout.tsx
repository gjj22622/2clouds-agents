import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "2clouds Agents",
  description: "双云 AI 行銷部訓練與營運平台",
};

const navItems = [
  { href: "/", label: "Cockpit" },
  { href: "/training/tasks", label: "Training Tasks" },
  { href: "/brains", label: "Brains" },
  { href: "/knowledge-graph", label: "Knowledge Graph" },
];

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
            <nav className="nav" aria-label="Main navigation">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
