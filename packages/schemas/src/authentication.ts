import z from "zod/v3";

export const authenticationProviderSchema = z.object({
  provider: z.enum(["convex", "clerk", "workos"]),
  dependencies: z.array(z.string()),
  commands: z.array(z.string()),
  imports: z.array(z.string()),
});

// Convex Auth

// npm install @convex-dev/auth @auth/core@0.37.0
// npx @convex-dev/auth

// Add tables
// project-folder/src/convex/schema.ts
// import { defineSchema } from "convex/server";
// import { authTables } from "@convex-dev/auth/server";
 
// const schema = defineSchema({
//   ...authTables,
//   // Your other tables...
// });
 
// export default schema;
// project-folder/src/convex/auth.ts
// Client provider
// import { ConvexAuthProvider } from "@convex-dev/auth/react";
// import React from "react";
// import ReactDOM from "react-dom/client";
// import { ConvexReactClient } from "convex/react";
// import App from "./App.tsx";
// import "./index.css";
 
// const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);
 
//     <ConvexAuthProvider client={convex}>
//       <App />
//     </ConvexAuthProvider>

// layout wrapped with convex auth nextjs server component provider

// Convex auth.ts
// import GitHub from "@auth/core/providers/github";
// import { convexAuth } from "@convex-dev/auth/server";
 
// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [GitHub],
// });

// OR

// import { convexAuth } from "@convex-dev/auth/server";
// import { ResendOTP } from "./ResendOTP";
 
// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//   providers: [ResendOTP],
// });




// http
// import { httpRouter } from "convex/server";
// import { auth } from "./auth";

// const http = httpRouter();

// auth.addHttpRoutes(http);

// export default http;

// Resend for OTP and magic auth
// npx convex env set AUTH_RESEND_KEY yourresendkey

// import { Email } from "@convex-dev/auth/providers/Email";
// import { Resend as ResendAPI } from "resend";
// import { RandomReader, generateRandomString } from "@oslojs/crypto/random";
 
// export const ResendOTP = Email({
//   id: "resend-otp",
//   apiKey: process.env.AUTH_RESEND_KEY,
//   maxAge: 60 * 15, // 15 minutes
//   async generateVerificationToken() {
//     const random: RandomReader = {
//       read(bytes) {
//         crypto.getRandomValues(bytes);
//       },
//     };
 
//     const alphabet = "0123456789";
//     const length = 8;
//     return generateRandomString(random, alphabet, length);
//   },
//   async sendVerificationRequest({ identifier: email, provider, token }) {
//     const resend = new ResendAPI(provider.apiKey);
//     const { error } = await resend.emails.send({
//       from: "My App <onboarding@resend.dev>",
//       to: [email],
//       subject: `Sign in to My App`,
//       text: "Your code is " + token,
//     });
 
//     if (error) {
//       throw new Error(JSON.stringify(error));
//     }
//   },
// });

// Sign In form
// import { useAuthActions } from "@convex-dev/auth/react";
 
// export function SignIn() {
//   const { signIn } = useAuthActions();
//   return (
//     <button onClick={() => void signIn("github")}>Sign in with GitHub</button>
//   );
// }

// OR

// import { useAuthActions } from "@convex-dev/auth/react";
// import { useState } from "react";
 
// export function SignIn() {
//   const { signIn } = useAuthActions();
//   const [step, setStep] = useState<"signIn" | { email: string }>("signIn");
//   return step === "signIn" ? (
//     <form
//       onSubmit={(event) => {
//         event.preventDefault();
//         const formData = new FormData(event.currentTarget);
//         void signIn("resend-otp", formData).then(() =>
//           setStep({ email: formData.get("email") as string })
//         );
//       }}
//     >
//       <input name="email" placeholder="Email" type="text" />
//       <button type="submit">Send code</button>
//     </form>
//   ) : (
//     <form
//       onSubmit={(event) => {
//         event.preventDefault();
//         const formData = new FormData(event.currentTarget);
//         void signIn("resend-otp", formData);
//       }}
//     >
//       <input name="code" placeholder="Code" type="text" />
//       <input name="email" value={step.email} type="hidden" />
//       <button type="submit">Continue</button>
//       <button type="button" onClick={() => setStep("signIn")}>
//         Cancel
//       </button>
//     </form>
//   );
// }

// nextjs proxy setup

// convex custom functions with protected query, mutation and action