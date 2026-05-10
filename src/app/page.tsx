"use client";

import Link from "next/link";

const RACE_DATE = new Date("2026-09-27");

function getDaysUntil() {
  const today = new Date();
  const diff = RACE_DATE.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function LandingPage() {
  const daysLeft = getDaysUntil();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--bg)" }}>
      {/* Logo + wordmark */}
      <div className="mb-12 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black" style={{ background: "var(--orange)", color: "#fff" }}>
            IS
          </div>
          <span className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>IronSuhba</span>
        </div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>Augusta 70.3 · September 27, 2026</p>
      </div>

      {/* Race countdown */}
      <div className="card mb-10 px-8 py-6 text-center" style={{ minWidth: 280 }}>
        <div className="text-5xl font-black mb-2" style={{ color: "var(--orange)" }}>{daysLeft}</div>
        <div className="text-sm font-medium" style={{ color: "var(--muted)" }}>days until race day</div>
        <div className="mt-4 text-xs" style={{ color: "var(--muted)" }}>
          Swim 1.2mi · Bike 56mi · Run 13.1mi
        </div>
      </div>

      {/* Auth CTA */}
      <div className="flex flex-col items-center gap-4 w-full max-w-xs">
        <a
          href="/api/auth/strava"
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold text-sm transition-all"
          style={{ background: "#FC4C02", color: "#fff" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
          Connect with Strava
        </a>

        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center py-3 px-6 rounded-xl text-sm font-medium transition-all"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--muted)" }}
        >
          Preview dashboard (no login)
        </Link>
      </div>

      <p className="mt-8 text-xs text-center" style={{ color: "var(--muted)", maxWidth: 300 }}>
        Connects to your Strava account to pull training data. AI analyzes your week and adapts the plan automatically.
      </p>
    </div>
  );
}
