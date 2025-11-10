import type { NextRequest } from "next/server";
// import type { Address } from "viem";
// import { type Network, paymentMiddleware, type Resource } from "x402-next";

// import { env } from "@/env";
// import { getOrCreateSellerAccount } from "./lib/accounts";

// const network = env.NETWORK;

// import { facilitator } from "@coinbase/x402";
//
// const address = "2JNXRSGsZb6poRjz5YJ3bj6BvLFMRrV4iEbtPbTYftxc" as Address;
// const network = "solana-devnet" as Network;
// const facilitatorUrl = "https://x402.org/facilitator" as Resource;
// const cdpClientKey = process.env.CDP_CLIENT_KEY as string;

// const sellerAccount = await getOrCreateSellerAccount();

// const x402PaymentMiddleware = paymentMiddleware(
//   // sellerAccount.address,
//   address,
//   {
//     "/content/cheap": {
//       price: "$0.01",
//       config: {
//         description: "Access to cheap content",
//       },
//       network,
//     },
//     "/content/expensive": {
//       price: "$0.25",
//       config: {
//         description: "Access to expensive content",
//       },
//       network,
//     },
//     "/playground/premium": {
//       price: "$0.05",
//       config: {
//         description: "Premium brand analysis tools",
//       },
//       network,
//     },
//   },
//   { url: facilitatorUrl },
//   {
//     cdpClientKey,
//     appLogo: "/logos/x402-examples.png",
//     appName: "x402 Demo",
//     sessionTokenEndpoint: "/api/x402/session-token",
//   },
// );

export default function proxy(req: NextRequest) {
  // const delegate = x402PaymentMiddleware as unknown as (
  //   request: NextRequest,
  // ) => ReturnType<typeof x402PaymentMiddleware>;
  // return delegate(req);
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
    "/", // Include the root path explicitly
  ],
};
