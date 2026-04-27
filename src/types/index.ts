export type Template = {
  id: string;
  name: string;
  slug: string;
  thumbnail: string;
  isPremium: boolean;
};

export type Invitation = {
  id: string;
  slug: string;
  templateId: string;
  brideeName: string;
  groomName: string;
  eventDate: string;
  eventTime: string;
  venueName: string;
  venueAddress: string;
  coverImageUrl: string | null;
  userId: string;
  createdAt: string;
};

export type Guest = {
  id: string;
  invitationId: string;
  name: string;
  phone: string | null;
  rsvpStatus: "pending" | "attending" | "not_attending";
  message: string | null;
  createdAt: string;
};
