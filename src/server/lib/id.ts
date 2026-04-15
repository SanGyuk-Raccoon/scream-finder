import "server-only";
import crypto from "crypto";

export function createId(): string {
  return crypto.randomUUID();
}

export function createToken(): string {
  return crypto.randomBytes(12).toString("hex");
}
