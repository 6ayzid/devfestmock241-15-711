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
import { BottomDock } from './components/BottomDock';

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
  const [prevPath, setPrevPath] = useState(routeResult.path);
  if (prevPath !== routeResult.path) {
    setPrevPath(routeResult.path);
    setActiveStepIndex(null);
    setIsPlaying(false);
  }

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
      const blockedNodes = data.initial_state?.blocked_nodes || [];
      const unblockedStart = data.nodes.find(
        (n) => n.type !== 'exit' && !blockedNodes.includes(n.id)
      )?.id;
      const defaultStart =
        unblockedStart ||
        data.nodes.find((n) => n.type !== 'exit')?.id ||
        data.nodes[0]?.id ||
        'R1';

      setStartNodeId(defaultStart);
      setBlockedNodesList(blockedNodes);
      setBlockedEdgesList(data.initial_state?.blocked_edges || []);
      setClosedExitsList(data.initial_state?.closed_exits || []);
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
    if (!svg) {
      console.warn('SVG element #evacuation-svg-map not found for export');
      return;
    }

    try {
      // 1. Deep clone SVG to avoid mutating active DOM
      const clone = svg.cloneNode(true) as SVGSVGElement;

      // 2. Ensure XML namespaces
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');

      // 3. Extract viewBox dimensions
      const vb = svg.viewBox.baseVal;
      const vbWidth = vb && vb.width > 0 ? vb.width : 800;
      const vbHeight = vb && vb.height > 0 ? vb.height : 500;
      clone.setAttribute('width', String(vbWidth));
      clone.setAttribute('height', String(vbHeight));

      // 4. Inject theme CSS variables directly into SVG defs so isolated image has colors
      const isDark = document.documentElement.classList.contains('dark');
      const defs =
        clone.querySelector('defs') ||
        clone.insertBefore(
          document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
          clone.firstChild
        );

      const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.textContent = `
        :root, svg {
          --surface: ${isDark ? '#0e1415' : '#fbfcfe'};
          --surface-container-low: ${isDark ? '#161c1d' : '#f5f6f8'};
          --surface-container: ${isDark ? '#1b2021' : '#eff1f2'};
          --surface-container-high: ${isDark ? '#252b2c' : '#e9ebec'};
          --surface-container-highest: ${isDark ? '#303637' : '#e3e5e7'};
          --primary: ${isDark ? '#4fd8eb' : '#006874'};
          --on-primary: ${isDark ? '#00363d' : '#ffffff'};
          --primary-container: ${isDark ? '#004f58' : '#9beeff'};
          --on-primary-container: ${isDark ? '#9beeff' : '#001f24'};
          --secondary: ${isDark ? '#b1cbd0' : '#4a6267'};
          --on-secondary: ${isDark ? '#1c3438' : '#ffffff'};
          --secondary-container: ${isDark ? '#334b4f' : '#cde7ec'};
          --on-secondary-container: ${isDark ? '#cde7ec' : '#051f23'};
          --tertiary: ${isDark ? '#6cdbac' : '#006c4c'};
          --on-tertiary: ${isDark ? '#003825' : '#ffffff'};
          --tertiary-container: ${isDark ? '#005138' : '#89f8c7'};
          --on-tertiary-container: ${isDark ? '#89f8c7' : '#002114'};
          --error: ${isDark ? '#ffb4ab' : '#ba1a1a'};
          --on-error: ${isDark ? '#690005' : '#ffffff'};
          --error-container: ${isDark ? '#93000a' : '#ffdad6'};
          --on-error-container: ${isDark ? '#ffdad6' : '#410002'};
          --indicator: ${isDark ? '#fbbf24' : '#b45309'};
          --on-indicator: ${isDark ? '#1c1917' : '#ffffff'};
          --on-surface: ${isDark ? '#e1e3e4' : '#191c1d'};
          --on-surface-variant: ${isDark ? '#bfc8ca' : '#3f484a'};
          --outline: ${isDark ? '#899294' : '#6f797a'};
          --outline-variant: ${isDark ? '#3f484a' : '#bfc8ca'};
          --font-inter: 'Inter', system-ui, -apple-system, sans-serif;
          --font-hind: 'Hind Siliguri', 'Inter', system-ui, -apple-system, sans-serif;
        }
        text {
          font-family: system-ui, -apple-system, sans-serif;
        }
      `;
      defs.appendChild(styleEl);

      // 5. Insert solid background rect into SVG clone
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', String(vb ? vb.x : 0));
      bgRect.setAttribute('y', String(vb ? vb.y : 0));
      bgRect.setAttribute('width', String(vbWidth));
      bgRect.setAttribute('height', String(vbHeight));
      bgRect.setAttribute('fill', isDark ? '#0e1415' : '#fbfcfe');
      clone.insertBefore(bgRect, clone.firstChild);

      // 6. Serialize SVG to Blob
      const svgString = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);
      const image = new Image();

      image.onload = () => {
        try {
          const scale = 2; // Crisp 2x retina export
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(vbWidth * scale);
          canvas.height = Math.round(vbHeight * scale);
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.fillStyle = isDark ? '#0e1415' : '#fbfcfe';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            canvas.toBlob((blob) => {
              if (blob) {
                const pngURL = URL.createObjectURL(blob);
                const dl = document.createElement('a');
                const safeName = buildingData.building.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]+/g, '_');
                dl.download = `smart-escape-map-${safeName}.png`;
                dl.href = pngURL;
                document.body.appendChild(dl);
                dl.click();
                document.body.removeChild(dl);
                setTimeout(() => URL.revokeObjectURL(pngURL), 2000);
              }
              URL.revokeObjectURL(blobURL);
            }, 'image/png');
          } else {
            URL.revokeObjectURL(blobURL);
          }
        } catch (canvasErr) {
          console.error('Failed canvas rendering for PNG export, falling back to SVG:', canvasErr);
          const dl = document.createElement('a');
          const safeName = buildingData.building.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]+/g, '_');
          dl.download = `smart-escape-map-${safeName}.svg`;
          dl.href = blobURL;
          document.body.appendChild(dl);
          dl.click();
          document.body.removeChild(dl);
          setTimeout(() => URL.revokeObjectURL(blobURL), 2000);
        }
      };

      image.onerror = (err) => {
        console.warn('Canvas rasterization blocked, falling back to SVG vector download:', err);
        const dl = document.createElement('a');
        const safeName = buildingData.building.replace(/[^a-zA-Z0-9_\u0980-\u09FF-]+/g, '_');
        dl.download = `smart-escape-map-${safeName}.svg`;
        dl.href = blobURL;
        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl);
        setTimeout(() => URL.revokeObjectURL(blobURL), 2000);
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
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 pb-24 sm:pb-5 sm:p-5 lg:p-6 flex flex-col gap-4">
        {/* Core Layout: Left = Interactive Map & Walkthrough, Right = Telemetry & Hazards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Interactive Map Column (Primary Focus) */}
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

            {/* Step Walkthrough Controls (Directly under map) */}
            <WalkthroughControls
              routeResult={routeResult}
              activeStepIndex={activeStepIndex}
              setActiveStepIndex={setActiveStepIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              lang={lang}
            />
          </div>

          {/* Telemetry Summary & Hazard Control Panel Column */}
          <div className="lg:col-span-5 xl:col-span-4 w-full flex flex-col gap-4">
            {/* Status / Telemetry Summary (At top of control column) */}
            <RouteSummary
              routeResult={routeResult}
              startNodeId={startNodeId}
              lang={lang}
              activeStepIndex={activeStepIndex}
            />

            {/* Hazard Control Panel */}
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

      {/* Mobile M3 Bottom Dock: Relieves congested top nav bar on small screens */}
      <BottomDock
        lang={lang}
        onLanguageChange={setLang}
        theme={theme}
        onThemeChange={setTheme}
        onExportCsv={handleExportCsv}
        onExportPng={handleExportPng}
      />

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
