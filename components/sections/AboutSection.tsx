import React from "react";

interface AboutSectionProps {
  aboutTextRef: React.RefObject<HTMLDivElement | null>;
  videoContainerRef: React.RefObject<HTMLDivElement | null>;
}

export default function AboutSection({ aboutTextRef, videoContainerRef }: AboutSectionProps) {
  return (
    <section id="section-2" className="relative min-h-screen flex items-center px-6 sm:px-12 md:px-24 py-16 md:py-24 z-10 w-full">
      {/* Navigation Anchor */}
      <div id="about" className="absolute top-0 left-0" />
      
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Narrative (7 cols) */}
        <div ref={aboutTextRef} className="about-text-content lg:col-span-7 flex flex-col gap-8 text-left">
          <h2 className="font-header text-3xl sm:text-5xl md:text-6xl text-[var(--text-primary)] tracking-wider leading-none">
            About <span className="bg-clip-text text-transparent bg-gradient-to-r from-[var(--text-accent)] to-[#4f46e5]">Us</span>
          </h2>
          <p className="font-body text-sm sm:text-base md:text-lg text-[var(--text-secondary)] leading-relaxed">
            OCC Hacks is Orange Coast College&apos;s premier hackathon. Born from the legacy of HackCC—the first hackathon specifically designed to support and champion community college students—our mission is to provide an inclusive, high-energy environment for tech innovation.
          </p>
          
          {/* Highlight badges / grid */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="min-h-[8.5rem] sm:min-h-[9.5rem] flex flex-col justify-center p-5 sm:p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xs hover:border-[var(--card-2-accent)]/30 transition-all duration-300">
              <h3 className="font-header text-lg md:text-xl text-[var(--text-primary)] font-semibold">150+ Participants</h3>
              <p className="text-xs sm:text-sm text-[var(--card-desc)] mt-2">Students and builders from across Southern California</p>
            </div>
            <div className="min-h-[8.5rem] sm:min-h-[9.5rem] flex flex-col justify-center p-5 sm:p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xs hover:border-[var(--card-1-accent)]/30 transition-all duration-300">
              <h3 className="font-header text-lg md:text-xl text-[var(--text-primary)] font-semibold">Beginner Friendly</h3>
              <p className="text-xs sm:text-sm text-[var(--card-desc)] mt-2">Workshops, tracks, and 1-on-1 mentorship for all levels</p>
            </div>
            <div className="min-h-[8.5rem] sm:min-h-[9.5rem] flex flex-col justify-center p-5 sm:p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xs hover:border-[var(--card-3-accent)]/30 transition-all duration-300">
              <h3 className="font-header text-lg md:text-xl text-[var(--text-primary)] font-semibold">Meals Provided</h3>
              <p className="text-xs sm:text-sm text-[var(--card-desc)] mt-2">Breakfast, lunch, dinner, and snacks throughout the event</p>
            </div>
            <div className="min-h-[8.5rem] sm:min-h-[9.5rem] flex flex-col justify-center p-5 sm:p-6 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-xs hover:border-[var(--card-2-accent)]/30 transition-all duration-300">
              <h3 className="font-header text-lg md:text-xl text-[var(--text-primary)] font-semibold">$15,000+ in Fundraising</h3>
              <p className="text-xs sm:text-sm text-[var(--card-desc)] mt-2">Prizes, bounties, and support for the hackathon</p>
            </div>
          </div>
        </div>

        {/* Right Column: Past Hackathons panel */}
        <div
          ref={videoContainerRef}
          className="lg:col-span-5 w-full max-w-2xl mx-auto lg:mx-0 lg:ml-auto"
        >
          <div className="about-video-panel flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-[var(--card-border)] bg-[var(--card-bg)] backdrop-blur-md shadow-2xl">
            <h3 className="font-header text-2xl sm:text-3xl text-[var(--text-primary)] tracking-wider leading-none">
              Past <span className="text-black">Hackathons</span>
            </h3>

            {/* Spookathon — label on the left */}
            <div className="grid grid-cols-[5.5rem_1fr] sm:grid-cols-[6.5rem_1fr] gap-4 items-center">
              <a
                href="https://spookathon-2025.devpost.com/?ref_feature=challenge&ref_medium=discover"
                target="_blank"
                rel="noopener noreferrer"
                className="font-header text-sm sm:text-base md:text-lg font-normal leading-tight tracking-wide text-[var(--text-primary)] hover:text-[var(--card-1-accent)] hover:underline underline-offset-4 transition-colors"
              >
                Spookathon 2025
              </a>
              <div className="about-video-card group relative w-full max-w-56 sm:max-w-64 md:max-w-72 justify-self-end aspect-video rounded-2xl overflow-hidden border border-[var(--card-border)] bg-black/20 backdrop-blur-md hover:border-[var(--card-1-accent)]/30 transition-all duration-300 hover:scale-[1.01]">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/I9FVxneDnL4"
                  title="Spookathon 2025"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
            </div>

            {/* HackCC — label on the right */}
            <div className="grid grid-cols-[1fr_5.5rem] sm:grid-cols-[1fr_6.5rem] gap-4 items-center">
              <div className="about-video-card group relative w-full max-w-56 sm:max-w-64 md:max-w-72 justify-self-start aspect-video rounded-2xl overflow-hidden border border-[var(--card-border)] bg-black/20 backdrop-blur-md hover:border-[var(--text-accent)]/30 transition-all duration-300 hover:scale-[1.01]">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/vT81BYkjc8k"
                  title="HackCC 2024 Recap"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                ></iframe>
              </div>
              <a
                href="https://hackcc-23092.devpost.com/?ref_feature=challenge&ref_medium=discover"
                target="_blank"
                rel="noopener noreferrer"
                className="font-header text-sm sm:text-base md:text-lg font-semibold leading-tight tracking-wide text-[var(--text-primary)] hover:text-[var(--text-accent)] hover:underline underline-offset-4 transition-colors text-right"
              >
                HackCC 2024
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
