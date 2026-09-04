/**
 * REVIVE AI Recommendation Layer: RecoveryRecommendationService
 * 
 * Recommends bounded recovery actions based on failure diagnosis,
 * past attempts, amount risk, and customer relationship tier.
 */

import { Payment } from '../domain/payment';
import { Customer } from '../domain/customer';
import { RecoveryActionType, RecoveryChannel } from '../domain/recovery-action';
import { StructuredDiagnosis } from './diagnosis-service';

export interface RecoveryRecommendation {
  action: RecoveryActionType;
  channel: RecoveryChannel;
  confidence: number;            // 0.0 - 1.0
  confidencePercentage: number;  // 0 - 100
  reason: string;
  expectedOutcome: string;
  recommendedCooldownSeconds: number;
  maxCooldownSeconds: number;
  isAdvisoryOnly: true;          // Compile-time invariant
}

export interface IRecoveryRecommendationService {
  recommendAction(
    payment: Payment,
    customer: Customer,
    diagnosis: StructuredDiagnosis
  ): Promise<RecoveryRecommendation>;
}

export class RecoveryRecommendationService implements IRecoveryRecommendationService {
  /**
   * Generates bounded recommendation based on failure diagnosis.
   * 
   * Hinglish Comment:
   * AI recommendation hamesha advisory proposal hoti hai.
   * Agar model ka confidence < 0.60 hai, toh recommendation automatically
   * ESCALATE_TO_HUMAN set hoti hai taaki risky automated execution na ho.
   */
  public async recommendAction(
    payment: Payment,
    _customer: Customer,
    diagnosis: StructuredDiagnosis
  ): Promise<RecoveryRecommendation> {
    // Low confidence guard: automatically route to human review
    if (diagnosis.confidence < 0.60) {
      return {
        action: 'ESCALATE_TO_HUMAN',
        channel: 'HUMAN_OPS_QUEUE',
        confidence: diagnosis.confidence,
        confidencePercentage: diagnosis.confidencePercentage,
        reason: 'Low AI confidence in root cause. Ambiguous signals require human operations review.',
        expectedOutcome: 'Triage by payment operations lead',
        recommendedCooldownSeconds: 0,
        maxCooldownSeconds: 0,
        isAdvisoryOnly: true,
      };
    }

    const category = payment.failure?.category ?? 'TECHNICAL_ERROR';

    switch (category) {
      case 'BANK_DECLINE':
      case 'NETWORK_TIMEOUT':
      case 'GATEWAY_TIMEOUT': {
        return {
          action: 'RETRY_PAYMENT',
          channel: 'FALLBACK_GATEWAY_SWITCH',
          confidence: diagnosis.confidence,
          confidencePercentage: diagnosis.confidencePercentage,
          reason: `Transient bank downtime detected. Retry via secondary gateway with 40s cooldown.`,
          expectedOutcome: 'High recovery probability (~86%)',
          recommendedCooldownSeconds: 40,
          maxCooldownSeconds: 60,
          isAdvisoryOnly: true,
        };
      }

      case 'INSUFFICIENT_FUNDS': {
        return {
          action: 'SEND_REMINDER',
          channel: 'SMART_DUNNING_SMS',
          confidence: diagnosis.confidence,
          confidencePercentage: diagnosis.confidencePercentage,
          reason: 'Balance shortfall requires customer funding. Dispatch dunning notification with payment link.',
          expectedOutcome: 'Moderate recovery probability (~72%)',
          recommendedCooldownSeconds: 14400, // 4 hours
          maxCooldownSeconds: 86400,
          isAdvisoryOnly: true,
        };
      }

      case 'EXPIRED_PAYMENT_METHOD':
      case 'CARD_EXPIRED': {
        return {
          action: 'OFFER_ALTERNATIVE_METHOD',
          channel: 'WHATSAPP_MANDATE_UPDATE',
          confidence: diagnosis.confidence,
          confidencePercentage: diagnosis.confidencePercentage,
          reason: 'Card expired. Dispatched retries will fail. Request customer to update payment mandate.',
          expectedOutcome: 'High customer responsiveness (~88%)',
          recommendedCooldownSeconds: 0,
          maxCooldownSeconds: 0,
          isAdvisoryOnly: true,
        };
      }

      case 'VELOCITY_LIMIT':
      case 'DUPLICATE_ATTEMPT': {
        return {
          action: 'NO_ACTION',
          channel: 'NONE',
          confidence: diagnosis.confidence,
          confidencePercentage: diagnosis.confidencePercentage,
          reason: 'Retry budget exhausted or duplicate event. Prevent further execution to protect merchant standing.',
          expectedOutcome: 'Zero financial exposure',
          recommendedCooldownSeconds: 0,
          maxCooldownSeconds: 0,
          isAdvisoryOnly: true,
        };
      }

      default: {
        return {
          action: 'ESCALATE_TO_HUMAN',
          channel: 'HUMAN_OPS_QUEUE',
          confidence: 0.50,
          confidencePercentage: 50,
          reason: 'Unclassified payment failure. Forwarding to human review queue.',
          expectedOutcome: 'Manual ops triage',
          recommendedCooldownSeconds: 0,
          maxCooldownSeconds: 0,
          isAdvisoryOnly: true,
        };
      }
    }
  }
}

export const defaultRecommendationService = new RecoveryRecommendationService();
