import React, { useState, useEffect } from 'react';
import { AppShell, NavRoute } from './design-system';
import { defaultRecoveryService } from './services/recovery-service';
import { RecoveryCase } from './domain/recovery-case';

// Core Operations
import { OverviewView } from './views/OverviewView';
import { RecoveryCasesView } from './views/RecoveryCasesView';
import { CaseDetailView } from './views/CaseDetailView';
import { DecisionCenterView } from './views/DecisionCenterView';
import { ExceptionsView } from './views/ExceptionsView';
import { ExecutionCenterView } from './views/ExecutionCenterView';

// Intelligence, Evaluation & Safety
import { AnalyticsView } from './views/AnalyticsView';
import { EvaluationLabView } from './views/EvaluationLabView';
import { FailureLabView } from './views/FailureLabView';
import { PoliciesView } from './views/PoliciesView';
import { AuditExplorerView } from './views/AuditExplorerView';

// Studio & Infrastructure
import { DataStudioView } from './views/DataStudioView';
import { MerchantConfigView } from './views/MerchantConfigView';
import { SystemHealthView } from './views/SystemHealthView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>('overview');
  const [cases, setCases] = useState<RecoveryCase[]>(() => defaultRecoveryService.getAllCases());
  const [selectedCaseId, setSelectedCaseId] = useState<string>('RP-10482');

  // Dynamic subscription to recovery service state
  useEffect(() => {
    const unsubscribe = defaultRecoveryService.subscribe(() => {
      setCases([...defaultRecoveryService.getAllCases()]);
    });
    return unsubscribe;
  }, []);

  const kpis = defaultRecoveryService.getOverviewKPIs();
  const exceptionCount = kpis.needsReviewCount + kpis.policyBlockedCount + kpis.providerTimeoutCount;

  const selectedCase = cases.find(c => c.id === selectedCaseId) ?? cases[0];

  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setCurrentRoute('case-detail');
  };

  const handleOpenDecisionCenter = (id: string) => {
    setSelectedCaseId(id);
    setCurrentRoute('decision-center');
  };

  const handleCaseUpdated = (updatedCase: RecoveryCase) => {
    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
  };

  const getRouteTitle = (route: NavRoute): string => {
    switch (route) {
      case 'overview': return 'Command Center';
      case 'recovery-cases': return 'Recovery Cases';
      case 'case-detail': return `Case Dossier / ${selectedCaseId}`;
      case 'decision-center': return `Decision Center / ${selectedCaseId}`;
      case 'exceptions': return 'Exceptions & Review';
      case 'execution-center': return 'Recovery Execution Center';
      case 'analytics': return 'Recovery Analytics';
      case 'evaluation-lab': return 'AI Evaluation Lab';
      case 'failure-lab': return 'Failure Lab & Resilience';
      case 'policies': return 'Policies & Guardrails';
      case 'audit-explorer': return 'Audit Explorer';
      case 'data-studio': return 'Simulation Data Studio';
      case 'merchant-config': return 'Merchant Configuration';
      case 'system-health': return 'System Health & Provider Status';
      case 'settings': return 'Settings & Environment';
      default: return 'Console';
    }
  };

  return (
    <AppShell
      currentRoute={currentRoute}
      currentViewTitle={getRouteTitle(currentRoute)}
      onRouteChange={setCurrentRoute}
      exceptionCount={exceptionCount}
    >
      {/* 1. Command Center */}
      {currentRoute === 'overview' && (
        <OverviewView
          cases={cases}
          kpis={kpis}
          onSelectCase={handleSelectCase}
          onNavigateExceptions={() => setCurrentRoute('exceptions')}
        />
      )}

      {/* 2. Recovery Cases */}
      {currentRoute === 'recovery-cases' && (
        <RecoveryCasesView
          cases={cases}
          onSelectCase={handleSelectCase}
          onOpenDecisionCenter={handleOpenDecisionCenter}
        />
      )}

      {/* 3. Case Detail */}
      {currentRoute === 'case-detail' && (
        <CaseDetailView
          recoveryCase={selectedCase}
          onBack={() => setCurrentRoute('recovery-cases')}
          onOpenDecisionCenter={handleOpenDecisionCenter}
        />
      )}

      {/* 4. Decision Center */}
      {currentRoute === 'decision-center' && (
        <DecisionCenterView
          recoveryCase={selectedCase}
          recoveryService={defaultRecoveryService}
          onBack={() => setCurrentRoute('case-detail')}
          onCaseUpdated={handleCaseUpdated}
        />
      )}

      {/* 5. Exceptions / Human Review */}
      {currentRoute === 'exceptions' && (
        <ExceptionsView
          cases={cases}
          onSelectCase={handleSelectCase}
          onOpenDecisionCenter={handleOpenDecisionCenter}
        />
      )}

      {/* 6. Execution Center */}
      {currentRoute === 'execution-center' && <ExecutionCenterView />}

      {/* 7. Recovery Analytics */}
      {currentRoute === 'analytics' && <AnalyticsView />}

      {/* 8. Evaluation Lab */}
      {currentRoute === 'evaluation-lab' && <EvaluationLabView />}

      {/* 9. Failure Lab */}
      {currentRoute === 'failure-lab' && <FailureLabView />}

      {/* 10. Policies & Guardrails */}
      {currentRoute === 'policies' && <PoliciesView />}

      {/* 11. Audit Explorer */}
      {currentRoute === 'audit-explorer' && <AuditExplorerView />}

      {/* 12. Simulation Data Studio */}
      {currentRoute === 'data-studio' && <DataStudioView />}

      {/* 13. Merchant Configuration */}
      {currentRoute === 'merchant-config' && <MerchantConfigView />}

      {/* 14. System Health */}
      {currentRoute === 'system-health' && <SystemHealthView />}

      {/* 15. Settings & Environment */}
      {currentRoute === 'settings' && <SettingsView />}
    </AppShell>
  );
};
