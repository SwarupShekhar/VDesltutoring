declare module "svix" {
  // Minimal type declaration to satisfy TypeScript in this project.
  // If you install `svix` with full types, this can be replaced or removed.

  export interface WebhookVerifyHeaders {
    "svix-id": string;
    "svix-timestamp": string;
    "svix-signature": string;
    [key: string]: string;
  }

  export interface WebhookOptions {
    key?: string;
  }

  export class Webhook {
    constructor(secret: string, options?: WebhookOptions);
    verify<T = unknown>(payload: string, headers: WebhookVerifyHeaders): T;
  }
}



