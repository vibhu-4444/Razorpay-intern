import React from 'react';
import { AuditEvent } from '../../domain/audit';

interface AuditTrailTableProps {
  events: AuditEvent[];
  title?: string;
}

export const AuditTrailTable: React.FC<AuditTrailTableProps> = ({
  events,
  title = 'Immutable System Audit Trail',
}) => {
  const getActorDotColor = (actor: string) => {
    switch (actor) {
      case 'AI_MODEL_ENGINE': return 'bg-tertiary';
      case 'POLICY_ARBITER': return 'bg-primary';
      case 'PAYMENT_GATEWAY': return 'bg-emerald-600';
      case 'SYSTEM_WEBHOOK': return 'bg-secondary';
      default: return 'bg-outline';
    }
  };

  return (
    <div className="bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/30 shadow-xs">
      <div className="p-space-base bg-surface-container-low/60 flex items-center justify-between border-b border-surface-container">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
          <h2 className="text-sm font-semibold text-on-surface">{title}</h2>
        </div>
        <span className="text-[11px] text-outline font-mono">SHA256 Signed</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-high/40 text-on-surface-variant text-[11px] uppercase tracking-wider font-semibold">
              <th className="py-2.5 px-space-base">Actor</th>
              <th className="py-2.5 px-space-base">Timestamp</th>
              <th className="py-2.5 px-space-base">Action</th>
              <th className="py-2.5 px-space-base text-right">Result</th>
            </tr>
          </thead>
          <tbody className="text-xs divide-y divide-surface-container-high/60 font-body-sm">
            {events.map((evt) => (
              <tr key={evt.id} className="hover:bg-surface-container-low/40 transition-colors">
                <td className="py-3 px-space-base font-medium text-on-surface flex items-center gap-2 whitespace-nowrap">
                  <span className={`w-2 h-2 rounded-full ${getActorDotColor(evt.actor)}`} />
                  <span>{evt.actor.replace(/_/g, ' ')}</span>
                </td>
                <td className="py-3 px-space-base font-mono text-outline whitespace-nowrap">
                  {evt.timestamp}
                </td>
                <td className="py-3 px-space-base text-on-surface-variant">
                  {evt.action}
                </td>
                <td className="py-3 px-space-base text-right whitespace-nowrap">
                  <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-mono bg-surface-container-high text-primary font-semibold border border-primary/20">
                    {evt.result}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
