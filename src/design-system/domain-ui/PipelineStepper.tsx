import React from 'react';
import { PIPELINE_FUNNEL } from '../../data/historical-stats';

export interface PipelineStepData {
  step: string;
  title: string;
  count: number;
  conversionRate: number;
  color: string;
}

interface PipelineStepperProps {
  steps?: PipelineStepData[];
}

export const PipelineStepper: React.FC<PipelineStepperProps> = ({ steps = PIPELINE_FUNNEL }) => {
  return (
    <div className="bg-surface-container-lowest p-space-lg rounded-xl border border-outline-variant/30 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-space-base">
        <div>
          <h2 className="text-base font-semibold text-on-surface">
            Deterministic Recovery Pipeline
          </h2>
          <p className="text-xs text-on-surface-variant">
            Funnel drop-off and conversion rates across sequential evaluation steps.
          </p>
        </div>
        <div className="flex items-center gap-1 text-xs text-secondary">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">verified</span>
          <span>All recovery policies deterministic</span>
        </div>
      </div>

      {/* 6-col Step Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-space-sm">
        {steps.map((step, idx) => {
          const isFinal = idx === steps.length - 1;
          return (
            <div
              key={step.step}
              className={`p-space-md rounded-lg relative overflow-hidden flex flex-col justify-between border border-outline-variant/20 ${
                isFinal 
                  ? 'bg-gradient-to-br from-surface-container-low to-emerald-50/60 border-emerald-200' 
                  : 'bg-surface-container-low'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-secondary text-[11px] mb-1">
                  <span className="font-semibold">{step.step}</span>
                  <span className={`font-mono font-medium ${isFinal ? 'text-emerald-800 font-bold' : ''}`}>
                    {step.conversionRate}%
                  </span>
                </div>
                <div className={`text-xl font-bold font-data-mono ${isFinal ? 'text-emerald-700' : 'text-on-surface'}`}>
                  {step.count}
                </div>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {step.title}
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-space-md overflow-hidden">
                <div
                  className={`h-full rounded-full ${step.color}`}
                  style={{ width: `${step.conversionRate}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
