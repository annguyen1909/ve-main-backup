import { redirect } from "@remix-run/node";

export async function loader(): Promise<Response> {
  // Redirect any locale-prefixed favicon requests to the root favicon resource.
  // This handles requests like `/en/favicon.ico` or `/ko/favicon.ico`.
  return redirect(`/favicon.jpg`, 301);
}
