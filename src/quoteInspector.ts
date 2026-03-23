import { SwapQuote, InboundAddress } from "./thorchainClient.js";

/**
 * Modelo normalizado para la UI de Tonalli.
 * Abstrae la complejidad de THORChain en un formato digerible para la wallet.
 */
export interface TonalliNormalizedQuote {
  isViable: boolean;
  blockerReason?: string;
  warnings: string[];
  advisories: string[];

  // Datos para la transacción UTXO
  targetVaultAddress: string;
  opReturnMemo: string;
  recommendedGasRate?: string;
  dustThreshold?: string;
  recommendedMinAmountIn?: string;

  // Datos para mostrar en UI
  expectedOutputAmount: string;
  estimatedTimeSeconds: number;
  totalFeesInBaseAsset: string;

  // Estado de tiempo
  expiryTimestamp: number;
  secondsUntilExpiry: number;
}

export class QuoteInspector {
  /**
   * Analiza la cotización y el estado de la red para determinar si es seguro
   * permitir al usuario proceder con el swap.
   */
  static analyze(
    quote: SwapQuote,
    inboundState?: InboundAddress,
    requestedAmountIn?: string
  ): TonalliNormalizedQuote {
    const currentTimestampSeconds = Math.floor(Date.now() / 1000);
    const secondsUntilExpiry = quote.expiry - currentTimestampSeconds;
    const isExpired = secondsUntilExpiry <= 0;

    let isViable = true;
    let blockerReason: string | undefined = undefined;
    const warnings: string[] = [];
    const advisories: string[] = [];

    // 1. Validación de estado de red
    if (!inboundState) {
      isViable = false;
      blockerReason = "Could not verify inbound vault state.";
    } else if (inboundState.halted) {
      isViable = false;
      blockerReason = "Inbound chain is halted for safety.";
    } else if (
      inboundState.global_trading_paused ||
      inboundState.chain_trading_paused
    ) {
      isViable = false;
      blockerReason = "Trading is paused globally or for this specific chain.";
    }

    // 2. Validación de expiración
    if (isViable && isExpired) {
      isViable = false;
      blockerReason = "Quote expired. Please request a new quote.";
    }

    // 3. Validación de montos mínimos y dust
    if (isViable && requestedAmountIn) {
      const amountInNum = Number(requestedAmountIn);
      const minAmountNum = Number(quote.recommended_min_amount_in || 0);
      const dustNum = Number(
        quote.dust_threshold || inboundState?.dust_threshold || 0
      );

      if (dustNum > 0 && amountInNum <= dustNum) {
        isViable = false;
        blockerReason = `Input amount is below or equal to the dust threshold (${dustNum}).`;
      } else if (minAmountNum > 0 && amountInNum < minAmountNum) {
        isViable = false;
        blockerReason = `Input amount is below the recommended minimum (${minAmountNum}).`;
      }
    }

    // 4. Procesamiento de advertencias y notas
    if (quote.warning) {
      if (quote.warning.toLowerCase().includes("halt")) {
        isViable = false;
        blockerReason = `Protocol warning: ${quote.warning}`;
      } else {
        warnings.push(quote.warning);
      }
    }

    if (quote.notes) {
      advisories.push(quote.notes);
    }

    return {
      isViable,
      blockerReason,
      warnings,
      advisories,
      targetVaultAddress: inboundState?.address || quote.inbound_address || "",
      opReturnMemo: quote.memo,
      recommendedGasRate: quote.recommended_gas_rate || inboundState?.gas_rate,
      dustThreshold: quote.dust_threshold || inboundState?.dust_threshold,
      recommendedMinAmountIn: quote.recommended_min_amount_in,
      expectedOutputAmount: quote.expected_amount_out,
      estimatedTimeSeconds:
        quote.total_swap_seconds || quote.inbound_confirmation_seconds,
      totalFeesInBaseAsset: quote.fees.total,
      expiryTimestamp: quote.expiry,
      secondsUntilExpiry: secondsUntilExpiry > 0 ? secondsUntilExpiry : 0
    };
  }
}
