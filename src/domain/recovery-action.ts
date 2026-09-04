/**
 * REVIVE Domain Model: Recovery Action
 * 
 * Bounded action types that can be recommended by AI and authorized by the Policy Engine.
 */

export type RecoveryActionType = 
  | 'RETRY_PAYMENT'
  | 'SEND_REMINDER'
  | 'OFFER_ALTERNATIVE_METHOD'
  | 'ESCALATE_TO_HUMAN'
  | 'NO_ACTION';

export type RecoveryChannel = 
  | 'GATEWAY_ROUTED_RETRY'
  | 'FALLBACK_GATEWAY_SWITCH'
  | 'SMART_DUNNING_SMS'
  | 'SMART_DUNNING_EMAIL'
  | 'WHATSAPP_MANDATE_UPDATE'
  | 'HUMAN_OPS_QUEUE'
  | 'NONE';

export interface RecoveryActionParams {
  recommendedCooldownSeconds?: number;
  maxCooldownSeconds?: number;
  targetGateway?: 'RAZORPAY_PRIMARY' | 'RAZORPAY_SECONDARY' | 'FALLBACK_RAIL';
  dunningTemplateId?: string;
  idempotencyKey: string;
  notes?: string;
}

export interface RecoveryAction {
  type: RecoveryActionType;
  channel: RecoveryChannel;
  parameters: RecoveryActionParams;
  rationale: string;
  suggestedAt: string;
}

// Hinglish Architectural Note:
// Recovery actions ko bounded enum rakha hai taaki AI kabhi arbitrary actions
// (jaise direct customer account debit bina mandate, ya unknown third-party call)
// invent na kar sake. Sirf predefined safe action types hi policy engine se pass ho sakti hain.
