const MIN_DONATION_CENTS = 100;
const MAX_DONATION_CENTS = 500000;
const PURPOSES = new Set(["general", "servers", "food-cards", "videos"]);

async function readJson(request) {
  if (request.body && typeof request.body === "object") return request.body;
  let raw = "";
  for await (const chunk of request) raw += chunk;
  return raw ? JSON.parse(raw) : {};
}

function getOrigin(request) {
  const headerOrigin = request.headers.origin;
  if (headerOrigin) return headerOrigin;
  const host = request.headers.host;
  const protocol = request.headers["x-forwarded-proto"] || "https";
  return host ? `${protocol}://${host}` : "https://faith-flix.vercel.app";
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return response.status(500).json({ error: "Stripe is not configured yet. Add STRIPE_SECRET_KEY in Vercel." });
  }

  let body;
  try {
    body = await readJson(request);
  } catch {
    return response.status(400).json({ error: "Invalid donation request." });
  }

  const amount = Math.round(Number(body.amount));
  const purpose = PURPOSES.has(body.purpose) ? body.purpose : "general";

  if (!Number.isFinite(amount) || amount < MIN_DONATION_CENTS || amount > MAX_DONATION_CENTS) {
    return response.status(400).json({ error: "Choose a donation from $1 to $5,000." });
  }

  const origin = getOrigin(request);
  const params = new URLSearchParams();
  params.append("mode", "payment");
  params.append("success_url", `${origin}/?donation=success`);
  params.append("cancel_url", `${origin}/?donation=cancel`);
  params.append("line_items[0][quantity]", "1");
  params.append("line_items[0][price_data][currency]", "usd");
  params.append("line_items[0][price_data][unit_amount]", String(amount));
  params.append("line_items[0][price_data][product_data][name]", "Faith Flix donation");
  params.append("line_items[0][price_data][product_data][description]", "Supports app servers, first-come food cards, and more faith videos.");
  params.append("metadata[purpose]", purpose);
  params.append("payment_intent_data[metadata][purpose]", purpose);
  if (typeof body.donorEmail === "string" && body.donorEmail.includes("@")) {
    params.append("customer_email", body.donorEmail);
  }

  const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });

  const payload = await stripeResponse.json();
  if (!stripeResponse.ok) {
    return response.status(stripeResponse.status).json({
      error: payload.error?.message || "Stripe checkout could not be created.",
    });
  }

  return response.status(200).json({ url: payload.url });
}
