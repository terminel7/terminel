type ContactPayload = {
  name?: unknown;
  email?: unknown;
  subject?: unknown;
  message?: unknown;
  company?: unknown;
  startedAt?: unknown;
};

const responseHeaders = {
  "Cache-Control": "no-store",
  "Content-Type": "application/json; charset=utf-8",
};

const json = (body: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(body),
  { status, headers: responseHeaders },
);

const stringValue = (value: unknown) => typeof value === "string" ? value.trim() : "";

const escapeHtml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const parsePayload = async (request: Request): Promise<ContactPayload> => {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return await request.json() as ContactPayload;
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries()) as ContactPayload;
};

export default {
  async fetch(request: Request) {
    if (request.method !== "POST") {
      return json({ message: "Method not allowed." }, 405);
    }

    const origin = request.headers.get("origin");
    if (origin && new URL(origin).host !== new URL(request.url).host) {
      return json({ message: "Unable to send your message." }, 403);
    }

    let payload: ContactPayload;
    try {
      payload = await parsePayload(request);
    } catch {
      return json({ message: "Please check the form and try again." }, 400);
    }

    const name = stringValue(payload.name);
    const email = stringValue(payload.email).toLowerCase();
    const subject = stringValue(payload.subject).replace(/[\r\n]+/g, " ");
    const message = stringValue(payload.message);
    const company = stringValue(payload.company);
    const startedAt = Number(payload.startedAt);

    if (company) {
      return json({ ok: true, message: "Thanks. Your message is on its way." });
    }

    if (!Number.isFinite(startedAt) || Date.now() - startedAt < 1200) {
      return json({ message: "Please wait a moment and try again." }, 400);
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !name || name.length > 100
      || !emailPattern.test(email) || email.length > 254
      || !subject || subject.length > 160
      || !message || message.length > 5000
    ) {
      return json({ message: "Please complete every field with valid information." }, 400);
    }

    const apiKey = process.env.RESEND_API_KEY;
    const to = process.env.CONTACT_TO_EMAIL;
    const from = process.env.CONTACT_FROM_EMAIL;

    if (!apiKey || !to || !from) {
      return json({ message: "The contact form is temporarily unavailable." }, 503);
    }

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeSubject = escapeHtml(subject);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
    const text = [
      "New portfolio inquiry",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${subject}`,
      "",
      message,
    ].join("\n");

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${subject}`,
        text,
        html: `
          <h1>New portfolio inquiry</h1>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Subject:</strong> ${safeSubject}</p>
          <p><strong>Message:</strong><br />${safeMessage}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      console.error("Contact email delivery failed", resendResponse.status);
      return json({ message: "Unable to send your message right now. Please try again." }, 502);
    }

    return json({ ok: true, message: "Thanks. Your message is on its way." });
  },
};
