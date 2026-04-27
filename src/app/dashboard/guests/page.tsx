"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  MessageCircle,
  Link2,
  Trash2,
  Loader2,
  Check,
  UserPlus,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import {
  getInvitationGuests,
  addGuest,
  removeGuest,
  buildInviteUrl,
  toWaPhone,
  type Guest,
} from "@/lib/supabase/guests";
import type { PublicInvitation } from "@/lib/supabase/public-invitation";
import { cn } from "@/lib/utils";

const RSVP_LABEL: Record<string, { label: string; color: string; bg: string }> =
  {
    attending: { label: "Hadir", color: "#16a34a", bg: "#f0fdf4" },
    not_attending: { label: "Tidak Hadir", color: "#dc2626", bg: "#fef2f2" },
    pending: { label: "Belum", color: "#d97706", bg: "#fffbeb" },
  };

export default function GuestsPage() {
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
      <GuestsContent />
    </Suspense>
  );
}

function GuestsContent() {
  const params = useSearchParams();
  const router = useRouter();
  const invitationId = params.get("id") ?? "";

  const [invitation, setInvitation] = useState<PublicInvitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const fetchData = useCallback(async () => {
    if (!invitationId) {
      setLoading(false);
      return;
    }
    const [{ data: inv }, guestList] = await Promise.all([
      supabase.from("invitations").select("*").eq("id", invitationId).single(),
      getInvitationGuests(invitationId),
    ]);
    setInvitation(inv);
    setGuests(guestList);
    setLoading(false);
  }, [invitationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function handleGuestAdded(guest: Guest) {
    setGuests((prev) => [guest, ...prev]);
    setShowForm(false);
  }

  async function handleRemove(id: string) {
    await removeGuest(id);
    setGuests((prev) => prev.filter((g) => g.id !== id));
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

  if (!invitationId || !invitation) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p style={{ fontFamily: "var(--font-inter)" }}>
          Undangan tidak ditemukan.
        </p>
        <Link
          href="/dashboard"
          className="text-sm underline"
          style={{ color: "var(--primary)", fontFamily: "var(--font-inter)" }}
        >
          Kembali ke dashboard
        </Link>
      </div>
    );
  }

  const attending = guests.filter((g) => g.rsvp_status === "attending").length;
  const notAttending = guests.filter(
    (g) => g.rsvp_status === "not_attending"
  ).length;
  const pending = guests.filter((g) => g.rsvp_status === "pending").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--muted)" }}>
      {/* Navbar */}
      <nav
        className="sticky top-0 z-10 px-4 py-4"
        style={{
          background: "var(--background)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg p-2 transition-colors hover:opacity-70"
            style={{ color: "var(--muted-foreground)" }}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-sm font-semibold"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {invitation.bride_name} &amp; {invitation.groom_name}
            </p>
            <p
              className="text-xs"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Daftar Tamu · {guests.length} orang
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Tambah Tamu</span>
          </button>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-6">
        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          {[
            { label: "Hadir", value: attending, color: "#16a34a" },
            { label: "Tidak Hadir", value: notAttending, color: "#dc2626" },
            { label: "Belum", value: pending, color: "#d97706" },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1 rounded-2xl py-4"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <span
                className="text-2xl font-bold"
                style={{
                  fontFamily: "var(--font-playfair)",
                  color: s.color,
                }}
              >
                {s.value}
              </span>
              <span
                className="text-center text-xs leading-tight"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Add Guest Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 overflow-hidden"
            >
              <AddGuestForm
                invitationId={invitationId}
                onAdded={handleGuestAdded}
                onCancel={() => setShowForm(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Guest list */}
        {guests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl py-16 text-center"
            style={{
              background: "var(--background)",
              border: "1px solid var(--border)",
            }}
          >
            <Users
              className="mb-3 h-10 w-10"
              style={{ color: "var(--muted-foreground)", opacity: 0.4 }}
            />
            <p
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Belum ada tamu
            </p>
            <p
              className="mt-1 text-xs"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              Tambah tamu dan kirim undangan personal via WhatsApp.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-medium"
              style={{
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              <UserPlus className="h-4 w-4" />
              Tambah Tamu Pertama
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-3">
            {guests.map((guest, i) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                invitation={invitation}
                index={i}
                onRemove={() => handleRemove(guest.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── Add Guest Form ───────────────────────────────────────────────────────────

function AddGuestForm({
  invitationId,
  onAdded,
  onCancel,
}: {
  invitationId: string;
  onAdded: (g: Guest) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const guest = await addGuest({ invitation_id: invitationId, name, phone });
      onAdded(guest);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah tamu.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl p-5"
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="mb-4 text-sm font-semibold"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        Tambah Tamu
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama lengkap tamu *"
          required
          autoFocus
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-inter)",
          }}
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="No. WhatsApp (opsional, misal: 08123...)"
          className="w-full rounded-xl px-4 py-3 text-sm outline-none"
          style={{
            background: "var(--muted)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-inter)",
          }}
        />
        {error && (
          <p
            className="text-xs"
            style={{ color: "#dc2626", fontFamily: "var(--font-inter)" }}
          >
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !name.trim()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-inter)",
            }}
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Simpan"
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-4 py-2.5 text-sm font-medium"
            style={{
              background: "var(--muted)",
              color: "var(--muted-foreground)",
              fontFamily: "var(--font-inter)",
            }}
          >
            Batal
          </button>
        </div>
      </div>
    </form>
  );
}

// ─── Guest Card ───────────────────────────────────────────────────────────────

function GuestCard({
  guest,
  invitation,
  index,
  onRemove,
}: {
  guest: Guest;
  invitation: PublicInvitation;
  index: number;
  onRemove: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [removing, setRemoving] = useState(false);

  const rsvp = RSVP_LABEL[guest.rsvp_status] ?? RSVP_LABEL.pending;
  const inviteUrl = buildInviteUrl(invitation.slug, guest.name);
  const waMessage = buildWaMessage(guest.name, invitation, inviteUrl);
  const waPhone = guest.phone ? toWaPhone(guest.phone) : null;
  const waUrl = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(waMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRemove() {
    setRemoving(true);
    await onRemove();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn("rounded-2xl p-4", removing && "opacity-40")}
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="truncate font-semibold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {guest.name}
          </p>
          {guest.phone && (
            <p
              className="mt-0.5 text-xs"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {guest.phone}
            </p>
          )}
          {guest.message && (
            <p
              className="mt-1 line-clamp-2 text-xs italic"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              &ldquo;{guest.message}&rdquo;
            </p>
          )}
        </div>
        <span
          className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            background: rsvp.bg,
            color: rsvp.color,
            fontFamily: "var(--font-inter)",
          }}
        >
          {rsvp.label}
        </span>
      </div>

      {/* Actions */}
      <div className="mt-3 flex gap-2">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: "#25d366",
            color: "#ffffff",
            fontFamily: "var(--font-inter)",
          }}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: "var(--muted)",
            color: copied ? "#16a34a" : "var(--foreground)",
            border: "1px solid var(--border)",
            fontFamily: "var(--font-inter)",
          }}
        >
          {copied ? (
            <><Check className="h-3.5 w-3.5" />Tersalin</>
          ) : (
            <><Link2 className="h-3.5 w-3.5" />Salin Link</>
          )}
        </button>

        <button
          onClick={handleRemove}
          disabled={removing}
          className="rounded-xl p-2 transition-all hover:opacity-70 disabled:opacity-40"
          style={{ color: "#dc2626" }}
          title="Hapus tamu"
        >
          {removing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildWaMessage(
  guestName: string,
  inv: PublicInvitation,
  inviteUrl: string
): string {
  const eventDate = new Date(inv.event_date);
  const dateStr = eventDate.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = inv.event_time.slice(0, 5).replace(":", ".") + " WIB";

  return (
    `Assalamualaikum / Halo ${guestName} 👋\n\n` +
    `Dengan penuh kebahagiaan, kami mengundang Anda untuk hadir di hari istimewa kami:\n\n` +
    `💍 ${inv.bride_name} & ${inv.groom_name}\n` +
    `📅 ${dateStr}\n` +
    `🕑 ${timeStr}\n` +
    `📍 ${inv.venue_name}\n\n` +
    `Lihat undangan lengkap & konfirmasi kehadiran Anda:\n` +
    `${inviteUrl}\n\n` +
    `Kami sangat menantikan kehadiran Anda 🙏`
  );
}
