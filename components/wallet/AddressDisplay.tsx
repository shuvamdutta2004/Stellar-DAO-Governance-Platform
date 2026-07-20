"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";
import { formatAddress } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AddressDisplayProps {
  address: string;
  chars?: number;
  className?: string;
  showCopy?: boolean;
}

export default function AddressDisplay({
  address,
  chars = 4,
  className,
  showCopy = true,
}: AddressDisplayProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="font-mono text-sm">{formatAddress(address, chars)}</span>
      {showCopy && (
        <button
          onClick={handleCopy}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title="Copy address"
        >
          <Copy className="w-3 h-3 text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
