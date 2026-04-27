import { supabase } from "./client";
import type { Database } from "./types";

export type PublicInvitation =
  Database["public"]["Tables"]["invitations"]["Row"];

export async function getInvitationBySlug(
  slug: string
): Promise<PublicInvitation | null> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;
  return data;
}
