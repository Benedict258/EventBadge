import { createServerFileRoute } from "@tanstack/react-start/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

export const ServerRoute = createServerFileRoute("/favicon[.]ico").methods({
  GET: async () => {
    const faviconPath = join(__dirname, "..", "favicon.ico");
    const data = readFileSync(faviconPath);
    return new Response(data, {
      headers: {
        "content-type": "image/x-icon",
        "cache-control": "public, max-age=86400",
      },
    });
  },
});
