"use client";
/**
 * @file scanCrypto.ts
 * @description Lightweight client-side obfuscation for persisted scan landmarks.
 *
 * This is NOT a substitute for server-side encryption, but it prevents raw
 * landmark arrays from being trivially readable in localStorage. We use
 * AES-GCM with a key derived from the session ID + a static salt.
 */

import type { Landmark } from "../hooks/usePoseLandmarker";

const STATIC_SALT = "fashionistar-scan-v1";

async function getKey(sessionId: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(sessionId + STATIC_SALT),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(STATIC_SALT),
      iterations: 100_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Encrypt an array of landmarks for localStorage persistence.
 * Returns null if Web Crypto is unavailable (e.g. very old browser) or on error.
 */
export async function encryptLandmarks(landmarks: Landmark[], sessionId: string): Promise<string | null> {
  if (typeof window === "undefined" || !crypto?.subtle) return null;
  try {
    const key = await getKey(sessionId);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const plaintext = enc.encode(JSON.stringify(landmarks));
    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      plaintext
    );
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);
    return arrayBufferToBase64(combined.buffer);
  } catch {
    return null;
  }
}

/**
 * Decrypt a landmark array from localStorage.
 * Returns null if decryption fails or Web Crypto is unavailable.
 */
export async function decryptLandmarks(cipher: string, sessionId: string): Promise<Landmark[] | null> {
  if (typeof window === "undefined" || !crypto?.subtle) return null;
  try {
    const key = await getKey(sessionId);
    const combined = new Uint8Array(base64ToArrayBuffer(cipher));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    const dec = new TextDecoder();
    return JSON.parse(dec.decode(plaintext)) as Landmark[];
  } catch {
    return null;
  }
}
