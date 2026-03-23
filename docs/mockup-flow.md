# Conceptual UI/UX Flow (Tonalli Wallet)

This document outlines a conceptual user experience for a future eCash (XEC) interoperability path with THORChain inside Tonalli Wallet.

## Scope Boundary

This is a **conceptual wallet-side UX mockup** only.

It does **not** imply:
- native XEC support inside THORChain
- a live production bridge
- current mainnet-ready swap execution from XEC

Its purpose is to show how Tonalli Wallet could present THORChain-derived quote logic, safety checks, and transaction structure to the user once the relevant protocol-side support exists.

---

## Screen 1: Swap Initialization

The user selects the source asset, destination asset, amount, and destination address.

```text
+---------------------------------------+
|             TONALLI WALLET            |
+---------------------------------------+
|  [< Back]          Swap               |
|                                       |
|  You Pay:                             |
|  [ XEC ▼ ]  50,000,000.00             |
|  Available: 150,000,000 XEC           |
|                                       |
|               ( ↓ )                   |
|                                       |
|  You Receive (Estimated):             |
|  [ BTC ▼ ]  0.01450000                |
|                                       |
|  Destination Address:                 |
|  [ bc1qxy2kgdygjrsqtzq2n0yrf2... ]    |
|                                       |
|  [       Get Quote & Review       ]   |
+---------------------------------------+
