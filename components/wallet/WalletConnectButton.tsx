"use client";

import { Wallet, LogOut, ChevronDown, Copy, ExternalLink } from "lucide-react";
import { useWallet } from "@/hooks/useWallet";
import { formatAddress, getAccountExplorerUrl } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function WalletConnectButton() {
  const { isConnected, address, walletId, connect, disconnect } = useWallet();
  const [open, setOpen] = useState(false);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success("Address copied!");
      setOpen(false);
    }
  };

  if (!isConnected || !address) {
    return (
      <button
        onClick={connect}
        id="connect-wallet-btn"
        className="flex items-center gap-2 bg-stellar-600 hover:bg-stellar-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-glow-sm active:scale-[0.98]"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        id="wallet-menu-btn"
        className="flex items-center gap-2 bg-secondary/80 hover:bg-secondary border border-border/60 hover:border-stellar-500/40 text-foreground font-medium px-3 py-2 rounded-lg text-sm transition-all duration-200"
      >
        <div className="w-5 h-5 rounded-full bg-stellar-600 flex items-center justify-center">
          <Wallet className="w-3 h-3 text-white" />
        </div>
        <span className="font-mono text-xs">{formatAddress(address)}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-card border border-border/60 rounded-xl shadow-xl z-50 overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-border/50">
              <p className="text-xs text-muted-foreground mb-1">Connected via {walletId ?? "Wallet"}</p>
              <p className="font-mono text-sm text-foreground font-medium break-all">{address}</p>
            </div>
            <div className="p-2 space-y-1">
              <button
                onClick={handleCopy}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Address
              </button>
              <a
                href={`https://stellar.expert/explorer/testnet/contract/${process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
              <div className="border-t border-border/50 my-1" />
              <button
                onClick={() => { disconnect(); setOpen(false); }}
                id="disconnect-wallet-btn"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
