import { describe, it, expect } from 'vitest';
import { defaultFailureLabService } from '../../src/services/failure-lab-service';

describe('REVIVE Controlled Failure Lab & Resilience Integration', () => {
  it('Scenario 1 (Provider Timeout): asserts UNKNOWN_PROVIDER_STATE and suppresses blind duplicate retry', async () => {
    const res = await defaultFailureLabService.runScenario('SCENARIO_1_TIMEOUT');

    expect(res.scenarioId).toBe('SCENARIO_1_TIMEOUT');
    expect(res.providerDispatch.statusCode).toBe('TIMEOUT');
    expect(res.finalState.caseStatus).toBe('ESCALATED');
    expect(res.finalState.doubleDebitRiskPrevented).toBe(true);

    const timeoutCheck = res.safetyChecks.find(c => c.id === 'CHK_TO_1');
    expect(timeoutCheck?.passed).toBe(true);

    const suppressCheck = res.safetyChecks.find(c => c.id === 'CHK_TO_2');
    expect(suppressCheck?.passed).toBe(true);
  });

  it('Scenario 2 (Provider 503): captures outage and halts uncontrolled retry loops', async () => {
    const res = await defaultFailureLabService.runScenario('SCENARIO_2_PROVIDER_503');

    expect(res.scenarioId).toBe('SCENARIO_2_PROVIDER_503');
    expect(res.providerDispatch.statusCode).toBe('PROVIDER_503_UNAVAILABLE');
    expect(res.finalState.caseStatus).toBe('FAILED');
    expect(res.finalState.doubleDebitRiskPrevented).toBe(true);

    const outageCheck = res.safetyChecks.find(c => c.id === 'CHK_503_1');
    expect(outageCheck?.passed).toBe(true);
  });

  it('Scenario 3 (Duplicate Event): intercepts replayed idempotency token before provider execution', async () => {
    const res = await defaultFailureLabService.runScenario('SCENARIO_3_DUPLICATE_IDEMPOTENCY');

    expect(res.scenarioId).toBe('SCENARIO_3_DUPLICATE_IDEMPOTENCY');
    expect(res.policyDecision.allowed).toBe(false);
    expect(res.providerDispatch.statusCode).toBe('DUPLICATE_IDEMPOTENCY_KEY');
    expect(res.finalState.doubleDebitRiskPrevented).toBe(true);

    const idempPolicyCheck = res.safetyChecks.find(c => c.id === 'CHK_IDEMP_1');
    expect(idempPolicyCheck?.passed).toBe(true);

    const idempProviderCheck = res.safetyChecks.find(c => c.id === 'CHK_IDEMP_2');
    expect(idempProviderCheck?.passed).toBe(true);
  });

  it('Scenario 4 (Low AI Confidence): blocks autonomous execution and escalates to human review', async () => {
    const res = await defaultFailureLabService.runScenario('SCENARIO_4_LOW_CONFIDENCE');

    expect(res.scenarioId).toBe('SCENARIO_4_LOW_CONFIDENCE');
    expect(res.policyDecision.allowed).toBe(false);
    expect(res.policyDecision.requiresHumanReview).toBe(true);
    expect(res.providerDispatch.executed).toBe(false);

    const confCheck = res.safetyChecks.find(c => c.id === 'CHK_CONF_1');
    expect(confCheck?.passed).toBe(true);
  });

  it('Scenario 5 (Policy Invariant Conflict): deterministic policy overrules AI proposal with zero provider calls', async () => {
    const res = await defaultFailureLabService.runScenario('SCENARIO_5_POLICY_CONFLICT');

    expect(res.scenarioId).toBe('SCENARIO_5_POLICY_CONFLICT');
    expect(res.policyDecision.allowed).toBe(false);
    expect(res.policyDecision.blockingRule).toBe('Max Retries Ceiling Gate');
    expect(res.providerDispatch.executed).toBe(false);
    expect(res.finalState.doubleDebitRiskPrevented).toBe(true);

    const polCheck = res.safetyChecks.find(c => c.id === 'CHK_POL_1');
    expect(polCheck?.passed).toBe(true);
  });

  it('Scenario 6 (Issuer Hard Decline 05): correctly records decline without ghost settlement', async () => {
    const res = await defaultFailureLabService.runScenario('SCENARIO_6_ISSUER_DECLINE');

    expect(res.scenarioId).toBe('SCENARIO_6_ISSUER_DECLINE');
    expect(res.providerDispatch.statusCode).toBe('DECLINED');
    expect(res.finalState.paymentStatus).toBe('FAILED');
    expect(res.finalState.attemptCount).toBe(2);

    const decCheck = res.safetyChecks.find(c => c.id === 'CHK_DEC_1');
    expect(decCheck?.passed).toBe(true);
  });

  it('Safe Failure Scorecard: 100% of critical safety checks pass across all 6 scenarios', async () => {
    const scorecard = await defaultFailureLabService.runAllScenarios();

    expect(scorecard.totalScenariosTested).toBe(6);
    expect(scorecard.allCriticalChecksPassed).toBe(true);
    expect(scorecard.safetyScorePercentage).toBeGreaterThanOrEqual(95);
    expect(scorecard.passedChecks).toBe(scorecard.totalChecks);
  });
});
