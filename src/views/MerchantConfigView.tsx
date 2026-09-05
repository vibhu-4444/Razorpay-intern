/**
 * REVIVE View: Merchant Configuration
 * 
 * Merchant-level policy bounds, automation modes, customer protection limits,
 * and multi-channel communication routing preferences.
 * 
 * Stitch UI Compliant: Blue/White light theme, Inter font, tabular numbers, dense engineering layout.
 */

import React, { useState } from 'react';

export const MerchantConfigView: React.FC = () => {
  const [automationMode, setAutomationMode] = useState<'AUTONOMOUS' | 'HYBRID' | 'MANUAL'>('HYBRID');
  const [maxRetries, setMaxRetries] = useState<number>(3);
  const [cooldownSeconds, setCooldownSeconds] = useState<number>(40);
  const [maxAutonomousAmount, setMaxAutonomousAmount] = useState<number>(50000);
  const [minConfidence, setMinConfidence] = useState<number>(65);
  const [enableWhatsAppDunning, setEnableWhatsAppDunning] = useState<boolean>(true);
  const [enableEmailNotification, setEnableEmailNotification] = useState<boolean>(true);
  const [enableSmsAlerts, setEnableSmsAlerts] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/50 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl">tune</span>
            <h1 className="text-2xl font-bold text-on-surface tracking-tight">Merchant Configuration & SLA Limits</h1>
            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              ID: merch_razorpay_direct
            </span>
          </div>
          <p className="text-sm text-on-surface-variant max-w-3xl">
            Configure merchant-specific recovery policy ceilings, autonomous operational modes,
            and customer protection thresholds that govern all automated workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Configuration
          </button>
        </div>
      </div>

      {isSaved && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
          <span>Merchant configuration successfully updated in policy kernel memory store.</span>
        </div>
      )}

      {/* Grid: Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Operational Mode */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">smart_toy</span>
              Autonomous Operations Mode
            </h3>
            <p className="text-xs text-on-surface-variant">Controls whether the system executes actions automatically or requires operator sign-off.</p>
          </div>

          <div className="space-y-2 text-xs">
            {[
              {
                id: 'AUTONOMOUS',
                title: 'Full Autonomous Execution',
                desc: 'AI recommendations that pass deterministic policy gates execute automatically without delay.',
                badge: 'Maximum Recovery Speed',
              },
              {
                id: 'HYBRID',
                title: 'Hybrid Guarded Mode (Recommended)',
                desc: 'Actions with AI confidence >= 80% execute autonomously; lower confidence cases route to Human Ops.',
                badge: 'Recommended for FinTech',
              },
              {
                id: 'MANUAL',
                title: 'Manual Review Only',
                desc: 'All proposed recovery actions require explicit human operator authorization before provider dispatch.',
                badge: 'Maximum Governance',
              },
            ].map((mode) => (
              <label
                key={mode.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between cursor-pointer transition-colors ${
                  automationMode === mode.id
                    ? 'bg-primary-container/20 border-primary ring-1 ring-primary/30'
                    : 'bg-surface-container-low/60 border-outline-variant/30 hover:bg-surface-container-low'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="automationMode"
                    value={mode.id}
                    checked={automationMode === mode.id}
                    onChange={() => setAutomationMode(mode.id as any)}
                    className="mt-0.5"
                  />
                  <div>
                    <div className="font-semibold text-on-surface">{mode.title}</div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">{mode.desc}</div>
                  </div>
                </div>

                <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-on-surface-variant shrink-0">
                  {mode.badge}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Customer Protection & Policy Ceilings */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">shield</span>
              Customer Protection & Risk Limits
            </h3>
            <p className="text-xs text-on-surface-variant">Deterministic bounds enforced by POL_INV invariants.</p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-on-surface">Maximum Automated Retries</span>
                <span className="font-mono font-bold text-primary">{maxRetries} attempts</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                value={maxRetries}
                onChange={(e) => setMaxRetries(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-[11px] text-on-surface-variant mt-0.5">Card network compliance enforces a strict ceiling of 3 attempts.</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-on-surface">Cooldown Delay Between Retries</span>
                <span className="font-mono font-bold text-primary">{cooldownSeconds} seconds</span>
              </div>
              <input
                type="range"
                min={20}
                max={120}
                step={10}
                value={cooldownSeconds}
                onChange={(e) => setCooldownSeconds(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-[11px] text-on-surface-variant mt-0.5">Exponential backoff window to prevent card velocity spamming.</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-on-surface">Max Autonomous Ticket Amount</span>
                <span className="font-mono font-bold text-primary">₹{maxAutonomousAmount.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={100000}
                step={5000}
                value={maxAutonomousAmount}
                onChange={(e) => setMaxAutonomousAmount(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-[11px] text-on-surface-variant mt-0.5">Transactions exceeding this limit require human operations sign-off.</div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-on-surface">Minimum AI Confidence for Autonomous Action</span>
                <span className="font-mono font-bold text-primary">{minConfidence}%</span>
              </div>
              <input
                type="range"
                min={60}
                max={90}
                step={5}
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="text-[11px] text-on-surface-variant mt-0.5">AI proposals below this threshold are routed to human review.</div>
            </div>
          </div>
        </div>

        {/* Section 3: Smart Dunning Channels */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant/40 shadow-sm space-y-4 lg:col-span-2">
          <div className="border-b border-outline-variant/30 pb-3">
            <h3 className="font-bold text-sm text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-base">chat</span>
              Smart Dunning & Customer Notification Channels
            </h3>
            <p className="text-xs text-on-surface-variant">Channels authorized for sending recovery and update payment links.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <label className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableWhatsAppDunning}
                onChange={(e) => setEnableWhatsAppDunning(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <div className="font-semibold text-on-surface">WhatsApp Business API</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Send interactive mandate update and payment buttons over verified WhatsApp channel.</div>
              </div>
            </label>

            <label className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableEmailNotification}
                onChange={(e) => setEnableEmailNotification(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <div className="font-semibold text-on-surface">Smart Dunning Email</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Branded email template with pre-filled 1-click alternative method link.</div>
              </div>
            </label>

            <label className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/30 flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={enableSmsAlerts}
                onChange={(e) => setEnableSmsAlerts(e.target.checked)}
                className="mt-0.5 accent-primary"
              />
              <div>
                <div className="font-semibold text-on-surface">Transactional SMS</div>
                <div className="text-[11px] text-on-surface-variant mt-0.5">Direct SMS reminder with shortened encrypted invoice URL.</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
