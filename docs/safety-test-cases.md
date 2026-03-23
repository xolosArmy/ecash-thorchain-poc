# Wallet Safety & Quote Validation Cases

This document outlines the safety checks implemented in the `QuoteInspector` module. These pre-sign validations are critical to protect Tonalli Wallet users from failed transactions, lost funds, or network rejections.

## 1. Viable Swap (Happy Path)
**Scenario:** User requests a swap with an amount comfortably above the dust threshold and recommended minimums, and the network is fully operational.  
**Expected Wallet Behavior:** Proceed to transaction builder.

```json
{
  "isViable": true,
  "warnings": [
    "Do not cache this response. Do not send funds after the expiry."
  ],
  "targetVaultAddress": "bc1q...",
  "opReturnMemo": "=:e:0x86d5...:0/1/0",
  "recommendedGasRate": "6"
}
