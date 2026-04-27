import { supabase } from "./client";
import type { Database } from "./types";

export type InvitationStat =
  Database["public"]["Views"]["invitation_stats"]["Row"];

export async function getUserInvitations(): Promise<InvitationStat[]> {
  const { data, error } = await supabase
    .from("invitation_stats")
    .select("*")
    .order("event_date", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function deleteInvitation(id: string): Promise<void> {
  const { error } = await supabase.from("invitations").delete().eq("id", id);
  if (error) throw error;
}
