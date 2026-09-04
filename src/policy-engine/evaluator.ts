/**
 * REVIVE Deterministic Policy Engine: Evaluator
 * 
 * "AI can recommend. Deterministic systems decide what the application is allowed to execute."
 * Enforces strict precedence:
 * Security/Validity -> Eligibility -> Duplicate -> Limits -> Confidence.
 */

import { PolicyDecision } from '../domain/policy';
import { 
  PolicyEvaluationContext, 
  checkPaymentStateEligibility,
  checkIdempotencyGate,
  checkFraudDisputeGate,
  checkMaxRetryLimit, 
  checkCooldownTiming, 
  checkAmountRiskCap, 
  checkAIConfidenceThreshold,
  checkCustomerVelocity, 
} from './rules';

export class PolicyEngine {
  private readonly policySetVersion = 'POL-REV-2024-Q4.active';
  private readonly kernelIdentifier = 'REVIVE_POLICY_KERNEL_v2.4';

  /**
   * Evaluates a recommended recovery action against sovereign deterministic rules in strict precedence order.
   * 
   * Hinglish Comment:
   * Policy precedence strict hai:
   * 1. Payment status valid hona chahiye (pehle se CAPTURED nahi).
   * 2. Idempotency key duplicate nahi honi chahiye.
   * 3. Fraud / chargeback dispute nahi hona chahiye.
   * 4. Max retries (3) exceed nahi honi chahiye.
   * 5. Cooldown satisfied hona chahiye.
   * 6. Amount autonomous threshold ke andar hona chahiye.
   * 7. AI confidence >= 60% hona chahiye.
   * Model ka confidence chahe 99% ho, agar koi higher precedence invariant fail ho jaye
   * toh financial execution immediately block ho jayegi.
   */
  public evaluate(context: PolicyEvaluationContext): PolicyDecision {
    // Evaluation in strict precedence order
    const ruleResults = [
      checkPaymentStateEligibility(context),
      checkIdempotencyGate(context),
      checkFraudDisputeGate(context),
      checkMaxRetryLimit(context),
      checkCooldownTiming(context),
      checkAmountRiskCap(context),
      checkAIConfidenceThreshold(context),
      checkCustomerVelocity(context),
    ];

    const passedChecks = ruleResults.filter(r => r.passed);
    const failedChecks = ruleResults.filter(r => !r.passed);

    // Hard blockers that forbid execution entirely (zero overrides allowed)
    const hardBlock = failedChecks.some(r => 
      r.ruleId === 'POL_INV_00' || // Invalid payment state
      r.ruleId === 'POL_INV_06' || // Duplicate or missing idempotency key
      r.ruleId === 'POL_INV_05' || // Fraud / chargeback dispute
      r.ruleId === 'POL_INV_01'    // Max retries ceiling reached
    );

    // Soft blockers that route case to human review (amount exceeded, low confidence, cooldown active)
    const softBlock = failedChecks.some(r => 
      r.ruleId === 'POL_INV_04' || // Amount risk cap
      r.ruleId === 'POL_INV_07' || // Low AI confidence (<60%)
      r.ruleId === 'POL_INV_03' || // Customer velocity limit
      r.ruleId === 'POL_INV_02'    // Cooldown window active
    );

    const allowed = failedChecks.length === 0;
    const requiresHumanReview = softBlock || (!allowed && !hardBlock);

    let blockingReason: string | undefined = undefined;
    if (failedChecks.length > 0) {
      blockingReason = failedChecks.map(f => `${f.ruleName}: ${f.details}`).join(' | ');
    }

    const blockingRule = failedChecks.length > 0 ? failedChecks[0].ruleName : undefined;

    return {
      allowed,
      requiresHumanReview,
      checksPassed: passedChecks.length,
      totalChecks: ruleResults.length,
      ruleResults,
      blockingReason,
      blockingRule,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: this.kernelIdentifier,
      policySetVersion: this.policySetVersion,
    };
  }
}

// Singleton instance for runtime convenience
export const defaultPolicyEngine = new PolicyEngine();
