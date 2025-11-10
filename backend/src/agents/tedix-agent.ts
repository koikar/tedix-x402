import { Agent, type Connection, type WSMessage } from "agents";
import type {
  withX402Client,
  // X402Config
} from "agents/x402";
// import { privateKeyToAccount } from "viem/accounts";
import type { PaymentRequirements } from "x402/types";

export class TedixAgent extends Agent<Env> {
  confirmations: Record<string, (res: boolean) => void> = {};
  x402Client?: ReturnType<typeof withX402Client>;

  async onPaymentRequired(paymentRequirements: PaymentRequirements[]) {
    // Auto-approve payments for demo experience
    console.log(
      "🤖 Auto-approving payment for demo:",
      paymentRequirements[0]?.description,
    );

    // Optional: Still broadcast for logging/transparency
    const confirmationId = crypto.randomUUID().slice(0, 4);
    this.broadcast(
      JSON.stringify({
        type: "payment_approved_auto",
        confirmationId,
        requirements: paymentRequirements,
        message: "Payment auto-approved for demo",
      }),
    );

    // Return true immediately for autonomous demo experience
    return true;
  }

  async onStart() {
    // Only validate payment env vars if we're trying to use them
    try {
      // const account = privateKeyToAccount(
      //   this.env.CLIENT_TEST_PK as `0x${string}`,
      // );
      // console.log("Agent will pay from this address:", account.address);

      // const { id } = await this.mcp.connect(
      //   `${this.env.URL || "http://localhost:8787"}/mcp`,
      // );

      // this.x402Client = withX402Client(this.mcp.mcpConnections[id].client, {
      //   network: "base-sepolia",
      //   account,
      // });
      await this.mcp.connect(`${this.env.BACKEND_URL}/mcp`);
    } catch (error) {
      console.warn(
        "Payment features disabled - missing environment variables:",
        error,
      );
      // Still connect to MCP without payment features
      await this.mcp.connect(`${this.env.BACKEND_URL}/mcp`);
    }
  }

  async onRequest(request: Request): Promise<Response> {
    return new Response(
      JSON.stringify({
        status: "TedixAgent is running",
        address: this.x402Client ? "initialized" : "not initialized",
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  async onMessage(conn: Connection, message: WSMessage) {
    if (typeof message === "string") {
      try {
        const parsed = JSON.parse(message as string);
        if (parsed?.type) {
          switch (parsed.type) {
            case "confirm":
            case "cancel": {
              const confirmed = parsed.type === "confirm";
              this.confirmations[parsed.confirmationId]?.(confirmed);
              return;
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
  }
}
