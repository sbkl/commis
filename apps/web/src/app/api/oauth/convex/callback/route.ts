import { api } from "@commis/api/src/convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchMutation } from "convex/nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (!code) {
      return NextResponse.json(
        { error: "Missing authorization code" },
        { status: 400 }
      );
    }

    const token = await convexAuthNextjsToken();

    if (!token) {
      return NextResponse.redirect(new URL("/auth", request.url));
    }

    // Retrieve the code_verifier that was stored during the authorization request
    const cookieStore = await cookies();
    const codeVerifier = cookieStore.get("oauth_code_verifier")?.value;

    if (!codeVerifier) {
      return new NextResponse(
        "OAuth session expired or invalid. Please try again.",
        { status: 400 }
      );
    }

    // Verify state if it was used for CSRF protection
    const storedState = cookieStore.get("oauth_state")?.value;
    if (storedState && state !== storedState) {
      return new NextResponse(
        "Invalid state parameter. Possible CSRF attack.",
        {
          status: 400,
        }
      );
    }

    const res = await fetch(`${process.env.CONVEX_OAUTH_API_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.NEXT_PUBLIC_CONVEX_OAUTH_CLIENT_ID!,
        client_secret: process.env.CONVEX_OAUTH_SECRET!,
        redirect_uri: process.env.NEXT_PUBLIC_CONVEX_OAUTH_REDIRECT_URI!,
        code_verifier: codeVerifier,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Token exchange failed:", errorText);
      return new NextResponse(
        `Failed to authenticate with Convex: ${errorText}`,
        { status: res.status }
      );
    }

    const data = await res.json();

    const access_token = data.access_token;

    if (!access_token) {
      return new NextResponse("No access token received", { status: 500 });
    }

    const tokenDetails = await fetch(
      `https://api.convex.dev/v1/token_details`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (!tokenDetails.ok) {
      return new NextResponse("Failed to get token details", { status: 500 });
    }

    const tokenDetailsData = await tokenDetails.json();

    console.log("tokenDetailsData", tokenDetailsData);

    const convexTeamId = tokenDetailsData.teamId;

    // Store the access token
    await fetchMutation(
      api.users.mutation.storeConvexAccessToken,
      {
        accessToken: access_token,
        convexTeamId: convexTeamId,
      },
      {
        token,
      }
    );

    // Clean up the stored PKCE values
    cookieStore.delete("oauth_code_verifier");
    cookieStore.delete("oauth_state");

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("OAuth callback error:", error);
    return new NextResponse(
      `Failed to authenticate with Convex: ${error instanceof Error ? error.message : "Unknown error"}`,
      { status: 500 }
    );
  }
}
