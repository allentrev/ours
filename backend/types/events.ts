export interface ClerkUserCreated {
  id: string;
  username: string | null;
  email_addresses: { id: string; email_address: string }[];
  profile_img_url: string;
}

export interface ClerkUserDeleted {
  id: string;
}

// fallback for unhandled events
export interface ClerkUnknownEvent {
  [key: string]: unknown;
}

export interface EventMap {
  "user.created": ClerkUserCreated;
  "user.deleted": ClerkUserDeleted;
}
