export default async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const token = process.env.CLOUDFLARE_STREAM_TOKEN;

  if (!accountId || !token) {
    return response.status(500).json({ error: "Cloudflare Stream is not configured." });
  }

  const cloudflareResponse = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      maxDurationSeconds: 3600,
      requireSignedURLs: false,
    }),
  });

  const payload = await cloudflareResponse.json();

  if (!cloudflareResponse.ok || !payload.success) {
    return response.status(cloudflareResponse.status || 500).json({
      error: payload.errors?.[0]?.message || "Could not create Cloudflare upload URL.",
    });
  }

  const uid = payload.result.uid;

  return response.status(200).json({
    uploadURL: payload.result.uploadURL,
    uid,
    iframeUrl: `https://iframe.videodelivery.net/${uid}`,
    thumbnailUrl: `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`,
  });
}
