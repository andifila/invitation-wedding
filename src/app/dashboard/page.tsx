"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  LogOut,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  getUserInvitations,
  type InvitationStat,
} from "@/lib/supabase/invitations";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [invitations, setInvitations] = useState<InvitationStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUserInvitations()
      .then(setInvitations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

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
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span
            className="text-lg font-bold"
            style={{ fontFamily: "var(--font-playfair)", color: "var(--primary)" }}
          >
            Wedding Invite
          </span>

          <div className="flex items-center gap-3">
            <span
              className="hidden text-sm sm:block"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {user?.email}
            </span>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm transition-colors hover:opacity-80"
              style={{
                background: "var(--muted)",
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl font-bold sm:text-3xl"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Undangan Saya
            </h1>
            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--muted-foreground)",
                fontFamily: "var(--font-inter)",
              }}
            >
              {loading
                ? "Memuat..."
                : `${invitations.length} undangan`}
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
              "hover:opacity-90 active:scale-95"
            )}
            style={{
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontFamily: "var(--font-inter)",
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Buat Undangan</span>
          </Link>
        </div>

        {/* States */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center py-24"
            >
              <Loader2
                className="h-8 w-8 animate-spin"
                style={{ color: "var(--primary)" }}
              />
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl p-8 text-center"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <p
                className="text-sm"
                style={{ color: "#dc2626", fontFamily: "var(--font-inter)" }}
              >
                {error}
              </p>
            </motion.div>
          ) : invitations.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center rounded-2xl px-4 py-24 text-center"
              style={{
                background: "var(--background)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ background: "var(--muted)" }}
              >
                <Calendar
                  className="h-7 w-7"
                  style={{ color: "var(--primary)" }}
                />
              </div>
              <h2
                className="text-lg font-semibold"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                Belum ada undangan
              </h2>
              <p
                className="mt-2 max-w-xs text-sm"
                style={{
                  color: "var(--muted-foreground)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                Buat undangan pernikahan digital pertama Anda dan bagikan ke
                tamu lewat WhatsApp.
              </p>
              <Link
                href="/dashboard/new"
                className="mt-6 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-all hover:opacity-90"
                style={{
                  background: "var(--primary)",
                  color: "var(--primary-foreground)",
                  fontFamily: "var(--font-inter)",
                }}
              >
                <Plus className="h-4 w-4" />
                Buat Undangan Pertama
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {invitations.map((inv, i) => (
                <InvitationCard key={inv.invitation_id} inv={inv} index={i} formatDate={formatDate} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function InvitationCard({
  inv,
  index,
  formatDate,
}: {
  inv: InvitationStat;
  index: number;
  formatDate: (d: string) => string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.35 }}
      className="flex flex-col rounded-2xl p-5"
      style={{
        background: "var(--background)",
        border: "1px solid var(--border)",
      }}
    >
      {/* Status badge */}
      <div className="mb-3 flex items-center justify-between">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
          style={{
            background: inv.is_published ? "#f0fdf4" : "var(--muted)",
            color: inv.is_published ? "#16a34a" : "var(--muted-foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background: inv.is_published ? "#16a34a" : "var(--muted-foreground)",
            }}
          />
          {inv.is_published ? "Dipublikasikan" : "Draft"}
        </span>

        <Link
          href={`/invite/?s=${inv.slug}`}
          target="_blank"
          className="rounded-lg p-1.5 transition-colors hover:opacity-70"
          style={{ color: "var(--muted-foreground)" }}
          title="Lihat undangan"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Couple names */}
      <h3
        className="text-lg font-semibold leading-snug"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {inv.bride_name} & {inv.groom_name}
      </h3>

      {/* Date */}
      <p
        className="mt-1 flex items-center gap-1.5 text-sm"
        style={{
          color: "var(--muted-foreground)",
          fontFamily: "var(--font-inter)",
        }}
      >
        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
        {formatDate(inv.event_date)}
      </p>

      {/* Stats */}
      <div
        className="mt-4 grid grid-cols-3 gap-2 rounded-xl p-3"
        style={{ background: "var(--muted)" }}
      >
        <Stat icon={<Users className="h-3.5 w-3.5" />} label="Total" value={inv.total_guests} />
        <Stat icon={<CheckCircle className="h-3.5 w-3.5" style={{ color: "#16a34a" }} />} label="Hadir" value={inv.attending} />
        <Stat icon={<Clock className="h-3.5 w-3.5" style={{ color: "#d97706" }} />} label="Belum" value={inv.pending} />
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <Link
          href={`/dashboard/edit?id=${inv.invitation_id}`}
          className="flex-1 rounded-xl py-2 text-center text-sm font-medium transition-all hover:opacity-90"
          style={{
            background: "var(--primary)",
            color: "var(--primary-foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Edit
        </Link>
        <Link
          href={`/dashboard/guests?id=${inv.invitation_id}`}
          className="flex-1 rounded-xl py-2 text-center text-sm font-medium transition-colors hover:opacity-70"
          style={{
            background: "var(--muted)",
            color: "var(--foreground)",
            fontFamily: "var(--font-inter)",
          }}
        >
          Tamu
        </Link>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span style={{ color: "var(--muted-foreground)" }}>{icon}</span>
      <span
        className="text-base font-semibold"
        style={{ fontFamily: "var(--font-inter)" }}
      >
        {value}
      </span>
      <span
        className="text-xs"
        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
      >
        {label}
      </span>
    </div>
  );
}
