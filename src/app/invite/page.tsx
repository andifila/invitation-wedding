"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Calendar, Clock, Heart, Loader2, CheckCircle, Phone, MessageSquare, User, Music, Music2 } from "lucide-react";
import {
  getInvitationBySlug,
  getPublicMessages,
  type PublicInvitation,
  type GuestMessage,
} from "@/lib/supabase/public-invitation";
import { submitRsvp } from "@/lib/supabase/rsvp";
import { cn } from "@/lib/utils";

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
  const [messages, setMessages] = useState<GuestMessage[]>([]);
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
        if (!data) { setNotFound(true); return; }
        setInvite(data);
        return getPublicMessages(data.id);
      })
      .then((msgs) => { if (msgs) setMessages(msgs); })
      .finally(() => setLoading(false));
  }, [slug]);

  function refreshMessages(invitationId: string) {
    getPublicMessages(invitationId).then(setMessages);
  }

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

  return (
    <InvitationView
      invite={invite}
      guestName={guestName}
      messages={messages}
      onRsvpSuccess={() => refreshMessages(invite.id)}
    />
  );
}

const TEMPLATE_THEMES: Record<
  string,
  { primary: string; muted: string; border: string }
> = {
  "garden-bloom":   { primary: "#4a7c59", muted: "#e8f4e8", border: "#c5dfc5" },
  "rustic-gold":    { primary: "#b08d57", muted: "#f3f0eb", border: "#e8e2d9" },
  "modern-minimal": { primary: "#1a1a1a", muted: "#f5f5f5", border: "#e0e0e0" },
  "royal-elegance": { primary: "#6b35a3", muted: "#f5f0fa", border: "#d4b8f0" },
  "floral-dream":   { primary: "#c06080", muted: "#fdf0f5", border: "#f0c0d0" },
};

