import type { Database, RsvpStatus, PlanType } from "@/lib/supabase/types";

// Re-export DB row types as app types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Template = Database["public"]["Tables"]["templates"]["Row"];
export type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type InvitationStats =
  Database["public"]["Views"]["invitation_stats"]["Row"];

// Re-export enums
export type { RsvpStatus, PlanType };

// Convenience: invitation joined with its template
export type InvitationWithTemplate = Invitation & {
  templates: Pick<Template, "name" | "slug">;
};
