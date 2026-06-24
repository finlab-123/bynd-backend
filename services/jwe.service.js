import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { CompactEncrypt, importSPKI } from "jose";

let SERVER_PUBLIC_PEM;

if (process.env.RAM_FINCORP_PUBLIC_KEY) {
  SERVER_PUBLIC_PEM = process.env.RAM_FINCORP_PUBLIC_KEY.replace(/\\n/g, '\n');
} else {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const localKeyPath = path.resolve(__dirname, "../config/server-public.pem");

  if (fs.existsSync(localKeyPath)) {
    SERVER_PUBLIC_PEM = fs.readFileSync(localKeyPath, "utf8");
  } else {
    console.error("Critical: Public key file 'server-public.pem' is missing from local config/ directory!");
  }
}

const CLIENT_ID = process.env.RAMFINCORP_CLIENT_ID || "dummy";

const nowSec = () => Math.floor(Date.now() / 1000);

export const encryptPayload = async (payload) => {
  if (!SERVER_PUBLIC_PEM) {
    throw new Error("Encryption failed: Public key certificate is completely uninitialized.");
  }

  const publicKey = await importSPKI(
    SERVER_PUBLIC_PEM,
    "ECDH-ES"
  );

  const envelope = {
    iat: nowSec(),
    exp: nowSec() + 6000,
    jti: crypto.randomUUID(),
    data: payload,
  };

  const plaintext = new TextEncoder().encode(
    JSON.stringify(envelope)
  );

  const jwe = await new CompactEncrypt(
    plaintext
  )
    .setProtectedHeader({
      alg: "ECDH-ES",
      enc: "A256GCM",
      client_id: CLIENT_ID,
    })
    .encrypt(publicKey);

  return jwe;
};