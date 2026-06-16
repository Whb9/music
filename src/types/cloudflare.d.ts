// Extend global CloudflareEnv with custom bindings
/// <reference types="@cloudflare/workers-types" />

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    UPLOADS: R2Bucket;
  }
}

export {};
