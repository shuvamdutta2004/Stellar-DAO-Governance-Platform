"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Landmark,
  Activity,
  History,
  Home,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/dashboard", icon: LayoutDashboard, label: "Wallet Dashboard" },
  { href: "/treasury", icon: Landmark, label: "Proposals" },
  { href: "/activity", icon: Activity, label: "Activity Feed" },
  { href: "/transactions", icon: History, label: "Transactions" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-border/50 bg-card/30 backdrop-blur-sm p-4 shrink-0">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 px-2 py-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-stellar-600 flex items-center justify-center shadow-glow-sm">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm leading-tight gradient-text">StellarDAO</div>
          <div className="text-xs text-muted-foreground">DAO Governance</div>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="space-y-1 flex-1">
        <p className="text-xs font-semibold text-muted-foreground/60 uppercase tracking-wider px-3 mb-2">
          Navigation
        </p>
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                isActive ? "nav-link-active" : "nav-link"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{label}</span>
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-stellar-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Network badge */}
      <div className="mt-4 px-3 py-3 rounded-lg bg-secondary/40 border border-border/50">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-medium text-emerald-400">Stellar Testnet</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
          {process.env.NEXT_PUBLIC_STELLAR_RPC_URL?.replace("https://", "") ?? "soroban-testnet.stellar.org"}
        </p>
      </div>
    </aside>
  );
}
