import { supabase } from "./client";
import type { RsvpStatus } from "./types";

export type RsvpPayload = {
  invitation_id: string;
  name: string;
  phone?: string;
  rsvp_status: RsvpStatus;
  message?: string;
};

export async function submitRsvp(payload: RsvpPayload): Promise<void> {
  const { error } = await supabase.from("guests").insert({
    invitation_id: payload.invitation_id,
    name: payload.name.trim(),
    phone: payload.phone?.trim() || null,
    rsvp_status: payload.rsvp_status,
    message: payload.message?.trim() || null,
  });

  if (error) throw error;
}
