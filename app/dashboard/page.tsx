"use client";

import { useWallet } from "@/hooks/useWallet";
import { useTreasury } from "@/hooks/useTreasury";
import { useEffect, useState } from "react";
import {
  Wallet,
  Network,
  Coins,
  Copy,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  ShieldCheck,
  Shield,
} from "lucide-react";
import {
  formatAddress,
  getAccountExplorerUrl,
  stroopsToXlm,
} from "@/lib/utils";
import { getSorobanServer } from "@/lib/stellar/client";
import { toast } from "sonner";

function InfoRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/40 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${mono ? "font-mono" : ""} truncate max-w-[60%] text-right`}>
        {value}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { isConnected, address, walletId, connect, disconnect } = useWallet();
  const { isSigner, isSignerLoading } = useTreasury();
  const [xlmBalance, setXlmBalance] = useState<string | null>(null);
  const [ledger, setLedger] = useState<number | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const contractId = process.env.NEXT_PUBLIC_TREASURY_CONTRACT_ID ?? "";

  const copyAddress = () => {
    if (address) { navigator.clipboard.writeText(address); toast.success("Address copied!"); }
  };

  useEffect(() => {
    if (!address) return;
    setIsLoadingBalance(true);
    const server = getSorobanServer();
    server.getAccount(address)
      .then((acct: any) => {
        const native = acct.balances.find((b: any) => b.asset_type === "native");
        setXlmBalance(native?.balance ?? "0");
      })
      .catch(() => setXlmBalance(null))
      .finally(() => setIsLoadingBalance(false));

    server.getLatestLedger().then((l: any) => setLedger(l.sequence)).catch(() => {});
  }, [address]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          View your wallet details, network information, and signer status
        </p>
      </div>

      {!isConnected ? (
        <div className="glass-card p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-stellar-600/20 border border-stellar-500/20 flex items-center justify-center mx-auto">
            <Wallet className="w-8 h-8 text-stellar-400" />
          </div>
          <h2 className="text-xl font-semibold">Connect Your Wallet</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Connect a Stellar wallet to view your balance, address, and signer status.
          </p>
          <button onClick={connect} id="dashboard-connect-btn" className="btn-primary px-6 py-3 flex items-center gap-2 mx-auto">
            <Wallet className="w-4 h-4" />
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card p-6 space-y-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-stellar-400" />
                  Wallet Info
                </h2>
                <button
                  onClick={disconnect}
                  id="dashboard-disconnect-btn"
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Disconnect
                </button>
              </div>
              <InfoRow label="Wallet" value={walletId ?? "Connected"} />
              <div className="flex items-center justify-between py-2.5 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Address</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm truncate max-w-[180px]">{formatAddress(address!, 8)}</span>
                  <button onClick={copyAddress} className="p-1 hover:bg-secondary/60 rounded transition-colors">
                    <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                  <a
                    href={getAccountExplorerUrl(address!)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 hover:bg-secondary/60 rounded transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                  </a>
                </div>
              </div>
              <InfoRow label="Network" value={process.env.NEXT_PUBLIC_STELLAR_NETWORK ?? "testnet"} />
              <div className="flex items-center justify-between py-2.5">
                <span className="text-sm text-muted-foreground">XLM Balance</span>
                {isLoadingBalance ? (
                  <div className="h-4 w-24 skeleton-pulse rounded" />
                ) : (
                  <span className="text-sm font-bold text-cyan-400">
                    {xlmBalance !== null ? `${Number(xlmBalance).toLocaleString()} XLM` : "—"}
                  </span>
                )}
              </div>
            </div>

            {/* Full Address */}
            <div className="glass-card p-4">
              <p className="text-xs text-muted-foreground mb-2">Full Public Key</p>
              <div className="flex items-center gap-2 bg-secondary/30 rounded-lg p-3">
                <p className="font-mono text-xs text-foreground break-all flex-1">{address}</p>
                <button onClick={copyAddress} className="shrink-0 p-2 hover:bg-white/10 rounded transition-colors">
                  <Copy className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: signer status + network */}
          <div className="space-y-4">
            {/* Signer status */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-stellar-400" />
                Signer Status
              </h3>
              {isSignerLoading ? (
                <div className="h-16 skeleton-pulse rounded-lg" />
              ) : isSigner ? (
                <div className="flex flex-col items-center gap-2 py-3">
                  <ShieldCheck className="w-10 h-10 text-emerald-400" />
                  <p className="font-semibold text-emerald-400">Registered Signer</p>
                  <p className="text-xs text-muted-foreground text-center">
                    You can create proposals and vote in this treasury
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 py-3">
                  <AlertTriangle className="w-10 h-10 text-yellow-400" />
                  <p className="font-semibold text-yellow-400">Not a Signer</p>
                  <p className="text-xs text-muted-foreground text-center">
                    Your address is not registered as a treasury signer
                  </p>
                </div>
              )}
            </div>

            {/* Network info */}
            <div className="glass-card p-5 space-y-1">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Network className="w-4 h-4 text-cyan-400" />
                Network
              </h3>
              <InfoRow label="Latest Ledger" value={ledger ? `#${ledger.toLocaleString()}` : "—"} />
              <InfoRow label="Contract" value={contractId ? formatAddress(contractId, 6) : "Not configured"} mono />
            </div>

            {/* Friendbot */}
            <div className="glass-card p-5">
              <h3 className="font-semibold mb-2">Need Test XLM?</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Use Friendbot to fund your testnet account.
              </p>
              <a
                href={`https://friendbot.stellar.org?addr=${address}`}
                target="_blank"
                rel="noopener noreferrer"
                id="friendbot-link"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-stellar-600/20 hover:bg-stellar-600/30 text-stellar-300 border border-stellar-500/20 rounded-lg text-sm transition-colors"
              >
                <Coins className="w-4 h-4" />
                Fund with Friendbot
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
