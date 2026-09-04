/**
 * REVIVE Deterministic Policy Engine: Evaluator
 * 
 * "AI can recommend. Deterministic systems decide what the application is allowed to execute."
 */

import { PolicyDecision } from '../domain/policy';
import { 
  PolicyEvaluationContext, 
  checkMaxRetryLimit, 
  checkCooldownTiming, 
  checkCustomerVelocity, 
  checkAmountRiskCap, 
  checkFraudDisputeGate, 
  checkIdempotencyGate 
} from './rules';

export class PolicyEngine {
  private readonly policySetVersion = 'POL-REV-2024-Q4.active';
  private readonly kernelIdentifier = 'REVIVE_POLICY_KERNEL_v2.4';

  /**
   * Evaluates a recommended recovery action against sovereign deterministic rules.
   * 
   * Hinglish Comment:
   * Yahan model ka confidence chahe 99% ho ya AI bole "instant retry karo",
   * policy engine har invariant ko independently test karta hai.
   * Agar ek bhi critical rule (jaise max retries ya idempotency) fail ho gayi,
   * toh financial execution strictly block ho jayegi.
   */
  public evaluate(context: PolicyEvaluationContext): PolicyDecision {
    const ruleResults = [
      checkMaxRetryLimit(context),
      checkCooldownTiming(context),
      checkCustomerVelocity(context),
      checkAmountRiskCap(context),
      checkFraudDisputeGate(context),
      checkIdempotencyGate(context)
    ];

    const passedChecks = ruleResults.filter(r => r.passed);
    const failedChecks = ruleResults.filter(r => !r.passed);

    // Hard blockers that forbid execution entirely
    const hardBlock = failedChecks.some(r => 
      r.category === 'RETRY_LIMIT' || 
      r.category === 'FRAUD_GATE' || 
      r.category === 'IDEMPOTENCY_INTEGRITY'
    );

    // Soft blockers that flag for human review (e.g. amount exceeds standard autonomous limit)
    const softBlock = failedChecks.some(r => 
      r.category === 'AMOUNT_RISK_CAP' || 
      r.category === 'CUSTOMER_VELOCITY'
    );

    const allowed = failedChecks.length === 0;
    const requiresHumanReview = softBlock || (!allowed && !hardBlock);

    let blockingReason: string | undefined = undefined;
    if (failedChecks.length > 0) {
      blockingReason = failedChecks.map(f => `${f.ruleName}: ${f.details}`).join(' | ');
    }

    return {
      allowed,
      requiresHumanReview,
      checksPassed: passedChecks.length,
      totalChecks: ruleResults.length,
      ruleResults,
      blockingReason,
      evaluatedAt: new Date().toISOString(),
      evaluatedBy: this.kernelIdentifier,
      policySetVersion: this.policySetVersion
    };
  }
}

// Singleton instance for runtime convenience
export const defaultPolicyEngine = new PolicyEngine();
