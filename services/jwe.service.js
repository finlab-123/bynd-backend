import fs from "fs";
import crypto from "crypto";
import { CompactEncrypt, importSPKI } from "jose";

const SERVER_PUBLIC_PEM = fs.readFileSync(
  "./config/server-public.pem",
  "utf8"
);

const CLIENT_ID =
  process.env.RAMFINCORP_CLIENT_ID || "dummy";

const nowSec = () =>
  Math.floor(Date.now() / 1000);

export const encryptPayload = async (payload) => {
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