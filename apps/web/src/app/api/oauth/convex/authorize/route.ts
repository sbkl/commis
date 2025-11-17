import { generateCodeChallenge, generateCodeVerifier } from "@/lib/pkce";
import { cookies } from "next/headers";

export async function GET() {
  // Generate PKCE values
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate state for CSRF protection
  const state = generateCodeVerifier(); // Reuse function to generate random string

  // Store code_verifier and state in httpOnly cookies
  const cookieStore = await cookies();
  cookieStore.set("oauth_code_verifier", codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  // Build the authorization URL with PKCE parameters
  const authUrl = new URL("https://dashboard.convex.dev/oauth/authorize/team");
  authUrl.searchParams.set(
    "client_id",
    process.env.NEXT_PUBLIC_CONVEX_OAUTH_CLIENT_ID!
  );
  authUrl.searchParams.set(
    "redirect_uri",
    process.env.NEXT_PUBLIC_CONVEX_OAUTH_REDIRECT_URI!
  );
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", state);

  // Redirect to Convex OAuth page
  return Response.redirect(authUrl.toString());
}
