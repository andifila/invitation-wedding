"use client";

import { useEffect, useState } from "react";
import { Loader2, Crown } from "lucide-react";
import {
  getTemplates,
  generateSlug,
  type Template,
  type Invitation,
} from "@/lib/supabase/invitation-crud";
import { cn } from "@/lib/utils";

export type FormValues = {
  template_id: string;
  bride_name: string;
  groom_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  custom_message: string;
  slug: string;
  is_published: boolean;
};

type Props = {
  initial?: Partial<FormValues>;
  submitting: boolean;
  error: string;
  onSubmit: (values: FormValues) => void;
  submitLabel: string;
};

const TEMPLATE_COLORS: Record<string, { bg: string; accent: string; label: string }> = {
  "garden-bloom":   { bg: "#e8f4e8", accent: "#4a7c59", label: "Garden Bloom" },
  "rustic-gold":    { bg: "#f3f0eb", accent: "#b08d57", label: "Rustic Gold" },
  "modern-minimal": { bg: "#f5f5f5", accent: "#1a1a1a", label: "Modern Minimal" },
  "royal-elegance": { bg: "#f5f0fa", accent: "#6b35a3", label: "Royal Elegance" },
  "floral-dream":   { bg: "#fdf0f5", accent: "#c06080", label: "Floral Dream" },
};

