import React, { useState } from 'react';
import { PageHeader } from '../design-system';

export const SettingsView: React.FC = () => {
  const [activeEnv, setActiveEnv] = useState<'SIMULATION' | 'RAZORPAY_SANDBOX'>('SIMULATION');
  const [maxRetries, setMaxRetries] = useState(3);
  const [cooldownSec, setCooldownSec] = useState(40);
  const [amountCap, setAmountCap] = useState(50000);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="flex flex-col space-y-space-lg">
      <PageHeader
        title="Settings & Environment"
        subtitle="Manage REVIVE environment parameters, AI decisioning boundaries, and audit trail integrity."
      >
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary text-xs font-semibold shadow-xs transition-all"
        >
          <span className="material-symbols-outlined text-[16px]">sync</span>
          <span>{savedSuccess ? 'Kernel Synchronized!' : 'Re-sync Kernel'}</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left Column (7 cols): Operational Environment */}
        <div className="lg:col-span-7 flex flex-col gap-space-lg">
          <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs overflow-hidden">
            <div className="px-space-lg py-space-md bg-surface-container-low flex items-center justify-between border-b border-surface-container">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">layers</span>
                <h2 className="text-sm font-semibold text-on-surface">Active Operational Environment</h2>
              </div>
              <span className="font-mono text-xs text-secondary">ENV_ID: SBX-982-SYNTH</span>
            </div>

            <div className="p-space-lg space-y-space-md">
              <div className="flex items-center justify-between p-space-md rounded-lg bg-surface-container border border-outline-variant/20">
                <div className="flex items-center gap-space-sm">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold block">Runtime Designation</span>
                    <span className="text-sm font-bold text-on-surface">
                      {activeEnv === 'SIMULATION' ? 'TEST MODE (HIGH-FIDELITY SIMULATION)' : 'RAZORPAY TESTNET (SANDBOX)'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-secondary block">Telemetry Stream</span>
                  <span className="font-mono text-xs text-on-surface font-medium">99.998% Synthetic Fidelity</span>
                </div>
              </div>

              {/* Safety banner */}
              <div className="flex items-start gap-space-sm p-space-md rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">shield_lock</span>
                <p>
                  All payment actions, gateway responses, and ledger settlements are simulated against synthetic merchant rails. No real financial currency is transacted or moved.
                </p>
              </div>

              {/* Environment Matrix */}
              <div className="space-y-space-sm pt-space-xs">
                <span className="text-xs uppercase tracking-wider text-secondary font-semibold">Environment Switching Matrix</span>

                {/* Option 1 */}
                <div
                  onClick={() => setActiveEnv('SIMULATION')}
                  className={`p-space-md rounded-xl border flex items-start gap-space-md cursor-pointer transition-all ${
                    activeEnv === 'SIMULATION'
                      ? 'bg-surface-container-low border-primary shadow-xs'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low/40'
                  }`}
                >
                  <div className="pt-0.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      activeEnv === 'SIMULATION' ? 'bg-primary border-primary text-on-primary' : 'border-outline'
                    }`}>
                      {activeEnv === 'SIMULATION' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="text-sm font-semibold text-on-surface">Test Mode / Simulation Sandbox</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase">
                        ACTIVE ROUTING
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      Full evaluation, synthetic scenario replay, and benchmark testing enabled. Deterministic failure injection enabled across all mock connectors.
                    </p>
                    <div className="flex items-center gap-space-md mt-2 font-mono text-[11px] text-on-surface-variant">
                      <span>Latency: ~12ms</span>
                      <span>•</span>
                      <span>Ledger Isolation: 100%</span>
                    </div>
                  </div>
                </div>

                {/* Option 2 */}
                <div
                  onClick={() => setActiveEnv('RAZORPAY_SANDBOX')}
                  className={`p-space-md rounded-xl border flex items-start gap-space-md cursor-pointer transition-all ${
                    activeEnv === 'RAZORPAY_SANDBOX'
                      ? 'bg-surface-container-low border-primary shadow-xs'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:bg-surface-container-low/40'
                  }`}
                >
                  <div className="pt-0.5">
                    <span className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                      activeEnv === 'RAZORPAY_SANDBOX' ? 'bg-primary border-primary text-on-primary' : 'border-outline'
                    }`}>
                      {activeEnv === 'RAZORPAY_SANDBOX' && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-space-sm">
                      <span className="text-sm font-semibold text-on-surface">Razorpay Testnet Connector</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-surface-container-high text-on-secondary-container font-bold uppercase">
                        STANDBY
                      </span>
                    </div>
                    <p className="text-xs text-secondary mt-1">
                      Direct sandbox connection utilizing Razorpay Test Key credentials (`rzp_test_...`).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (5 cols): Deterministic Guardrails Config */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <section className="rounded-xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs p-space-lg">
            <div className="flex items-center gap-2 pb-space-sm border-b border-surface-container mb-space-md">
              <span className="material-symbols-outlined text-primary text-[20px]">shield</span>
              <h2 className="text-sm font-semibold text-on-surface">Policy Guardrail Invariant Limits</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Max Automated Retries per Invoice</span>
                  <span className="font-mono text-primary">{maxRetries} attempts</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-outline">Hard safety ceiling preventing issuer card block</span>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Minimum Cooldown Window</span>
                  <span className="font-mono text-primary">{cooldownSec} seconds</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="120"
                  step="5"
                  value={cooldownSec}
                  onChange={(e) => setCooldownSec(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-outline">Exponential backoff threshold</span>
              </div>

              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Autonomous Value Threshold (INR)</span>
                  <span className="font-mono text-primary">₹{amountCap.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="200000"
                  step="10000"
                  value={amountCap}
                  onChange={(e) => setAmountCap(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-outline">Transactions exceeding this limit require human ops clearance</span>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 mt-4">
                <span className="font-semibold block mb-1 text-on-surface">Policy Spec Version</span>
                <span className="font-mono text-xs text-primary">POL-REV-2024-Q4.active</span>
                <p className="text-[11px] text-on-surface-variant mt-1">
                  Signed and immutable. Changes trigger audit ledger re-indexing.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
