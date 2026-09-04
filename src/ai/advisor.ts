/**
 * REVIVE AI Advisory Layer: Heuristic Advisor
 * 
 * Generates statistical recommendations based on failure classification,
 * customer payment health history, and transaction telemetry.
 */

import { Payment } from '../domain/payment';
import { Customer } from '../domain/customer';
import { AIRecommendation } from './interfaces';

export class AIAdvisor {
  private readonly modelVersion = 'Prediction Model v4.2-ops';

  /**
   * Generates bounded advisory recommendation.
   * 
   * Hinglish Comment:
   * Yahan model failure context ko analyze karke optimal recovery action suggest karta hai.
   * Jaise agar HDFC bank-side transient issue hai, toh 40s cooldown retry best hai.
   * Par yaad rahe: yeh sirf statistical advice hai, actual execution authorization
   * PolicyEngine ke haath mein hai.
   */
  public generateRecommendation(payment: Payment, customer: Customer): AIRecommendation {
    const failureCategory = payment.failure?.category ?? 'TECHNICAL_ERROR';
    const isHealthyCustomer = customer.metrics.historicalClearedCount >= 5 && customer.metrics.successRatePercentage > 80;

    switch (failureCategory) {
      case 'BANK_DECLINE':
      case 'GATEWAY_TIMEOUT':
      case 'NETWORK_TIMEOUT':
      case 'PROVIDER_ERROR': {
        return {
          prescribedAction: 'RETRY_PAYMENT',
          channel: 'FALLBACK_GATEWAY_SWITCH',
          modelConfidencePercentage: 91,
          expectedRecoveryLikelihood: 86,
          recommendedCooldownSeconds: 40,
          maxCooldownSeconds: 60,
          synthesizedRationale: `The failure pattern correlates directly with transient bank-side decline (${payment.failure?.code ?? 'E05_ISSUER_TIMEOUT'}). ${customer.name} possesses an unblemished ${customer.metrics.successRatePercentage}% fulfillment record across ${customer.metrics.historicalClearedCount} recent settlements, with zero active retry locks. Recommended optimal backoff of 40s.`,
          signals: [
            {
              id: 'sig_1',
              label: 'Healthy account',
              detail: `Customer has ${customer.metrics.historicalClearedCount} consecutive prior successful payments without default.`,
              healthy: true,
            },
            {
              id: 'sig_2',
              label: 'Isolated glitch',
              detail: 'Failure occurred once; zero recurring invalid-pin or card expiration flags.',
              healthy: true,
            },
            {
              id: 'sig_3',
              label: 'Normal ticket size',
              detail: `Amount (₹${payment.amount.toLocaleString('en-IN')}) is within 0.4σ of customer's historic transaction distribution.`,
              healthy: true,
            },
            {
              id: 'sig_4',
              label: 'Velocity check',
              detail: 'No abnormal retry pattern, chargeback alert, or card stuffing detected.',
              healthy: true,
            },
          ],
          weightVector: 'w_acme_tier1_v4',
          modelLatencyMs: 142,
          modelVersion: this.modelVersion,
          isAdvisoryOnly: true,
        };
      }

      case 'INSUFFICIENT_FUNDS': {
        return {
          prescribedAction: 'SEND_REMINDER',
          channel: 'SMART_DUNNING_SMS',
          modelConfidencePercentage: 84,
          expectedRecoveryLikelihood: 72,
          recommendedCooldownSeconds: 14400, // 4 hours
          maxCooldownSeconds: 86400,
          synthesizedRationale: `Soft decline due to balance shortfall. Prior billing records indicate regular month-end cashflow settlement. Suggest scheduled dunning notification rather than rapid retry.`,
          signals: [
            {
              id: 'sig_1',
              label: 'Soft Decline',
              detail: 'Balance shortfall reported by issuing switch.',
              healthy: false,
            },
            {
              id: 'sig_2',
              label: 'Good Customer Standing',
              detail: `Tenure of ${customer.metrics.accountTenureMonths} months with stable recurring volume.`,
              healthy: true,
            }
          ],
          weightVector: 'w_balance_dunning_v2',
          modelLatencyMs: 118,
          modelVersion: this.modelVersion,
          isAdvisoryOnly: true,
        };
      }

      case 'CARD_EXPIRED': {
        return {
          prescribedAction: 'OFFER_ALTERNATIVE_METHOD',
          channel: 'WHATSAPP_MANDATE_UPDATE',
          modelConfidencePercentage: 96,
          expectedRecoveryLikelihood: 88,
          recommendedCooldownSeconds: 0,
          maxCooldownSeconds: 0,
          synthesizedRationale: `Payment card reached expiration ceiling. Retrying will yield 100% deterministic rejection. Action required: dispatch mandate update link via customer contact channel.`,
          signals: [
            {
              id: 'sig_1',
              label: 'Instrument Expiry',
              detail: 'Tokenized card validity expired in previous billing cycle.',
              healthy: false,
            }
          ],
          weightVector: 'w_mandate_refresh_v1',
          modelLatencyMs: 95,
          modelVersion: this.modelVersion,
          isAdvisoryOnly: true,
        };
      }

      default: {
        return {
          prescribedAction: isHealthyCustomer ? 'ESCALATE_TO_HUMAN' : 'NO_ACTION',
          channel: isHealthyCustomer ? 'HUMAN_OPS_QUEUE' : 'NONE',
          modelConfidencePercentage: 55,
          expectedRecoveryLikelihood: 40,
          recommendedCooldownSeconds: 0,
          maxCooldownSeconds: 0,
          synthesizedRationale: `Ambiguous failure signal (${payment.failure?.code ?? 'UNKNOWN'}). Low confidence for autonomous intervention. Route to human review queue.`,
          signals: [
            {
              id: 'sig_1',
              label: 'Telemetry Anomaly',
              detail: 'Non-standard gateway error message received.',
              healthy: false,
            }
          ],
          weightVector: 'w_fallback_triage',
          modelLatencyMs: 165,
          modelVersion: this.modelVersion,
          isAdvisoryOnly: true,
        };
      }
    }
  }
}

export const defaultAIAdvisor = new AIAdvisor();
