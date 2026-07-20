import Link from "next/link";
import {
  Shield,
  ArrowRight,
  Zap,
  Users,
  Activity,
  Lock,
  CheckCircle2,
  Globe,
  Vote,
  ScrollText,
} from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Multi-Sig Governance",
    description:
      "Decisions are made only when N-of-M DAO members approve. No single member can unilaterally act — true decentralization.",
    color: "text-stellar-400 bg-stellar-500/10 border-stellar-500/20",
  },
  {
    icon: ScrollText,
    title: "On-Chain Proposals",
    description:
      "Any DAO member can submit a governance proposal. All proposal data is stored transparently on the Soroban smart contract.",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    icon: Vote,
    title: "Democratic Voting",
    description:
      "Members cast approve or reject votes on-chain. A live progress bar shows real-time consensus towards the approval threshold.",
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: Activity,
    title: "Real-Time Event Feed",
    description:
      "Watch governance events stream in live. Every vote, proposal, and execution is recorded and displayed instantly via Soroban RPC.",
    color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  },
  {
    icon: Lock,
    title: "Non-Custodial",
    description:
      "Built on Soroban. You control your keys — connect with Freighter, xBull, ALBEDO, Lobstr, or Rabet. Your DAO, your rules.",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: Globe,
    title: "Stellar Testnet",
    description:
      "Deployed to the Stellar Testnet. Get free XLM from Friendbot and participate in DAO governance risk-free.",
    color: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 py-8">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stellar-600/10 border border-stellar-500/20 text-stellar-400 text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-stellar-400 animate-pulse" />
          Live on Stellar Testnet
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="gradient-text">DAO Governance</span>
          <br />
          <span className="text-foreground">Built on Soroban</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          A fully on-chain DAO governance platform. Submit proposals, vote as a
          community, and execute decisions — all governed by a Soroban smart
          contract on Stellar.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/treasury"
            id="hero-cta-proposals"
            className="flex items-center gap-2 btn-primary px-6 py-3 text-base"
          >
            View Proposals
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/dashboard"
            id="hero-cta-dashboard"
            className="flex items-center gap-2 btn-ghost px-6 py-3 text-base border border-border/60 hover:border-border rounded-lg"
          >
            Open Dashboard
          </Link>
        </div>
      </section>

      {/* Stats bar */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: "Smart Contract", value: "Soroban", sub: "Rust-based" },
          { label: "Network", value: "Testnet", sub: "Stellar" },
          { label: "Governance", value: "DAO", sub: "On-Chain" },
        ].map(({ label, value, sub }) => (
          <div key={label} className="glass-card p-4 text-center">
            <p className="text-2xl font-bold gradient-text">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{label}</p>
            <p className="text-xs text-muted-foreground/60">{sub}</p>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">How It Works</h2>
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "01",
              title: "Join as a Member",
              desc: "Connect your Freighter or any supported Stellar wallet. Your public key registers you as a DAO member.",
            },
            {
              step: "02",
              title: "Create a Proposal",
              desc: "Submit a governance proposal: specify the recipient, amount in XLM, and a description of the initiative.",
            },
            {
              step: "03",
              title: "Vote & Execute",
              desc: "Members vote approve or reject on-chain. Once the threshold is reached, any member can execute the decision.",
            },
          ].map(({ step, title, desc }) => (
            <div key={step} className="glass-card p-5 space-y-3 relative overflow-hidden">
              <span className="absolute top-3 right-4 text-5xl font-black text-stellar-950/50">
                {step}
              </span>
              <div className="w-8 h-8 rounded-lg bg-stellar-600/20 border border-stellar-500/20 flex items-center justify-center text-stellar-400 text-sm font-bold">
                {step}
              </div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-center">Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="glass-card-hover p-5 space-y-3">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-card p-8 text-center space-y-4 glow-border">
        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
        <h2 className="text-2xl font-bold">Ready to govern your DAO?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Connect a Stellar wallet and start participating in on-chain governance on the testnet right now.
        </p>
        <Link
          href="/treasury"
          className="inline-flex items-center gap-2 btn-primary px-6 py-3"
          id="bottom-cta-proposals"
        >
          Launch Governance
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
