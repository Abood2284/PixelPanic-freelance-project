// apps/pixel-panic-worker/src/routes/sms.ts
import { Hono } from "hono";
import { debugToken, sendSms } from "../utils/messagecentral";

const r = new Hono();

// Health
r.get("/sms/ping", (c) => c.json({ pong: true }));

// Get token (preview only)
r.post("/sms/token", async (c) => {
  try {
    const info = await debugToken(c.env as any);
    return c.json(info);
  } catch (e: any) {
    return c.json({ ok: false, error: String(e.message || e) }, 500);
  }
});

// Send a fixed test message to MC_ALERT_MOBILE
r.post("/sms/test", async (c) => {
  try {
    const resp = await sendSms(c.env as any, {
      message:
        "Welcome to Message Central. We are delighted to have you here! - Powered by U2opia",
      //   message: "PIXEL PANIC —  You got a new order. Check your dashboard!",
    });
    return c.json({ ok: true, provider: resp });
  } catch (e: any) {
    return c.json({ ok: false, error: String(e.message || e) }, 500);
  }
});

// Send a custom message/number
// Body: { to?: "9834......", message: "your text" }
r.post("/sms/send", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const to = (body.to || "").trim();
  const message = (body.message || "").toString();
  if (!message) return c.json({ ok: false, error: "message is required" }, 400);

  try {
    const resp = await sendSms(c.env as any, { to: to || undefined, message });
    return c.json({ ok: true, provider: resp });
  } catch (e: any) {
    return c.json({ ok: false, error: String(e.message || e) }, 500);
  }
});

// Diagnostics: shows exactly what the Worker will send (no secrets leaked)
r.get("/sms/diag", (c) => {
  const e: any = c.env;
  // compute what key we will send
  const pwd = (e.MC_PASSWORD || "").trim();
  const bytes = new TextEncoder().encode(pwd);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  const key = btoa(bin);

  return c.json({
    cid: (e.MC_CUSTOMER_ID || "").trim(),
    email: (e.MC_LOGIN_EMAIL || "").trim(),
    // Compare this to your working shell: printf %s 'Pixel$2025' | base64
    computedBase64: key,
    senderId: (e.MC_SENDER_ID || "").trim(),
    mobile: (e.MC_ALERT_MOBILE || "").trim(),
  });
});

export default r;
