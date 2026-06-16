import React from "react";

export default function SponsorsSection() {
  return (
    <section id="sponsors" className="relative min-h-screen flex items-center px-6 sm:px-12 md:px-24 py-12 z-10 w-full border-t border-[var(--card-border)]/40 bg-black/5">
      <div className="w-full grid grid-cols-1 gap-12 text-left">
        <div className="flex flex-col gap-4">
          <span className="inline-block text-[10px] sm:text-xs md:text-sm uppercase tracking-[0.2em] text-[var(--text-accent)] font-bold mb-1">
            Partners & Sponsors
          </span>
          <h2 className="font-header text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider leading-none">
            Supporting <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[#4f46e5]">the Future of Tech</span>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            Our sponsors make OCC Hacks possible. Join industry leaders in empowering the next generation of tech creators and community college developers.
          </p>
        </div>

        <div className="flex flex-col gap-12 mt-4">
          {/* Platinum Tiers */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-mono text-[#fbbf24] uppercase tracking-[0.25em] font-bold">Platinum Partners</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group border border-amber-500/20 bg-[var(--card-bg)] hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] backdrop-blur-md px-8 py-10 rounded-2xl transition-all duration-300 flex items-center justify-center h-[140px] cursor-pointer">
                <span className="font-header text-xl sm:text-2xl text-[var(--text-primary)] opacity-85 group-hover:opacity-100 transition-opacity">OCC Division of Technology</span>
              </div>
              <div className="group border border-amber-500/20 bg-[var(--card-bg)] hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.1)] backdrop-blur-md px-8 py-10 rounded-2xl transition-all duration-300 flex items-center justify-center h-[140px] cursor-pointer">
                <span className="font-header text-xl sm:text-2xl text-[var(--text-primary)] opacity-85 group-hover:opacity-100 transition-opacity">Google Cloud</span>
              </div>
            </div>
          </div>

          {/* Gold Tiers */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-mono text-[var(--card-2-accent)] uppercase tracking-[0.25em] font-bold">Gold Sponsors</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-2-accent)]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] backdrop-blur-md p-6 rounded-xl transition-all duration-300 flex items-center justify-center h-[100px] cursor-pointer">
                <span className="font-header text-sm sm:text-base text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity">GitHub</span>
              </div>
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-2-accent)]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] backdrop-blur-md p-6 rounded-xl transition-all duration-300 flex items-center justify-center h-[100px] cursor-pointer">
                <span className="font-header text-sm sm:text-base text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity">Vercel</span>
              </div>
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-2-accent)]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] backdrop-blur-md p-6 rounded-xl transition-all duration-300 flex items-center justify-center h-[100px] cursor-pointer">
                <span className="font-header text-sm sm:text-base text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity">GSAP</span>
              </div>
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[var(--card-2-accent)]/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.08)] backdrop-blur-md p-6 rounded-xl transition-all duration-300 flex items-center justify-center h-[100px] cursor-pointer">
                <span className="font-header text-sm sm:text-base text-[var(--text-secondary)] opacity-80 group-hover:opacity-100 transition-opacity">Retool</span>
              </div>
            </div>
          </div>

          {/* Silver Tiers */}
          <div className="flex flex-col gap-4">
            <span className="text-[10px] font-mono text-[#c084fc] uppercase tracking-[0.25em] font-bold">Silver & Bronze Tiers</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#c084fc]/30 hover:shadow-[0_0_20px_rgba(192,132,252,0.08)] backdrop-blur-md p-6 rounded-lg transition-all duration-300 flex items-center justify-center h-[80px] cursor-pointer">
                <span className="font-body text-xs sm:text-sm text-[var(--card-desc)] opacity-70 group-hover:opacity-100 transition-opacity">StandOut Stickers</span>
              </div>
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#c084fc]/30 hover:shadow-[0_0_20px_rgba(192,132,252,0.08)] backdrop-blur-md p-6 rounded-lg transition-all duration-300 flex items-center justify-center h-[80px] cursor-pointer">
                <span className="font-body text-xs sm:text-sm text-[var(--card-desc)] opacity-70 group-hover:opacity-100 transition-opacity">Major League Hacking</span>
              </div>
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#c084fc]/30 hover:shadow-[0_0_20px_rgba(192,132,252,0.08)] backdrop-blur-md p-6 rounded-lg transition-all duration-300 flex items-center justify-center h-[80px] cursor-pointer">
                <span className="font-body text-xs sm:text-sm text-[var(--card-desc)] opacity-70 group-hover:opacity-100 transition-opacity">Wolfram Language</span>
              </div>
              <div className="group border border-[var(--card-border)] bg-[var(--card-bg)] hover:border-[#c084fc]/30 hover:shadow-[0_0_20px_rgba(192,132,252,0.08)] backdrop-blur-md p-6 rounded-lg transition-all duration-300 flex items-center justify-center h-[80px] cursor-pointer">
                <span className="font-body text-xs sm:text-sm text-[var(--card-desc)] opacity-70 group-hover:opacity-100 transition-opacity">OCC CS Club</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
