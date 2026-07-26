// Reputação por cliente de contrato — fonte da verdade única compartilhada
// entre App.tsx (assinatura/efeitos) e ContractsModal.tsx (exibição), pra
// evitar a fórmula de bônus/bloqueio divergir entre os dois lugares.

export interface ClientStanding {
  score: number;
  blockedUntilDay?: number;
}

export type ClientReputationMap = Record<string, ClientStanding>;

export const LOYALTY_MIN_SCORE = 3;
export const LOYALTY_MAX_BONUS_PCT = 20;
export const LOYALTY_PCT_PER_POINT = 5;
export const BROKEN_CLIENT_COOLDOWN_DAYS = 30;

// +5% de bônus no preço do contrato por ponto de fidelidade a partir do 3º
// ponto (score 3 → +5%, 4 → +10%, 5 → +15%, 6+ → +20%, teto).
export function getLoyaltyBonusPct(score: number | undefined): number {
  if (!score || score < LOYALTY_MIN_SCORE) return 0;
  return Math.min(LOYALTY_MAX_BONUS_PCT, (score - (LOYALTY_MIN_SCORE - 1)) * LOYALTY_PCT_PER_POINT);
}

export function isClientBlocked(standing: ClientStanding | undefined, currentDay: number): boolean {
  return !!standing?.blockedUntilDay && standing.blockedUntilDay > currentDay;
}