export default function InvitationForm({
  initial,
  submitting,
  error,
  onSubmit,
  submitLabel,
}: Props) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [values, setValues] = useState<FormValues>({
    template_id: initial?.template_id ?? "",
    bride_name: initial?.bride_name ?? "",
    groom_name: initial?.groom_name ?? "",
    event_date: initial?.event_date ?? "",
    event_time: initial?.event_time ?? "10:00",
    venue_name: initial?.venue_name ?? "",
    venue_address: initial?.venue_address ?? "",
    custom_message: initial?.custom_message ?? "",
    slug: initial?.slug ?? "",
    is_published: initial?.is_published ?? false,
  });
  const [slugManual, setSlugManual] = useState(!!initial?.slug);

  useEffect(() => {
    getTemplates().then((t) => {
      setTemplates(t);
      if (!values.template_id && t.length > 0) {
        setValues((v) => ({ ...v, template_id: t[0].id }));
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function set(key: keyof FormValues, val: string | boolean) {
    setValues((prev) => {
      const next = { ...prev, [key]: val };
      if (
        !slugManual &&
        (key === "bride_name" || key === "groom_name")
      ) {
        const bride = key === "bride_name" ? String(val) : prev.bride_name;
        const groom = key === "groom_name" ? String(val) : prev.groom_name;
        if (bride && groom) next.slug = generateSlug(bride, groom);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit(values);
  }

  const selectedTemplate = templates.find((t) => t.id === values.template_id);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Template selection */}
      <section>
        <Label>Pilih Template</Label>
        {templates.length === 0 ? (
          <div className="mt-2 flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Memuat template...
          </div>
        ) : (
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {templates.map((t) => {
              const theme = TEMPLATE_COLORS[t.slug] ?? { bg: "var(--muted)", accent: "var(--primary)", label: t.name };
              const selected = values.template_id === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => set("template_id", t.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl p-3 text-xs font-medium transition-all",
                    selected && "ring-2"
                  )}
                  style={{
                    background: theme.bg,
                    border: `1px solid ${selected ? theme.accent : "var(--border)"}`,
                    color: theme.accent,
                    fontFamily: "var(--font-inter)",
                    // @ts-expect-error css var
                    "--tw-ring-color": theme.accent,
                  }}
                >
                  {/* Mini preview */}
                  <div
                    className="h-12 w-full rounded-lg"
                    style={{ background: theme.accent, opacity: 0.15 }}
                  />
                  <span className="text-center leading-tight">{theme.label}</span>
                  {t.is_premium && (
                    <span
                      className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ background: theme.accent, color: "#fff" }}
                    >
                      <Crown className="h-2.5 w-2.5" />
                      Pro
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Names */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Mempelai Wanita" required>
          <input
            type="text"
            value={values.bride_name}
            onChange={(e) => set("bride_name", e.target.value)}
            placeholder="cth. Siti Rahayu"
            required
          />
        </Field>
        <Field label="Nama Mempelai Pria" required>
          <input
            type="text"
            value={values.groom_name}
            onChange={(e) => set("groom_name", e.target.value)}
            placeholder="cth. Budi Santoso"
            required
          />
        </Field>
      </div>

      {/* Date & Time */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tanggal Acara" required>
          <input
            type="date"
            value={values.event_date}
            onChange={(e) => set("event_date", e.target.value)}
            required
          />
        </Field>
        <Field label="Waktu Acara" required>
          <input
            type="time"
            value={values.event_time}
            onChange={(e) => set("event_time", e.target.value)}
            required
          />
        </Field>
      </div>

      {/* Venue */}
      <Field label="Nama Venue" required>
        <input
          type="text"
          value={values.venue_name}
          onChange={(e) => set("venue_name", e.target.value)}
          placeholder="cth. Grand Ballroom Hotel Mulia"
          required
        />
      </Field>
      <Field label="Alamat Venue" required>
        <textarea
          value={values.venue_address}
          onChange={(e) => set("venue_address", e.target.value)}
          placeholder="cth. Jl. Asia Afrika No.8, Senayan, Jakarta"
          rows={2}
          required
          className="resize-none"
        />
      </Field>

      {/* Custom message */}
      <Field label="Pesan Khusus (opsional)">
        <textarea
          value={values.custom_message}
          onChange={(e) => set("custom_message", e.target.value)}
          placeholder={'cth. “Dan di antara tanda-tanda kekuasaan-Nya...” (QS. Ar-Rum: 21)'}
          rows={3}
          className="resize-none"
        />
      </Field>

      {/* Slug */}
      <Field label="Link Undangan (slug)">
        <input
          type="text"
          value={values.slug}
          onChange={(e) => {
            setSlugManual(true);
            set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
          }}
          placeholder="cth. siti-budi-2025"
        />
        {values.slug && (
          <p
            className="mt-1 text-xs"
            style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
          >
            URL: /invite/?s={values.slug}
          </p>
        )}
      </Field>

      {/* Published */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={values.is_published}
          onClick={() => set("is_published", !values.is_published)}
          className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
          style={{
            background: values.is_published ? "var(--primary)" : "var(--border)",
          }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{
              transform: values.is_published ? "translateX(20px)" : "translateX(2px)",
            }}
          />
        </button>
        <div>
          <p className="text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>
            {values.is_published ? "Dipublikasikan" : "Draft"}
          </p>
          <p className="text-xs" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}>
            {values.is_published
              ? "Tamu bisa mengakses undangan."
              : "Hanya Anda yang bisa melihat undangan ini."}
          </p>
        </div>
      </div>

      {error && (
        <p
          className="rounded-xl px-4 py-3 text-sm"
          style={{ background: "#fef2f2", color: "#dc2626", fontFamily: "var(--font-inter)" }}
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || !values.template_id || !values.bride_name || !values.groom_name}
        className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all disabled:opacity-60"
        style={{
          background: "var(--primary)",
          color: "var(--primary-foreground)",
          fontFamily: "var(--font-inter)",
        }}
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : submitLabel}
      </button>
    </form>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-xs font-medium uppercase tracking-wider"
      style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
    >
      {children}
    </p>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
      >
        {label}
        {required && <span style={{ color: "var(--primary)" }}> *</span>}
      </label>
      <div
        className="rounded-xl px-4 py-3 [&_input]:w-full [&_input]:bg-transparent [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:bg-transparent [&_textarea]:text-sm [&_textarea]:outline-none"
        style={{
          background: "var(--muted)",
          border: "1px solid var(--border)",
          fontFamily: "var(--font-inter)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
