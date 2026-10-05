import React, { useState, useEffect, useMemo, useCallback } from 'react';
import defaultBuildingJson from './data/defaultBuilding.json';
import type { BuildingData } from './types/building';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Language } from './utils/i18n';
import { t, exportToCsv, formatDate } from './utils/i18n';
import { findEvacuationRoute } from './utils/dijkstra';
import { TopAppBar, type ThemeMode } from './components/TopAppBar';
import { BuildingMap } from './components/BuildingMap';
import { RouteSummary } from './components/RouteSummary';
import { HazardControls } from './components/HazardControls';
import { WalkthroughControls } from './components/WalkthroughControls';
import { DatasetModal } from './components/DatasetModal';

export const App: React.FC = () => {
  // 1. App State & Preferences (localStorage with app:v1: namespace)
  const [lang, setLang] = useLocalStorage<Language>('language', 'en');
  const [theme, setTheme] = useLocalStorage<ThemeMode>('theme', 'system');
  const [buildingData, setBuildingData] = useLocalStorage<BuildingData>(
    'building_data',
    defaultBuildingJson as BuildingData
  );

  const [startNodeId, setStartNodeId] = useLocalStorage<string>('start_node', 'R1');
  const [blockedNodesList, setBlockedNodesList] = useLocalStorage<string[]>(
    'blocked_nodes',
    defaultBuildingJson.initial_state.blocked_nodes
  );
  const [blockedEdgesList, setBlockedEdgesList] = useLocalStorage<string[]>(
    'blocked_edges',
    defaultBuildingJson.initial_state.blocked_edges
  );
  const [closedExitsList, setClosedExitsList] = useLocalStorage<string[]>(
    'closed_exits',
    defaultBuildingJson.initial_state.closed_exits
  );

  // 2. UI Modals & Walkthrough State
  const [isDatasetModalOpen, setIsDatasetModalOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Check for scenario URL parameter on initial mount (for automated verification & screenshots)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const scenario = params.get('scenario');
    if (scenario === 'baseline') {
      setStartNodeId('R1');
      setBlockedNodesList([]);
      setBlockedEdgesList([]);
      setClosedExitsList([]);
    } else if (scenario === 'blocked_c2') {
      setStartNodeId('R1');
      setBlockedNodesList(['C2']);
      setBlockedEdgesList([]);
      setClosedExitsList([]);
    } else if (scenario === 'exits_closed') {
      setStartNodeId('R1');
      setBlockedNodesList([]);
      setBlockedEdgesList([]);
      setClosedExitsList(['E1', 'E2']);
    } else if (scenario === 'start_r2') {
      setStartNodeId('R2');
      setBlockedNodesList([]);
      setBlockedEdgesList([]);
      setClosedExitsList([]);
    } else if (scenario === 'blocked_start') {
      setStartNodeId('R1');
      setBlockedNodesList(['R1']);
      setBlockedEdgesList([]);
      setClosedExitsList([]);
    }
  }, [setStartNodeId, setBlockedNodesList, setBlockedEdgesList, setClosedExitsList]);

  // Convert state arrays to Sets for fast lookup
  const blockedNodes = useMemo(() => new Set(blockedNodesList), [blockedNodesList]);
  const blockedEdges = useMemo(() => new Set(blockedEdgesList), [blockedEdgesList]);
  const closedExits = useMemo(() => new Set(closedExitsList), [closedExitsList]);

  // 3. Theme effect (handles Light, Dark, and System preference)
  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    mediaQuery.addEventListener('change', applyTheme);
    return () => mediaQuery.removeEventListener('change', applyTheme);
  }, [theme]);

  // 4. Document language attribute effect
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // 5. Reactive Route Calculation
  const routeResult = useMemo(() => {
    return findEvacuationRoute(buildingData, startNodeId, blockedNodes, blockedEdges, closedExits);
  }, [buildingData, startNodeId, blockedNodes, blockedEdges, closedExits]);

  // Reset walkthrough step if route changes
  useEffect(() => {
    setActiveStepIndex(null);
    setIsPlaying(false);
  }, [routeResult.path]);

  // 6. Hazard Handlers
  const handleToggleNodeBlock = useCallback(
    (nodeId: string) => {
      setBlockedNodesList((prev) =>
        prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
      );
    },
    [setBlockedNodesList]
  );

  const handleToggleEdgeBlock = useCallback(
    (edgeId: string) => {
      setBlockedEdgesList((prev) =>
        prev.includes(edgeId) ? prev.filter((id) => id !== edgeId) : [...prev, edgeId]
      );
    },
    [setBlockedEdgesList]
  );

  const handleToggleExitClosed = useCallback(
    (exitId: string) => {
      setClosedExitsList((prev) =>
        prev.includes(exitId) ? prev.filter((id) => id !== exitId) : [...prev, exitId]
      );
    },
    [setClosedExitsList]
  );

  const handleResetHazards = useCallback(() => {
    setBlockedNodesList(buildingData.initial_state.blocked_nodes || []);
    setBlockedEdgesList(buildingData.initial_state.blocked_edges || []);
    setClosedExitsList(buildingData.initial_state.closed_exits || []);
    setActiveStepIndex(null);
    setIsPlaying(false);
  }, [buildingData, setBlockedNodesList, setBlockedEdgesList, setClosedExitsList]);

  // Quick Sample Scenarios (Section 4.1)
  const handleRunScenario = useCallback(
    (scenario: 'baseline' | 'blocked_c2' | 'exits_closed' | 'start_r2' | 'blocked_start') => {
      switch (scenario) {
        case 'baseline':
          setStartNodeId('R1');
          setBlockedNodesList([]);
          setBlockedEdgesList([]);
          setClosedExitsList([]);
          break;
        case 'blocked_c2':
          setStartNodeId('R1');
          setBlockedNodesList(['C2']);
          setBlockedEdgesList([]);
          setClosedExitsList([]);
          break;
        case 'exits_closed':
          setStartNodeId('R1');
          setBlockedNodesList([]);
          setBlockedEdgesList([]);
          setClosedExitsList(['E1', 'E2']);
          break;
        case 'start_r2':
          setStartNodeId('R2');
          setBlockedNodesList([]);
          setBlockedEdgesList([]);
          setClosedExitsList([]);
          break;
        case 'blocked_start':
          setStartNodeId('R1');
          setBlockedNodesList(['R1']);
          setBlockedEdgesList([]);
          setClosedExitsList([]);
          break;
      }
      setActiveStepIndex(null);
      setIsPlaying(false);
    },
    [setStartNodeId, setBlockedNodesList, setBlockedEdgesList, setClosedExitsList]
  );

  // Custom Dataset Handlers
  const handleLoadCustomData = useCallback(
    (data: BuildingData) => {
      setBuildingData(data);
      const defaultStart = data.nodes.find((n) => n.type !== 'exit')?.id || 'R1';
      setStartNodeId(defaultStart);
      setBlockedNodesList(data.initial_state.blocked_nodes || []);
      setBlockedEdgesList(data.initial_state.blocked_edges || []);
      setClosedExitsList(data.initial_state.closed_exits || []);
      setActiveStepIndex(null);
      setIsPlaying(false);
    },
    [setBuildingData, setStartNodeId, setBlockedNodesList, setBlockedEdgesList, setClosedExitsList]
  );

  const handleResetToDefaultBuilding = useCallback(() => {
    handleLoadCustomData(defaultBuildingJson as BuildingData);
  }, [handleLoadCustomData]);

  // Export handlers
  const handleExportCsv = () => {
    const headers = [
      'Timestamp',
      'Building',
      'Start Location',
      'Target Exit',
      'Total Cost',
      'Status',
      'Node Sequence',
      'Traversed Corridors',
    ];
    const row = [
      formatDate(new Date(), lang),
      buildingData.building,
      startNodeId,
      routeResult.targetExitId || 'N/A',
      routeResult.totalCost,
      routeResult.status,
      routeResult.path.join(' -> '),
      routeResult.edgeIds.join(', '),
    ];
    exportToCsv(`smart-escape-route-${startNodeId}`, headers, [row]);
  };

  const handleExportPng = () => {
    const svg = document.getElementById('evacuation-svg-map') as SVGSVGElement | null;
    if (!svg) return;

    try {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1600;
        canvas.height = 1000;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = document.documentElement.classList.contains('dark')
            ? '#0e1415'
            : '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

          const pngURL = canvas.toDataURL('image/png');
          const dl = document.createElement('a');
          dl.download = `smart-escape-${buildingData.building.replace(/\s+/g, '_')}.png`;
          dl.href = pngURL;
          dl.click();
        }
        URL.revokeObjectURL(blobURL);
      };
      image.src = blobURL;
    } catch (e) {
      console.error('Failed to export PNG:', e);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-surface text-on-surface ${lang === 'bn' ? 'font-bengali' : ''}`}>
      {/* 64px M3 Top App Bar */}
      <TopAppBar
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeChange={setTheme}
        onResetHazards={handleResetHazards}
        onOpenUpload={() => setIsDatasetModalOpen(true)}
        onExportCsv={handleExportCsv}
        onExportPng={handleExportPng}
        buildingName={buildingData.building}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Status / Telemetry Summary */}
        <RouteSummary
          routeResult={routeResult}
          startNodeId={startNodeId}
          lang={lang}
        />

        {/* Step Walkthrough Controls (Bonus R10) */}
        <WalkthroughControls
          routeResult={routeResult}
          activeStepIndex={activeStepIndex}
          setActiveStepIndex={setActiveStepIndex}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          lang={lang}
        />

        {/* Core Layout: SVG Map + Hazard Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Interactive Map Column */}
          <div className="lg:col-span-7 xl:col-span-8 w-full flex flex-col gap-4">
            <BuildingMap
              buildingData={buildingData}
              startNodeId={startNodeId}
              onSelectStartNode={setStartNodeId}
              blockedNodes={blockedNodes}
              onToggleNodeBlock={handleToggleNodeBlock}
              blockedEdges={blockedEdges}
              onToggleEdgeBlock={handleToggleEdgeBlock}
              closedExits={closedExits}
              onToggleExitClosed={handleToggleExitClosed}
              routeResult={routeResult}
              activeStepIndex={activeStepIndex}
              lang={lang}
            />
          </div>

          {/* Hazard Control Panel Column */}
          <div className="lg:col-span-5 xl:col-span-4 w-full">
            <HazardControls
              buildingData={buildingData}
              startNodeId={startNodeId}
              onSelectStartNode={setStartNodeId}
              blockedNodes={blockedNodes}
              onToggleNodeBlock={handleToggleNodeBlock}
              blockedEdges={blockedEdges}
              onToggleEdgeBlock={handleToggleEdgeBlock}
              closedExits={closedExits}
              onToggleExitClosed={handleToggleExitClosed}
              onRunScenario={handleRunScenario}
              lang={lang}
            />
          </div>
        </div>
      </main>

      {/* Custom Dataset Upload Modal */}
      <DatasetModal
        isOpen={isDatasetModalOpen}
        onClose={() => setIsDatasetModalOpen(false)}
        onLoadData={handleLoadCustomData}
        onResetToDefault={handleResetToDefaultBuilding}
        currentBuildingName={buildingData.building}
        lang={lang}
      />

      {/* M3 Footer */}
      <footer className="w-full bg-surface-container-low py-4 px-6 text-center text-xs text-on-surface-variant border-t border-surface-container">
        <p>
          {t('appTitle', lang)} · {t('diuBranding', lang)} · {t('tagline', lang)}
        </p>
      </footer>
    </div>
  );
};

export default App;
