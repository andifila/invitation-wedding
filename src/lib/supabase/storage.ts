import { supabase } from "./client";

export const COVER_MAX_BYTES = 5 * 1024 * 1024;  // 5 MB
export const MUSIC_MAX_BYTES = 8 * 1024 * 1024;  // 8 MB

export const COVER_ACCEPT = "image/jpeg,image/png,image/webp";
export const MUSIC_ACCEPT = "audio/mpeg,audio/mp3";

async function upload(bucket: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function uploadCover(file: File) { return upload("covers", file); }
export function uploadMusic(file: File)  { return upload("music",  file); }
