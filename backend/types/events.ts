export type ClerkEmailAddress = {
  id: string;
  email_address: string;
};

export type ClerkUserCreatedEvent = {
  type: "user.created";
  data: {
    id: string;
    username: string | null;
    first_name?: string | null;
    last_name?: string | null;
    primary_email_address_id?: string | null;
    email_addresses: ClerkEmailAddress[];
    profile_image_url?: string | null;
    public_metadata?: {
      role?: string;
    };
  };
};

export type ClerkUserUpdatedEvent = {
  type: "user.updated";
  data: {
    id: string;
    username: string | null;
    first_name?: string | null;
    last_name?: string | null;
    primary_email_address_id?: string | null;
    email_addresses: ClerkEmailAddress[];
    profile_image_url?: string | null;
        public_metadata?: {
      role?: string;
    };
  };
};

export type ClerkUserDeletedEvent = {
  type: "user.deleted";
  data: {
    id: string;
  };
};

export type ClerkWebhookEvent =
  | ClerkUserCreatedEvent
  | ClerkUserUpdatedEvent
  | ClerkUserDeletedEvent
