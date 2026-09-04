import React, { useState, useEffect } from 'react';
import { AppShell, NavRoute } from './design-system';
import { defaultRecoveryService } from './services/recovery-service';
import { RecoveryCase } from './domain/recovery-case';

import { OverviewView } from './views/OverviewView';
import { RecoveryCasesView } from './views/RecoveryCasesView';
import { CaseDetailView } from './views/CaseDetailView';
import { DecisionCenterView } from './views/DecisionCenterView';
import { ExceptionsView } from './views/ExceptionsView';
import { AnalyticsView } from './views/AnalyticsView';
import { EvaluationLabView } from './views/EvaluationLabView';
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
      case 'analytics': return 'Recovery Analytics';
      case 'evaluation-lab': return 'Evaluation Lab';
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
      {currentRoute === 'overview' && (
        <OverviewView
          cases={cases}
          kpis={kpis}
          onSelectCase={handleSelectCase}
          onNavigateExceptions={() => setCurrentRoute('exceptions')}
        />
      )}

      {currentRoute === 'recovery-cases' && (
        <RecoveryCasesView
          cases={cases}
          onSelectCase={handleSelectCase}
          onOpenDecisionCenter={handleOpenDecisionCenter}
        />
      )}

      {currentRoute === 'case-detail' && (
        <CaseDetailView
          recoveryCase={selectedCase}
          onBack={() => setCurrentRoute('recovery-cases')}
          onOpenDecisionCenter={handleOpenDecisionCenter}
        />
      )}

      {currentRoute === 'decision-center' && (
        <DecisionCenterView
          recoveryCase={selectedCase}
          recoveryService={defaultRecoveryService}
          onBack={() => setCurrentRoute('case-detail')}
          onCaseUpdated={handleCaseUpdated}
        />
      )}

      {currentRoute === 'exceptions' && (
        <ExceptionsView
          cases={cases}
          onSelectCase={handleSelectCase}
          onOpenDecisionCenter={handleOpenDecisionCenter}
        />
      )}

      {currentRoute === 'analytics' && <AnalyticsView />}

      {currentRoute === 'evaluation-lab' && <EvaluationLabView />}

      {currentRoute === 'settings' && <SettingsView />}
    </AppShell>
  );
};
