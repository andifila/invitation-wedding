export type PlanType = "free" | "premium";
export type RsvpStatus = "pending" | "attending" | "not_attending";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          plan: PlanType;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          plan?: PlanType;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          plan?: PlanType;
        };
      };
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          thumbnail_url: string;
          is_premium: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: never;
        Update: never;
      };
      invitations: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          slug: string;
          bride_name: string;
          groom_name: string;
          event_date: string;
          event_time: string;
          venue_name: string;
          venue_address: string;
          cover_image_url: string | null;
          custom_message: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
          slug: string;
          bride_name: string;
          groom_name: string;
          event_date: string;
          event_time: string;
          venue_name: string;
          venue_address: string;
          cover_image_url?: string | null;
          custom_message?: string | null;
          is_published?: boolean;
        };
        Update: {
          template_id?: string;
          bride_name?: string;
          groom_name?: string;
          event_date?: string;
          event_time?: string;
          venue_name?: string;
          venue_address?: string;
          cover_image_url?: string | null;
          custom_message?: string | null;
          is_published?: boolean;
        };
      };
      guests: {
        Row: {
          id: string;
          invitation_id: string;
          name: string;
          phone: string | null;
          rsvp_status: RsvpStatus;
          message: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invitation_id: string;
          name: string;
          phone?: string | null;
          rsvp_status?: RsvpStatus;
          message?: string | null;
        };
        Update: {
          rsvp_status?: RsvpStatus;
          message?: string | null;
        };
      };
    };
    Views: {
      invitation_stats: {
        Row: {
          invitation_id: string;
          user_id: string;
          slug: string;
          bride_name: string;
          groom_name: string;
          event_date: string;
          is_published: boolean;
          total_guests: number;
          attending: number;
          not_attending: number;
          pending: number;
        };
      };
    };
    Functions: Record<string, never>;
    Enums: {
      plan_type: PlanType;
      rsvp_status: RsvpStatus;
    };
  };
};
