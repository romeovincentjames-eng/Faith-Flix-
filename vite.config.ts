import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

function cloudflareApiPlugin(): Plugin {
  return {
    name: "cloudflare-api-middleware",
    configureServer(server) {
      server.middlewares.use("/api/cloudflare-upload", async (req, res) => {
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
        const token = process.env.CLOUDFLARE_STREAM_TOKEN;

        if (!accountId || !token) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              error:
                "Cloudflare Stream is not configured. Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_STREAM_TOKEN to your Replit Secrets.",
            })
          );
          return;
        }

        try {
          const cfRes = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/direct_upload`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                maxDurationSeconds: 3600,
                requireSignedURLs: false,
              }),
            }
          );

          const payload = (await cfRes.json()) as {
            success: boolean;
            result: { uid: string; uploadURL: string };
            errors: { message: string }[];
          };

          if (!cfRes.ok || !payload.success) {
            res.writeHead(cfRes.status || 500, {
              "Content-Type": "application/json",
            });
            res.end(
              JSON.stringify({
                error:
                  payload.errors?.[0]?.message ||
                  "Could not create Cloudflare upload URL.",
              })
            );
            return;
          }

          const uid = payload.result.uid;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              uploadURL: payload.result.uploadURL,
              uid,
              iframeUrl: `https://iframe.videodelivery.net/${uid}`,
              thumbnailUrl: `https://videodelivery.net/${uid}/thumbnails/thumbnail.jpg`,
            })
          );
        } catch {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: "Cloudflare API request failed." })
          );
        }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), cloudflareApiPlugin()],
  server: {
    host: true,
    allowedHosts: true,
  },
});
