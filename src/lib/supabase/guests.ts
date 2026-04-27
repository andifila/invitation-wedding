import { supabase } from "./client";
import type { Database } from "./types";

export type Guest = Database["public"]["Tables"]["guests"]["Row"];
export type GuestInsert = Pick<
  Database["public"]["Tables"]["guests"]["Insert"],
  "invitation_id" | "name" | "phone"
>;

export async function getInvitationGuests(invitationId: string): Promise<Guest[]> {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("invitation_id", invitationId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function addGuest(payload: GuestInsert): Promise<Guest> {
  const { data, error } = await supabase
    .from("guests")
    .insert({
      invitation_id: payload.invitation_id,
      name: payload.name.trim(),
      phone: payload.phone?.trim() || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeGuest(id: string): Promise<void> {
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) throw error;
}

export function toWaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return "62" + digits.slice(1);
  if (digits.startsWith("62")) return digits;
  return "62" + digits;
}

export function buildInviteUrl(slug: string, guestName: string): string {
  if (typeof window === "undefined") return "";
  const base =
    process.env.NODE_ENV === "production" ? "/invitation-wedding" : "";
  const encoded = encodeURIComponent(guestName);
  return `${window.location.origin}${base}/invite/?s=${slug}&to=${encoded}`;
}
