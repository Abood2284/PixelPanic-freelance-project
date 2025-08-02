// apps/pixel-panic-worker/src/services/auth.service.ts

import { Buffer } from "buffer";
import { HTTPException } from "hono/http-exception";

const MESSAGE_CENTRAL_BASE_URL = "https://cpaas.messagecentral.com";

async function generateMessageCentralToken(
  customerId: string,
  password: string
) {
  const key = Buffer.from(password).toString("base64");
  const url = `${MESSAGE_CENTRAL_BASE_URL}/auth/v1/authentication/token?customerId=${customerId}&key=${key}&scope=NEW`;

  const response = await fetch(url, {
    method: "GET",
    headers: { accept: "*/*" },
  });

  if (!response.ok) {
    console.error("Message Central Token Error:", await response.text());
    throw new HTTPException(500, {
      message:
        "Failed to generate Message Central token. Please check your Customer ID and Password.",
    });
  }

  const data = (await response.json()) as { token: string };
  return data.token;
}

export async function sendOtp(
  phoneNumber: string,
  countryCode: string,
  customerId: string,
  password: string
) {
  const authToken = await generateMessageCentralToken(customerId, password);

  // FIX: Added 'customerId' to the parameters to match the dashboard example.
  const params = new URLSearchParams({
    countryCode,
    customerId, // <-- THE FIX
    mobileNumber: phoneNumber,
    flowType: "SMS",
    otpLength: "6",
  });

  const url = `${MESSAGE_CENTRAL_BASE_URL}/verification/v3/send?${params.toString()}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { authToken: authToken },
  });

  if (!response.ok) {
    console.error("Message Central Send OTP Error:", await response.text());
    throw new HTTPException(500, {
      message: "Failed to send OTP via Message Central",
    });
  }

  const data = await response.json();
  const verificationId = data?.data?.verificationId;

  if (!verificationId) {
    throw new HTTPException(500, {
      message: "Could not retrieve verificationId from Message Central",
    });
  }

  return verificationId;
}

export async function validateOtp(
  verificationId: string,
  otpCode: string,
  phoneNumber: string, // <-- ADDED
  countryCode: string, // <-- ADDED
  customerId: string,
  password: string
) {
  const authToken = await generateMessageCentralToken(customerId, password);

  // FIX: Added 'customerId', 'countryCode', and 'mobileNumber' to match the dashboard example.
  const params = new URLSearchParams({
    verificationId,
    code: otpCode,
    customerId, // <-- THE FIX
    countryCode, // <-- THE FIX
    mobileNumber: phoneNumber, // <-- THE FIX
  });

  const url = `${MESSAGE_CENTRAL_BASE_URL}/verification/v3/validateOtp?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { authToken: authToken },
  });

  if (!response.ok) {
    console.error("Message Central Validate OTP Error:", await response.text());
    throw new HTTPException(400, {
      message: "OTP validation failed with provider",
    });
  }

  const data = await response.json();
  const isVerified =
    data?.data?.verificationStatus === "VERIFICATION_COMPLETED";

  return isVerified;
}
