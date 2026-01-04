"use client";
import React, { useState } from "react";
import Navigation from "@/components/Navigation";
import { useGritState, DOMAINS } from "@/components/GritStateProvider";
import { useDomain } from "@/components/providers/DomainProvider";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import GlitchText from "@/components/ui/GlitchText";
import { Crown, Shield, BookOpen, ChevronRight, TrendingUp } from "lucide-react";
import DiscordConnect from "@/components/DiscordConnect";
import config from "@/config/artist.config.json";
import { FluidAudioPlayer } from "@/components/domain/sovereign/FluidAudioPlayer";

export default function LandingPage() {
  const { setCurrentDomain, gritBalance, stakedAmount } = useGritState();
  const { domain, setDomain: setGlobalDomain } = useDomain();
  const router = useRouter();
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  const selectDomain = (domain: string) => {
    // @ts-ignore: Domain string is safe here
    setCurrentDomain(domain as any);
    // Sync the visual provider too
    setGlobalDomain(domain.toLowerCase() as any);

    router.push(`/domain/${domain.toLowerCase()}`);
  };

  const domainVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    hover: {
      scale: 1.02,
      transition: { duration: 0.2 }
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-amber-500/30 overflow-hidden relative">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 bg-[url('/bg-texture.png')] opacity-10 pointer-events-none mix-blend-overlay"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/0 via-transparent to-black/0 pointer-events-none"></div>

      <Navigation />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pb-20">

        {/* HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-12 w-full max-w-4xl mx-auto"
        >
          {domain === 'sovereign' ? (
            <div className="mb-8">
              <FluidAudioPlayer />
              {/* Tiny Monospaced Controls in the margins */}
              <div className="absolute bottom-0 left-0 p-8 font-mono text-[10px] text-[var(--domain-text-muted)] uppercase leading-relaxed opacity-50">
                Frequency_Node: ACTIVE <br />
                Neural_Sync: {stakedAmount > 0 ? 'ESTABLISHED' : 'PENDING'} <br />
                Fluid_Density: {((gritBalance || 0) / 100).toFixed(1)}%
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm md:text-base text-gray-400 tracking-[0.5em] uppercase">
                PROTOCOL ONLINE // {config.artist.symbol}
              </div>
              <h1 className="text-6xl md:text-9xl font-black tracking-tighter mb-6 relative">
                <span className="block md:inline">ENTER THE</span>
                <br className="hidden md:block" />
                <GlitchText text="REALITY" size="2xl" className="text-[var(--domain-accent)]" />
              </h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-light leading-relaxed"
              >
                {config.artist.curation_ethos}
              </motion.p>
            </>
          )}

        </motion.div>

        {/* DOMAIN SELECTOR */}
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl relative">

          {/* SOVEREIGN */}
          <motion.div
            variants={domainVariants}
            initial="initial"
            animate="animate"
            whileHover="hover"
            onClick={() => selectDomain(DOMAINS.SOVEREIGN)}
            onMouseEnter={() => setHoveredDomain(DOMAINS.SOVEREIGN)}
            onMouseLeave={() => setHoveredDomain(null)}
            className="relative cursor-pointer p-8 h-80 flex flex-col justify-end bg-gradient-to-t from-zinc-900/80 to-transparent border border-white/5 hover:border-amber-500/30 group transition-colors rounded-xl overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Crown className="w-12 h-12 text-amber-500 mb-6 relative z-10" />
            <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
              SOVEREIGN <ChevronRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-amber-500" />
            </h2>
            <p className="text-sm text-gray-400 relative z-10">Control your own destiny. Active Passive Income streams enabled.</p>
          </motion.div>

          {/* ASCESIS */}
          <motion.div
            variants={domainVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.1 }}
            whileHover="hover"
            onClick={() => selectDomain(DOMAINS.ASCESIS)}
            onMouseEnter={() => setHoveredDomain(DOMAINS.ASCESIS)}
            onMouseLeave={() => setHoveredDomain(null)}
            className="relative cursor-pointer p-8 h-80 flex flex-col justify-end bg-gradient-to-t from-zinc-900/80 to-transparent border border-white/5 hover:border-red-500/30 group transition-colors rounded-xl overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-red-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Shield className="w-12 h-12 text-red-500 mb-6 relative z-10" />
            <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
              ASCESIS <ChevronRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-red-500" />
            </h2>
            <p className="text-sm text-gray-400 relative z-10">Value through verification. The path of the verified.</p>
            <div className="mt-4 inline-flex items-center px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400 font-mono relative z-10">
              FIREWALL ACTIVE
            </div>
          </motion.div>


          {/* HERITAGE */}
          <motion.div
            variants={domainVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            whileHover="hover"
            onClick={() => selectDomain(DOMAINS.HERITAGE)}
            onMouseEnter={() => setHoveredDomain(DOMAINS.HERITAGE)}
            onMouseLeave={() => setHoveredDomain(null)}
            className="relative cursor-pointer p-8 h-80 flex flex-col justify-end bg-gradient-to-t from-zinc-900/80 to-transparent border border-white/5 hover:border-blue-500/30 group transition-colors rounded-xl overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <BookOpen className="w-12 h-12 text-blue-500 mb-6 relative z-10" />
            <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
              HERITAGE <ChevronRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-blue-500" />
            </h2>
            <p className="text-sm text-gray-400 relative z-10">Legacy and Time. Long-term staking and governance power.</p>
          </motion.div>

          {/* MARKET */}
          <motion.div
            variants={domainVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.3 }}
            whileHover="hover"
            onClick={() => selectDomain(DOMAINS.MARKET)}
            onMouseEnter={() => setHoveredDomain(DOMAINS.MARKET)}
            onMouseLeave={() => setHoveredDomain(null)}
            className="col-span-1 md:col-span-3 lg:col-span-3 xl:col-span-1 relative cursor-pointer p-8 h-80 flex flex-col justify-end bg-gradient-to-t from-zinc-900/80 to-transparent border border-white/5 hover:border-emerald-500/30 group transition-colors rounded-xl overflow-hidden backdrop-blur-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <TrendingUp className="w-12 h-12 text-emerald-500 mb-6 relative z-10" />
            <h2 className="text-3xl font-bold mb-2 relative z-10 flex items-center">
              THE MARKET <ChevronRight className="w-5 h-5 ml-2 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-500" />
            </h2>
            <p className="text-sm text-gray-400 relative z-10">Algorithmic Liquidity. Buy and Sell GRIT directly from the Protocol.</p>
          </motion.div>

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="mt-24 w-full flex flex-col items-center gap-6"
        >
          <DiscordConnect />
          <p className="text-[#444] text-[10px] uppercase tracking-[0.4em]">
            Returning Essence? <a href="/login" className="text-[var(--domain-accent)] hover:text-white transition-colors">SignIn</a>
          </p>
        </motion.div>

      </main>
    </div>
  );
}
