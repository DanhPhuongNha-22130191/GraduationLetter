"use client";

import React from "react";
import { LanguageProvider } from "@/context/language-context";
import { GuestProvider } from "@/context/guest-context";
import { ParticleCanvas } from "@/components/particle-canvas";
import { HeroSection } from "@/components/hero";
import { InvitationSection } from "@/components/invitation";
import { GraduationInfoSection } from "@/components/graduation-info";
import { CountdownSection } from "@/components/countdown";
import { JourneySection } from "@/components/journey";
import { GallerySection } from "@/components/gallery";
import { LocationSection } from "@/components/location";
import { RsvpSection } from "@/components/rsvp";
import { ClosingSection } from "@/components/closing";
import { MobileNav } from "@/components/mobile-nav";
import { MusicToggle } from "@/components/music-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { EnvelopeOverlay } from "@/components/envelope-overlay";

export default function Home() {
  return (
    <LanguageProvider>
      <GuestProvider>
        <main className="relative min-h-screen w-full overflow-hidden bg-ivory">
          {/* Background Ambient Gold Sparkle Particle System */}
          <ParticleCanvas />

          {/* Envelope Opening Screen Modal */}
          <EnvelopeOverlay />

          {/* Floating Controls */}
          <LanguageToggle />
          <MusicToggle />

          {/* Main Single Page Sections */}
          <HeroSection />
          <InvitationSection />
          <GraduationInfoSection />
          <CountdownSection />
          <JourneySection />
          <GallerySection />
          <LocationSection />
          <RsvpSection />
          <ClosingSection />

          {/* Mobile Floating Navigation */}
          <MobileNav />
        </main>
      </GuestProvider>
    </LanguageProvider>
  );
}

