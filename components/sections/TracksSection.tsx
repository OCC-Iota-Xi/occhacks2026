import React from "react";

export default function TracksSection() {
  return (
    <section id="tracks" className="relative min-h-screen flex items-center px-6 sm:px-12 md:px-24 py-12 z-10 w-full border-t border-[var(--card-border)]/40 bg-black/10">
      <div className="w-full grid grid-cols-1 gap-12 text-left">
        <div className="flex flex-col gap-4">
          <span className="inline-block text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text-accent)] font-bold mb-1">
            Choose Your Adventure
          </span>
          <h2 className="font-header text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider leading-none">
            Epic <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[#4f46e5]">Hackathon Tracks</span>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Whether you&apos;re a first-time coder or a veteran build-master, we have a track tailored for your crew. Claim bounty, win prizes, and push limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          {/* Card 1: Cosmos Cadet */}
          <div className="group relative border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#fbbf24]/40 hover:shadow-[0_0_30px_rgba(251,191,36,0.15)] backdrop-blur-md p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-[320px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-[#fbbf24] tracking-wider font-mono">01 // COSMOS CADET (BEGINNER)</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#fbbf24]/10 border border-[#fbbf24]/20 text-[#fbbf24] rounded-full font-semibold">Starter Friendly</span>
              </div>
              <h3 className="font-header text-lg sm:text-xl text-[var(--text-primary)] mb-3">Beginner Track</h3>
              <p className="text-sm text-[var(--card-desc)] leading-relaxed">
                First time hacking? Build any web or mobile project, explore new frameworks, and learn from our mentors. No experience required.
              </p>
            </div>
            <div className="text-[10px] font-mono text-[#fbbf24]/60 uppercase tracking-widest mt-4">Launch Level: Starter</div>
          </div>

          {/* Card 2: Deep Space Voyage */}
          <div className="group relative border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-2-accent)]/40 hover:shadow-[0_0_30px_rgba(34,211,238,0.15)] backdrop-blur-md p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-[320px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-[var(--card-2-accent)] tracking-wider font-mono">02 // DEEP SPACE VOYAGE (SE)</span>
                <span className="text-[10px] px-2 py-0.5 bg-[var(--card-2-accent)]/10 border border-[var(--card-2-accent)]/20 text-[var(--card-2-accent)] rounded-full font-semibold">General Dev</span>
              </div>
              <h3 className="font-header text-lg sm:text-xl text-[var(--text-primary)] mb-3">Software Engineering</h3>
              <p className="text-sm text-[var(--card-desc)] leading-relaxed">
                Design scalable APIs, clean frontends, or full-stack tools. Tackle complex system integrations, dev tools, or community solutions.
              </p>
            </div>
            <div className="text-[10px] font-mono text-[var(--card-2-accent)]/60 uppercase tracking-widest mt-4">Launch Level: Intermediate</div>
          </div>

          {/* Card 3: Cyber Bounty */}
          <div className="group relative border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#c084fc]/40 hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] backdrop-blur-md p-8 rounded-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between h-[320px]">
            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="text-xs font-bold text-[#c084fc] tracking-wider font-mono">03 // CYBER BOUNTY (AI / WEB3)</span>
                <span className="text-[10px] px-2 py-0.5 bg-[#c084fc]/10 border border-[#c084fc]/20 text-[#c084fc] rounded-full font-semibold">Advanced Tech</span>
              </div>
              <h3 className="font-header text-lg sm:text-xl text-[var(--text-primary)] mb-3">AI & Web3 Bounty</h3>
              <p className="text-sm text-[var(--card-desc)] leading-relaxed">
                Integrate large language models, build autonomous AI agents, train custom models, or create decentralized web3 applications.
              </p>
            </div>
            <div className="text-[10px] font-mono text-[#c084fc]/60 uppercase tracking-widest mt-4">Launch Level: Advanced</div>
          </div>
        </div>
      </div>
    </section>
  );
}
