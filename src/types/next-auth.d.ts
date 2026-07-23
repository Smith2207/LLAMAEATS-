import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "cliente" | "restaurante" | "admin";
      phone: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role: "cliente" | "restaurante" | "admin";
    phone: string | null;
  }
}
