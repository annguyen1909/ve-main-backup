import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export async function loader({ params }: LoaderFunctionArgs) {
  const rawName = params.name ?? ""; // e.g. "dark.png" or "ico"

  // Normalize requested favicon name and map to existing root assets.
  // If the request is for favicon-dark.* -> redirect to /favicon-dark.jpg
  // Otherwise redirect to /favicon.jpg as a safe default.
  const lower = rawName.toLowerCase();

  if (lower.startsWith("dark")) {
    return redirect(`/favicon-dark.jpg`, 301);
  }

  // default fallback
  return redirect(`/favicon.jpg`, 301);
}

export const handle = { raw: true };
