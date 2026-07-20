"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu } from "lucide-react";
import WalletConnectButton from "@/components/wallet/WalletConnectButton";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/treasury", label: "Proposals" },
  { href: "/activity", label: "Activity" },
  { href: "/transactions", label: "Transactions" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 lg:px-6 h-16 gap-4">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-stellar-600 flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm gradient-text">StellarDAO</span>
        </Link>

        {/* Mobile menu */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-secondary/60 transition-colors"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop breadcrumb */}
        <div className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">
            {navItems.find((n) => n.href === pathname)?.label ?? "StellarDAO"}
          </span>
        </div>

        {/* Right: network + wallet */}
        <div className="flex items-center gap-3 ml-auto">
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Testnet
          </div>
          <WalletConnectButton />
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="lg:hidden border-t border-border/50 bg-card/90 backdrop-blur-sm px-4 py-3 space-y-1 animate-fade-in"
        >
          {navItems.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === href
                  ? "bg-stellar-600/20 text-stellar-300"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              )}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
