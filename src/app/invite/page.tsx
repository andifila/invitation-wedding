"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Calendar, Clock, Heart, Loader2 } from "lucide-react";
import {
  getInvitationBySlug,
  type PublicInvitation,
} from "@/lib/supabase/public-invitation";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2
            className="h-8 w-8 animate-spin"
            style={{ color: "var(--primary)" }}
          />
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}

function InviteContent() {
  const params = useSearchParams();
  const slug = params.get("s") ?? "";
  const guestName = params.get("to") ?? "";

  const [invite, setInvite] = useState<PublicInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    getInvitationBySlug(slug)
      .then((data) => {
        if (!data) setNotFound(true);
        else setInvite(data);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2
          className="h-8 w-8 animate-spin"
          style={{ color: "var(--primary)" }}
        />
      </div>
    );
  }

  if (notFound || !invite) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ background: "var(--muted)" }}
      >
        <p
          className="text-lg"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--primary)" }}
        >
          Undangan tidak ditemukan
        </p>
        <p
          className="text-sm"
          style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
        >
          Tautan mungkin tidak valid atau undangan belum dipublikasikan.
        </p>
      </div>
    );
  }

  return <InvitationView invite={invite} guestName={guestName} />;
}

function InvitationView({
  invite,
  guestName,
}: {
  invite: PublicInvitation;
  guestName: string;
}) {
  const eventDate = new Date(invite.event_date);
  const dayName = eventDate.toLocaleDateString("id-ID", { weekday: "long" });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString("id-ID", { month: "long" });
  const year = eventDate.getFullYear();

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(eventDate));

  useEffect(() => {
    const interval = setInterval(
      () => setTimeLeft(getTimeLeft(eventDate)),
      1000
    );
    return () => clearInterval(interval);
  }, [eventDate]);

  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--background)" }}
    >
      {/* Hero */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16"
        style={{ background: "var(--muted)" }}
      >
        {/* Decorative rings */}
        <Ornament />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center text-center"
        >
          {/* To guest */}
          {guestName && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-8 flex flex-col items-center gap-1"
            >
              <p
                className="text-xs uppercase tracking-widest"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Kepada Yth.
              </p>
              <p
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {guestName}
              </p>
            </motion.div>
          )}

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-3 text-xs uppercase tracking-[0.3em]"
            style={{
              color: "var(--primary)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Undangan Pernikahan
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-5xl font-bold leading-tight sm:text-6xl md:text-7xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {invite.bride_name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="my-4"
          >
            <Heart
              className="h-8 w-8"
              style={{ color: "var(--primary)" }}
              fill="currentColor"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-5xl font-bold leading-tight sm:text-6xl md:text-7xl"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {invite.groom_name}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-8 flex items-center gap-3"
          >
            <div
              className="h-px w-12"
              style={{ background: "var(--primary)", opacity: 0.4 }}
            />
            <p
              className="text-sm uppercase tracking-widest"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {dayName}, {day} {month} {year}
            </p>
            <div
              className="h-px w-12"
              style={{ background: "var(--primary)", opacity: 0.4 }}
            />
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            className="flex flex-col items-center gap-1"
          >
            <div
              className="h-6 w-px"
              style={{ background: "var(--primary)", opacity: 0.5 }}
            />
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--primary)" }}
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Custom message */}
      {invite.custom_message && (
        <FadeSection>
          <section className="px-6 py-16 text-center">
            <div className="mx-auto max-w-xl">
              <div
                className="mb-4 text-2xl"
                style={{ color: "var(--primary)" }}
              >
                ✦
              </div>
              <p
                className="text-base leading-relaxed sm:text-lg"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: "var(--muted-foreground)",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{invite.custom_message}&rdquo;
              </p>
            </div>
          </section>
        </FadeSection>
      )}

      {/* Event details */}
      <FadeSection>
        <section
          className="px-6 py-16"
          style={{ background: "var(--muted)" }}
        >
          <div className="mx-auto max-w-xl">
            <SectionTitle>Waktu &amp; Tempat</SectionTitle>

            <div className="mt-8 flex flex-col gap-5">
              <DetailRow
                icon={<Calendar className="h-5 w-5" style={{ color: "var(--primary)" }} />}
                label="Hari &amp; Tanggal"
                value={`${dayName}, ${day} ${month} ${year}`}
              />
              <DetailRow
                icon={<Clock className="h-5 w-5" style={{ color: "var(--primary)" }} />}
                label="Waktu"
                value={formatTime(invite.event_time)}
              />
              <DetailRow
                icon={<MapPin className="h-5 w-5" style={{ color: "var(--primary)" }} />}
                label={invite.venue_name}
                value={invite.venue_address}
              />
            </div>

            <a
              href={`https://maps.google.com?q=${encodeURIComponent(invite.venue_name + " " + invite.venue_address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all hover:opacity-80"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              <MapPin className="h-4 w-4" />
              Lihat di Google Maps
            </a>
          </div>
        </section>
      </FadeSection>

      {/* Countdown */}
      {timeLeft && (
        <FadeSection>
          <section className="px-6 py-16 text-center">
            <div className="mx-auto max-w-xl">
              <SectionTitle>Menghitung Hari</SectionTitle>
              <div className="mt-8 grid grid-cols-4 gap-3">
                {[
                  { value: timeLeft.days, label: "Hari" },
                  { value: timeLeft.hours, label: "Jam" },
                  { value: timeLeft.minutes, label: "Menit" },
                  { value: timeLeft.seconds, label: "Detik" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-1 rounded-2xl py-4"
                    style={{
                      background: "var(--muted)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <span
                      className="text-3xl font-bold sm:text-4xl"
                      style={{
                        fontFamily: "var(--font-playfair)",
                        color: "var(--primary)",
                      }}
                    >
                      {String(item.value).padStart(2, "0")}
                    </span>
                    <span
                      className="text-xs uppercase tracking-wider"
                      style={{
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </FadeSection>
      )}

      {/* Footer */}
      <footer
        className="px-6 py-12 text-center"
        style={{ background: "var(--muted)" }}
      >
        <p
          className="text-2xl font-bold"
          style={{ fontFamily: "var(--font-playfair)", color: "var(--primary)" }}
        >
          {invite.bride_name} &amp; {invite.groom_name}
        </p>
        <p
          className="mt-2 text-xs uppercase tracking-widest"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {day} {month} {year}
        </p>
        <div
          className="mx-auto mt-6 h-px w-16"
          style={{ background: "var(--border)" }}
        />
        <p
          className="mt-4 text-xs"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Dibuat dengan ❤️ menggunakan Wedding Invite
        </p>
      </footer>
    </main>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function Ornament() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      <svg
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]"
        width="600"
        height="600"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="90" stroke="#b08d57" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="70" stroke="#b08d57" strokeWidth="0.5" />
        <circle cx="100" cy="100" r="50" stroke="#b08d57" strokeWidth="0.5" />
        <line x1="10" y1="100" x2="190" y2="100" stroke="#b08d57" strokeWidth="0.5" />
        <line x1="100" y1="10" x2="100" y2="190" stroke="#b08d57" strokeWidth="0.5" />
        <line x1="29" y1="29" x2="171" y2="171" stroke="#b08d57" strokeWidth="0.5" />
        <line x1="171" y1="29" x2="29" y2="171" stroke="#b08d57" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

function FadeSection({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <p
        className="text-xs uppercase tracking-[0.3em]"
        style={{ color: "var(--primary)", fontFamily: "var(--font-inter)" }}
      >
        {children}
      </p>
      <div
        className="h-px w-16"
        style={{ background: "var(--primary)", opacity: 0.3 }}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex gap-4 rounded-xl p-4"
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {label}
        </p>
        <p
          className="mt-0.5 text-sm"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatTime(time: string) {
  const [h, m] = time.split(":");
  const hour = parseInt(h);
  const period = hour < 12 ? "Pagi" : hour < 15 ? "Siang" : hour < 18 ? "Sore" : "Malam";
  return `${h}.${m} WIB (${period})`;
}

function getTimeLeft(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}
