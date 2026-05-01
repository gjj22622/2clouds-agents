"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Cockpit" },
  { href: "/training/tasks", label: "Training Tasks" },
  { href: "/brains", label: "Brains" },
  { href: "/knowledge-graph", label: "Knowledge Graph" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="nav" aria-label="Main navigation">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            className={isActive ? "active" : ""}
            key={item.href}
            href={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
