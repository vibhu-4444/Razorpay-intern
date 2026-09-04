/**
 * REVIVE Structured Observability Logger
 * 
 * Explicitly segregates AI decisions, Policy evaluations, Gateway executions,
 * and System telemetry into distinct operational channels.
 */

export type LogCategory = 
  | 'AI_DECISION'
  | 'POLICY_DECISION'
  | 'EXECUTION_ATTEMPT'
  | 'PROVIDER_RESPONSE'
  | 'AUDIT_EVENT'
  | 'SYSTEM_ERROR';

export interface LogEntry {
  timestamp: string;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
}

class ObservabilityLogger {
  private inMemoryLogs: LogEntry[] = [];

  private log(category: LogCategory, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      context,
    };
    this.inMemoryLogs.push(entry);

    if (process.env.NODE_ENV !== 'test') {
      const prefix = `[REVIVE::${category}]`;
      // eslint-disable-next-line no-console
      console.log(`${prefix} ${message}`, context ? context : '');
    }
  }

  public aiDecision(message: string, context?: Record<string, unknown>): void {
    this.log('AI_DECISION', message, context);
  }

  public policyDecision(message: string, context?: Record<string, unknown>): void {
    this.log('POLICY_DECISION', message, context);
  }

  public executionAttempt(message: string, context?: Record<string, unknown>): void {
    this.log('EXECUTION_ATTEMPT', message, context);
  }

  public providerResponse(message: string, context?: Record<string, unknown>): void {
    this.log('PROVIDER_RESPONSE', message, context);
  }

  public auditEvent(message: string, context?: Record<string, unknown>): void {
    this.log('AUDIT_EVENT', message, context);
  }

  public systemError(message: string, context?: Record<string, unknown>): void {
    this.log('SYSTEM_ERROR', message, context);
  }

  public getRecentLogs(count = 50): LogEntry[] {
    return this.inMemoryLogs.slice(-count);
  }
}

export const logger = new ObservabilityLogger();