function InvitationView({
  invite,
  guestName,
  messages,
  onRsvpSuccess,
}: {
  invite: PublicInvitation;
  guestName: string;
  messages: GuestMessage[];
  onRsvpSuccess: () => void;
}) {
  const theme =
    TEMPLATE_THEMES[invite.template_slug ?? "rustic-gold"] ??
    TEMPLATE_THEMES["rustic-gold"];
  const hasCover = !!invite.cover_image_url;

  const eventDate = new Date(invite.event_date);
  const dayName = eventDate.toLocaleDateString("id-ID", { weekday: "long" });
  const day = eventDate.getDate();
  const month = eventDate.toLocaleDateString("id-ID", { month: "long" });
  const year = eventDate.getFullYear();

  const [timeLeft, setTimeLeft] = useState(getTimeLeft(eventDate));
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const interval = setInterval(
      () => setTimeLeft(getTimeLeft(eventDate)),
      1000
    );
    return () => clearInterval(interval);
  }, [eventDate]);

  useEffect(() => {
    if (!invite.music_url) return;
    const audio = new Audio(invite.music_url);
    audio.loop = true;
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, [invite.music_url]);

  function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (musicPlaying) {
      audio.pause();
      setMusicPlaying(false);
    } else {
      audio.play().then(() => setMusicPlaying(true)).catch(() => {});
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: "var(--background)",
        // @ts-expect-error css vars override
        "--primary": theme.primary,
        "--muted": theme.muted,
        "--border": theme.border,
      }}
    >
      {/* Floating music button */}
      {invite.music_url && (
        <button
          onClick={toggleMusic}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all hover:opacity-80"
          style={{ background: "var(--primary)", color: "#fff" }}
          aria-label={musicPlaying ? "Pause musik" : "Putar musik"}
        >
          {musicPlaying ? <Music className="h-5 w-5" /> : <Music2 className="h-5 w-5" />}
        </button>
      )}

      {/* Hero */}
      <section
        className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16"
        style={{
          background: invite.cover_image_url ? "transparent" : "var(--muted)",
        }}
      >
        {invite.cover_image_url && (
          <>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${invite.cover_image_url})` }}
            />
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.45)" }} />
          </>
        )}
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
                  color: hasCover ? "rgba(255,255,255,0.75)" : "var(--muted-foreground)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Kepada Yth.
              </p>
              <p
                className="text-xl font-semibold"
                style={{ color: hasCover ? "#fff" : undefined, fontFamily: "var(--font-playfair)" }}
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
              color: hasCover ? "rgba(255,255,255,0.85)" : "var(--primary)",
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
            style={{ color: hasCover ? "#fff" : undefined, fontFamily: "var(--font-playfair)" }}
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
            style={{ color: hasCover ? "#fff" : undefined, fontFamily: "var(--font-playfair)" }}
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
              style={{ background: hasCover ? "rgba(255,255,255,0.5)" : "var(--primary)", opacity: 0.6 }}
            />
            <p
              className="text-sm uppercase tracking-widest"
              style={{
                color: hasCover ? "rgba(255,255,255,0.8)" : "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {dayName}, {day} {month} {year}
            </p>
            <div
              className="h-px w-12"
              style={{ background: hasCover ? "rgba(255,255,255,0.5)" : "var(--primary)", opacity: 0.6 }}
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

      {/* RSVP */}
      <FadeSection>
        <RsvpSection
          invitationId={invite.id}
          defaultName={guestName}
          onSuccess={onRsvpSuccess}
        />
      </FadeSection>

      {/* Guest messages */}
      {messages.length > 0 && (
        <FadeSection>
          <section
            className="px-6 py-16"
            style={{ background: "var(--muted)" }}
          >
            <div className="mx-auto max-w-xl">
              <SectionTitle>Ucapan &amp; Doa</SectionTitle>
              <div className="mt-8 flex flex-col gap-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className="rounded-2xl p-5"
                    style={{
                      background: "var(--background)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p
                        className="text-sm font-semibold"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {m.name}
                      </p>
                      <span
                        className="shrink-0 rounded-full px-2.5 py-0.5 text-xs"
                        style={{
                          background:
                            m.rsvp_status === "attending"
                              ? "#f0fdf4"
                              : "var(--muted)",
                          color:
                            m.rsvp_status === "attending"
                              ? "#16a34a"
                              : "var(--muted-foreground)",
                          fontFamily: "var(--font-inter)",
                        }}
                      >
                        {m.rsvp_status === "attending"
                          ? "Hadir ✓"
                          : "Tidak Hadir"}
                      </span>
                    </div>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "var(--muted-foreground)",
                        fontFamily: "var(--font-inter)",
                        fontStyle: "italic",
                      }}
                    >
                      &ldquo;{m.message}&rdquo;
                    </p>
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

// ─── RSVP Section ─────────────────────────────────────────────────────────────

type RsvpState = "idle" | "submitting" | "done" | "error";

function RsvpSection({
  invitationId,
  defaultName,
  onSuccess,
}: {
  invitationId: string;
  defaultName: string;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"attending" | "not_attending">("attending");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<RsvpState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setState("submitting");
    setErrorMsg("");

    try {
      await submitRsvp({
        invitation_id: invitationId,
        name,
        phone,
        rsvp_status: status,
        message,
      });
      setState("done");
      onSuccess();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setState("error");
    }
  }

  return (
    <section className="px-6 py-16" style={{ background: "var(--background)" }}>
      <div className="mx-auto max-w-xl">
        <SectionTitle>Konfirmasi Kehadiran</SectionTitle>

        <AnimatePresence mode="wait">
          {state === "done" ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
              style={{
                background: "var(--muted)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "#f0fdf4" }}
              >
                <CheckCircle className="h-8 w-8" style={{ color: "#16a34a" }} />
              </div>
              <div>
                <p
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  Terima kasih, {name}!
                </p>
                <p
                  className="mt-1 text-sm"
                  style={{
                    color: "var(--muted-foreground)",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {status === "attending"
                    ? "Kami menantikan kehadiran Anda 🎉"
                    : "Konfirmasi Anda sudah kami terima."}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="mt-8 flex flex-col gap-4"
            >
              {/* Attendance toggle */}
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    { val: "attending", label: "Hadir ✓" },
                    { val: "not_attending", label: "Tidak Hadir" },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setStatus(opt.val)}
                    className={cn(
                      "rounded-xl py-3 text-sm font-medium transition-all",
                    )}
                    style={{
                      background:
                        status === opt.val ? "var(--primary)" : "var(--muted)",
                      color:
                        status === opt.val
                          ? "var(--primary-foreground)"
                          : "var(--muted-foreground)",
                      fontFamily: "var(--font-inter)",
                      border:
                        status === opt.val
                          ? "1px solid var(--primary)"
                          : "1px solid var(--border)",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Name */}
              <FormField
                icon={<User className="h-4 w-4" />}
                label="Nama"
                required
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama lengkap Anda"
                  required
                  className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:opacity-50"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </FormField>

              {/* Phone */}
              <FormField
                icon={<Phone className="h-4 w-4" />}
                label="No. WhatsApp (opsional)"
              >
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full bg-transparent py-0.5 text-sm outline-none placeholder:opacity-50"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </FormField>

              {/* Message */}
              <FormField
                icon={<MessageSquare className="h-4 w-4" />}
                label="Ucapan &amp; Doa (opsional)"
              >
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tulis ucapan atau doa untuk pasangan..."
                  rows={3}
                  className="w-full resize-none bg-transparent py-0.5 text-sm outline-none placeholder:opacity-50"
                  style={{ fontFamily: "var(--font-inter)" }}
                />
              </FormField>

              {state === "error" && (
                <p
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontFamily: "var(--font-inter)",
                  }}
                >
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={state === "submitting" || !name.trim()}
                className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-60"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {state === "submitting" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Kirim Konfirmasi"
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function FormField({
  icon,
  label,
  required,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex gap-3 rounded-xl px-4 py-3"
      style={{
        background: "var(--muted)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="mt-0.5 flex-shrink-0"
        style={{ color: "var(--primary)" }}
      >
        {icon}
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <label
          className="text-xs uppercase tracking-wider"
          style={{
            color: "var(--muted-foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {label}
          {required && <span style={{ color: "var(--primary)" }}> *</span>}
        </label>
        {children}
      </div>
    </div>
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
