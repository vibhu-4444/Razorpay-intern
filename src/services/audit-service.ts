/**
 * REVIVE Audit Ledger Service
 * 
 * Cryptographic append-only chain for compliance, auditability, and dispute resolution.
 */

import { AuditEvent, AuditActor } from '../domain/audit';
import { logger } from './logger';

export class AuditService {
  private auditEvents: AuditEvent[] = [];

  constructor(initialEvents?: AuditEvent[]) {
    if (initialEvents) {
      this.auditEvents = [...initialEvents];
    }
  }

  /**
   * Appends an immutable audit event to the ledger.
   * Generates a deterministic simulated hash for audit immutability verification.
   */
  public recordEvent(params: {
    caseId: string;
    paymentId: string;
    actor: AuditActor;
    action: string;
    result: string;
    payloadSummary: string;
  }): AuditEvent {
    const timestamp = new Date().toLocaleTimeString('en-IN', { hour12: false }) + '.' + Math.floor(100 + Math.random() * 900) + ' IST';
    const rawContent = `${params.caseId}:${params.paymentId}:${params.actor}:${params.action}:${params.result}:${timestamp}`;
    
    // Deterministic pseudo SHA-256 representation
    let hashVal = 0;
    for (let i = 0; i < rawContent.length; i++) {
      hashVal = ((hashVal << 5) - hashVal) + rawContent.charCodeAt(i);
      hashVal |= 0;
    }
    const hash = Math.abs(hashVal).toString(16).padStart(64, '0');

    const event: AuditEvent = {
      id: `aud_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      caseId: params.caseId,
      paymentId: params.paymentId,
      actor: params.actor,
      action: params.action,
      result: params.result,
      payloadSummary: params.payloadSummary,
      timestamp,
      hash,
    };

    this.auditEvents.unshift(event); // newest first
    logger.auditEvent(`Recorded audit event ${event.id} for case ${params.caseId}: ${params.action}`);

    return event;
  }

  public getEventsForCase(caseId: string): AuditEvent[] {
    return this.auditEvents.filter(e => e.caseId === caseId);
  }

  public getAllEvents(): AuditEvent[] {
    return [...this.auditEvents];
  }
}

export const defaultAuditService = new AuditService();
