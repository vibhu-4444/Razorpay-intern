/**
 * REVIVE AI Advisory Layer: Interfaces
 * 
 * Defines statistical recommendations and machine-learning telemetry.
 * Strictly bounded: AI outputs are ADVISORY proposals, never execution permits.
 */

import { RecoveryActionType, RecoveryChannel } from '../domain/recovery-action';
import { TelemetrySignal } from '../domain/recovery-case';

export interface AIRecommendation {
  prescribedAction: RecoveryActionType;
  channel: RecoveryChannel;
  modelConfidencePercentage: number;
  expectedRecoveryLikelihood: number;
  recommendedCooldownSeconds: number;
  maxCooldownSeconds: number;
  synthesizedRationale: string;
  signals: TelemetrySignal[];
  weightVector: string;
  modelLatencyMs: number;
  modelVersion: string;              // e.g. "Prediction Model v4.2"
  isAdvisoryOnly: true;              // Type-level contract enforcing advisory status
}

// Hinglish Architectural Note:
// isAdvisoryOnly: true ko literal type banaya gaya hai.
// Frontend ya backend mein agar koi galti se AI output ko direct execution payload
// samajh le, toh compile time par hi type mismatch throw ho sake.
