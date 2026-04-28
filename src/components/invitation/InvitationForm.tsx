"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Image, Music, Upload, X, CheckCircle2 } from "lucide-react";
import {
  getTemplates,
  generateSlug,
  type Template,
} from "@/lib/supabase/invitation-crud";
import {
  uploadCover,
  uploadMusic,
  COVER_MAX_BYTES,
  MUSIC_MAX_BYTES,
  COVER_ACCEPT,
  MUSIC_ACCEPT,
} from "@/lib/supabase/storage";

export type FormValues = {
  template_id: string;
  bride_name: string;
  groom_name: string;
  event_date: string;
  event_time: string;
  venue_name: string;
  venue_address: string;
  custom_message: string;
  cover_image_url: string;
  music_url: string;
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
    cover_image_url: initial?.cover_image_url ?? "",
    music_url: initial?.music_url ?? "",
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
      if (!slugManual && (key === "bride_name" || key === "groom_name")) {
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

  if (templates.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}>
        <Loader2 className="h-4 w-4 animate-spin" /> Memuat...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Names */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Mempelai Wanita" required>
          <input
            type="text"
            value={values.bride_name}
            onChange={(e) => set("bride_name", e.target.value)}
            placeholder="cth. Gabriela"
            required
          />
        </Field>
        <Field label="Nama Mempelai Pria" required>
          <input
            type="text"
            value={values.groom_name}
            onChange={(e) => set("groom_name", e.target.value)}
            placeholder="cth. Rosandi"
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
      <Field label="Ayat / Kutipan (opsional)">
        <textarea
          value={values.custom_message}
          onChange={(e) => set("custom_message", e.target.value)}
          placeholder={'cth. "Dan di antara tanda-tanda kekuasaan-Nya..." (QS. Ar-Rum: 21)'}
          rows={3}
          className="resize-none"
        />
      </Field>

      {/* Cover photo */}
      <FileUploadField
        label="Foto Cover (opsional)"
        icon={<Image className="h-4 w-4" />}
        accept={COVER_ACCEPT}
        maxBytes={COVER_MAX_BYTES}
        currentUrl={values.cover_image_url}
        hint="JPEG / PNG / WebP — maks. 5 MB"
        upload={uploadCover}
        onUploaded={(url) => set("cover_image_url", url)}
        onClear={() => set("cover_image_url", "")}
      />

      {/* Background music */}
      <FileUploadField
        label="Musik Latar (opsional)"
        icon={<Music className="h-4 w-4" />}
        accept={MUSIC_ACCEPT}
        maxBytes={MUSIC_MAX_BYTES}
        currentUrl={values.music_url}
        hint="MP3 — maks. 8 MB"
        upload={uploadMusic}
        onUploaded={(url) => set("music_url", url)}
        onClear={() => set("music_url", "")}
      />

      {/* Slug */}
      <Field label="Link Undangan (slug)">
        <input
          type="text"
          value={values.slug}
          onChange={(e) => {
            setSlugManual(true);
            set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
          }}
          placeholder="cth. rosandi-gabriela-2025"
        />
        {values.slug && (
          <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            URL: /invite/?s={values.slug}
          </p>
        )}
      </Field>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={values.is_published}
          onClick={() => set("is_published", !values.is_published)}
          className="relative h-6 w-11 flex-shrink-0 rounded-full transition-colors"
          style={{ background: values.is_published ? "var(--primary)" : "var(--border)" }}
        >
          <span
            className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: values.is_published ? "translateX(20px)" : "translateX(2px)" }}
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

// ─── FileUploadField ──────────────────────────────────────────────────────────

type UploadState = "idle" | "uploading" | "done" | "error";

function FileUploadField({
  label, icon, accept, maxBytes, currentUrl, hint, upload, onUploaded, onClear,
}: {
  label: string;
  icon: React.ReactNode;
  accept: string;
  maxBytes: number;
  currentUrl: string;
  hint: string;
  upload: (f: File) => Promise<string>;
  onUploaded: (url: string) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const hasFile = !!currentUrl;
  const fileName = hasFile ? currentUrl.split("/").pop()?.split("?")[0] ?? "file" : "";
  const isImage = accept.includes("image");

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxBytes) {
      setErrorMsg(`Ukuran file melebihi batas (maks. ${Math.round(maxBytes / 1024 / 1024)} MB).`);
      setUploadState("error");
      return;
    }
    setUploadState("uploading");
    setErrorMsg("");
    try {
      const url = await upload(file);
      onUploaded(url);
      setUploadState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Upload gagal.");
      setUploadState("error");
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
      >
        {icon}
        {label}
      </label>

      <div
        className="rounded-xl"
        style={{ background: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--font-inter)" }}
      >
        {hasFile ? (
          <div className="flex items-center gap-3 px-4 py-3">
            {isImage && (
              <img
                src={currentUrl}
                alt=""
                className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                style={{ border: "1px solid var(--border)" }}
              />
            )}
            <p className="flex-1 truncate text-sm" title={fileName}>{fileName}</p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <CheckCircle2 className="h-4 w-4" style={{ color: "#16a34a" }} />
              <button
                type="button"
                onClick={onClear}
                className="rounded-lg p-1 transition-colors hover:opacity-70"
                style={{ color: "var(--muted-foreground)" }}
                aria-label="Hapus"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadState === "uploading"}
            className="flex w-full items-center gap-3 px-4 py-3 transition-colors hover:opacity-80 disabled:opacity-60"
          >
            {uploadState === "uploading" ? (
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" style={{ color: "var(--primary)" }} />
            ) : (
              <Upload className="h-4 w-4 flex-shrink-0" style={{ color: "var(--primary)" }} />
            )}
            <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
              {uploadState === "uploading" ? "Mengupload..." : `Pilih file...`}
            </span>
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{hint}</p>
      {uploadState === "error" && (
        <p className="text-xs" style={{ color: "#dc2626" }}>{errorMsg}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider"
        style={{ color: "var(--muted-foreground)", fontFamily: "var(--font-inter)" }}
      >
        {icon}
        {label}
        {required && <span style={{ color: "var(--primary)" }}>*</span>}
      </label>
      <div
        className="rounded-xl px-4 py-3 [&_input]:w-full [&_input]:bg-transparent [&_input]:text-sm [&_input]:outline-none [&_textarea]:w-full [&_textarea]:bg-transparent [&_textarea]:text-sm [&_textarea]:outline-none"
        style={{ background: "var(--muted)", border: "1px solid var(--border)", fontFamily: "var(--font-inter)" }}
      >
        {children}
      </div>
    </div>
  );
}
