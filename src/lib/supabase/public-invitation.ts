import { supabase } from "./client";
import type { Database } from "./types";

export type PublicInvitation =
  Database["public"]["Tables"]["invitations"]["Row"] & {
    template_slug?: string;
  };

export async function getInvitationBySlug(
  slug: string
): Promise<PublicInvitation | null> {
  const { data, error } = await supabase
    .from("invitations")
    .select("*, templates(slug)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error) return null;

  const { templates, ...rest } = data as typeof data & {
    templates: { slug: string } | null;
  };
  return { ...rest, template_slug: templates?.slug ?? "rustic-gold" };
}
