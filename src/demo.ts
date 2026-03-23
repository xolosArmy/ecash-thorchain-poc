import { ThorchainClient } from "./thorchainClient.js";
import { QuoteInspector } from "./quoteInspector.js";

async function main(): Promise<void> {
  const client = new ThorchainClient();

  const fromAsset = "BTC.BTC";
  const toAsset = "ETH.ETH";
  const amountToSwap = "100000";
  const destination = "0x86d526d6624AbC0178cF7296cD538Ecc080A95F1";

  console.log("Fetching inbound addresses...");
  const inbound = await client.getInboundAddresses();

  const fromChain = fromAsset.split(".")[0];
  const inboundState = inbound.find((x) => x.chain === fromChain);

  console.log(
    `\nFetching sample swap quote for ${amountToSwap} sats (${fromAsset} -> ${toAsset})...`
  );

  const quote = await client.getSwapQuote({
    fromAsset,
    toAsset,
    amount: amountToSwap,
    destination,
    streamingInterval: 1,
    streamingQuantity: 0
  });

  const normalized = QuoteInspector.analyze(quote, inboundState, amountToSwap);

  console.log("\n--- Tonalli Normalized Quote ---");
  console.log(JSON.stringify(normalized, null, 2));

  console.log("\n--- Safety Report ---");
  if (!normalized.isViable) {
    console.log("❌ SWAP BLOCKED:");
    console.log(`   Reason: ${normalized.blockerReason}`);
  } else {
    console.log("✅ SWAP IS VIABLE.");
    console.log(`   Target vault: ${normalized.targetVaultAddress}`);
    console.log(`   OP_RETURN memo: ${normalized.opReturnMemo}`);
    console.log(`   Recommended Gas: ${normalized.recommendedGasRate || "N/A"}`);
    console.log(
      `   Recommended Min Input: ${normalized.recommendedMinAmountIn || "N/A"}`
    );
    console.log(`   Dust Threshold: ${normalized.dustThreshold || "N/A"}`);

    if (normalized.warnings.length > 0) {
      console.log(`   ⚠️ Warnings: ${normalized.warnings.join(" | ")}`);
    }
    if (normalized.advisories.length > 0) {
      console.log(`   ℹ️ Advisories: ${normalized.advisories.join(" | ")}`);
    }
  }
}

main().catch((error) => {
  console.error("Demo failed:", error);
  process.exit(1);
});
