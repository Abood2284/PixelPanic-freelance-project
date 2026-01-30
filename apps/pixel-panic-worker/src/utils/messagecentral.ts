const BASE = "https://cpaas.messagecentral.com";

const MC_DEFAULT_MESSAGE =
  "Welcome to Message Central. We are delighted to have you here! - Powered by U2opia";

type Env = {
  MC_CUSTOMER_ID: string;
  MC_LOGIN_EMAIL: string;
  MC_PASSWORD: string; // plain
  MC_SENDER_ID: string;
  MC_ALERT_MOBILE: string;
  MC_COUNTRY_CODE?: string;
};

let tokenCache: { token: string; ts: number } | null = null;

function b64Utf8Trim(s: string) {
  const clean = (s || "").trim();
  const bytes = new TextEncoder().encode(clean);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

async function tryToken(
  method: "POST_QS" | "GET_QS" | "POST_FORM",
  p: {
    customerId: string;
    email: string;
    key: string;
  }
) {
  const { customerId, email, key } = p;
  const qs = new URLSearchParams({
    customerId,
    key,
    scope: "NEW",
    country: "91",
    email,
  });

  let res: Response;

  if (method === "POST_QS") {
    res = await fetch(`${BASE}/auth/v1/authentication/token?${qs.toString()}`, {
      method: "POST",
      headers: { accept: "*/*" },
    });
  } else if (method === "GET_QS") {
    res = await fetch(`${BASE}/auth/v1/authentication/token?${qs.toString()}`, {
      method: "GET",
      headers: { accept: "*/*" },
    });
  } else {
    // POST_FORM
    res = await fetch(`${BASE}/auth/v1/authentication/token`, {
      method: "POST",
      headers: {
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded",
      },
      body: qs.toString(),
    });
  }

  const text = await res.text();
  if (!res.ok) {
    return { ok: false, status: res.status, body: text.slice(0, 200) };
  }
  try {
    const j = JSON.parse(text);
    if (j?.token) return { ok: true, token: j.token };
    return { ok: false, status: res.status, body: text.slice(0, 200) };
  } catch {
    return { ok: false, status: res.status, body: text.slice(0, 200) };
  }
}

// apps/pixel-panic-worker/src/utils/messagecentral.ts
async function getAuthToken(env: Env): Promise<string> {
  if (tokenCache && Date.now() - tokenCache.ts < 10 * 60 * 1000)
    return tokenCache.token;

  const customerId = (env.MC_CUSTOMER_ID || "").trim();
  const email = (env.MC_LOGIN_EMAIL || "").trim();
  const key = b64Utf8Trim(env.MC_PASSWORD || "");

  if (!customerId || !email || !key) throw new Error("auth missing env");

  const qs = new URLSearchParams({
    customerId,
    key,
    scope: "NEW",
    country: "91",
    email,
  });

  // ✅ This is the variant that worked in your logs
  const res = await fetch(
    `${BASE}/auth/v1/authentication/token?${qs.toString()}`,
    {
      method: "GET",
      headers: { accept: "*/*" },
    }
  );

  if (!res.ok) throw new Error(`auth ${res.status}`);
  const j = (await res.json()) as { token?: string };
  if (!j.token) throw new Error("auth token missing");
  tokenCache = { token: j.token, ts: Date.now() };
  return j.token;
}

export async function debugToken(env: Env) {
  const token = await getAuthToken(env);
  return { ok: true, tokenPreview: token.slice(0, 14) + "..." };
}

export async function sendSms(
  env: Env,
  {
    to,
    message,
    senderId,
    countryCode,
    forceDefault = false, // NEW: flip this on to force the default template text
    customerIdInQuery = true,
  }: {
    to?: string;
    message: string;
    senderId?: string;
    countryCode?: string;
    forceDefault?: boolean;
    customerIdInQuery?: boolean;
  }
) {
  const authToken = await getAuthToken(env);

  // Use ONLY the provider’s default template message while we wait for approval
  const finalMessage = forceDefault
    ? MC_DEFAULT_MESSAGE
    : message || MC_DEFAULT_MESSAGE;

  const cc = (countryCode ?? env.MC_COUNTRY_CODE ?? "91").trim();
  const mobile = (to ?? env.MC_ALERT_MOBILE).trim();
  const sid = (senderId ?? env.MC_SENDER_ID).trim();

  const params = new URLSearchParams({
    countryCode: cc,
    customerId: (env.MC_CUSTOMER_ID || "").trim(), // matches your dashboard example
    senderId: sid,
    type: "SMS",
    flowType: "SMS",
    mobileNumber: (to ?? env.MC_ALERT_MOBILE).trim(),
    message: finalMessage,
  });

  const url = `${BASE}/verification/v3/send?${params.toString()}`;
  const res = await fetch(url, { method: "POST", headers: { authToken } });
  if (!res.ok) throw new Error(`send ${res.status} ${await res.text()}`);
  return res.json();
}
