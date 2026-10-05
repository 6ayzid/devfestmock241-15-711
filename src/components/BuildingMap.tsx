import React, { useMemo, useRef } from 'react';
import type { BuildingData, RouteResult } from '../types/building';
import type { Language } from '../utils/i18n';
import { t, formatNumber } from '../utils/i18n';

interface BuildingMapProps {
  buildingData: BuildingData;
  startNodeId: string;
  onSelectStartNode: (nodeId: string) => void;
  blockedNodes: Set<string>;
  onToggleNodeBlock: (nodeId: string) => void;
  blockedEdges: Set<string>;
  onToggleEdgeBlock: (edgeId: string) => void;
  closedExits: Set<string>;
  onToggleExitClosed: (exitId: string) => void;
  routeResult: RouteResult;
  activeStepIndex: number | null; // For step-by-step walkthrough
  lang: Language;
}

export const BuildingMap: React.FC<BuildingMapProps> = ({
  buildingData,
  startNodeId,
  onSelectStartNode,
  blockedNodes,
  onToggleNodeBlock,
  blockedEdges,
  onToggleEdgeBlock,
  closedExits,
  onToggleExitClosed,
  routeResult,
  activeStepIndex,
  lang,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Compute dynamic viewBox with bounding box of all nodes
  const { viewBox, nodeMap } = useMemo(() => {
    const map = new Map<string, (typeof buildingData.nodes)[0]>();
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    for (const n of buildingData.nodes) {
      map.set(n.id, n);
      if (n.x < minX) minX = n.x;
      if (n.x > maxX) maxX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.y > maxY) maxY = n.y;
    }

    if (minX === Infinity) {
      minX = 0;
      maxX = 500;
      minY = 0;
      maxY = 300;
    }

    const pad = 50;
    const width = Math.max(maxX - minX + pad * 2, 400);
    const height = Math.max(maxY - minY + pad * 2, 260);
    const vb = `${minX - pad} ${minY - pad} ${width} ${height}`;

    return { viewBox: vb, nodeMap: map };
  }, [buildingData]);

  // Active route sets
  const routeNodeSet = useMemo(() => new Set(routeResult.path), [routeResult.path]);
  const routeEdgeSet = useMemo(() => new Set(routeResult.edgeIds), [routeResult.edgeIds]);

  // Continuous SVG path string for the escape route (Start -> Exit)
  const fullRouteD = useMemo(() => {
    if (routeResult.status !== 'FOUND' || routeResult.path.length < 2) return '';
    const points = routeResult.path
      .map((nodeId) => nodeMap.get(nodeId))
      .filter((n): n is NonNullable<typeof n> => !!n);
    if (points.length < 2) return '';
    return points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  }, [routeResult.status, routeResult.path, nodeMap]);

  // Active step highlight
  const currentStepEdgeId =
    activeStepIndex !== null && activeStepIndex >= 0 && activeStepIndex < routeResult.edgeIds.length
      ? routeResult.edgeIds[activeStepIndex]
      : null;

  const currentStepNodeId =
    activeStepIndex !== null && activeStepIndex >= 0 && activeStepIndex < routeResult.path.length
      ? routeResult.path[activeStepIndex]
      : null;

  return (
    <div className="w-full bg-surface-container-low rounded-[24px] p-4 sm:p-6 shadow-xs flex flex-col gap-4 relative overflow-hidden">
      {/* Map Header & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-surface-container-high">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-on-surface">
            {t('appTitle', lang)} — {buildingData.building}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-mono">
            {formatNumber(buildingData.nodes.length, lang)} {t('nodesCount', lang)} ·{' '}
            {formatNumber(buildingData.edges.length, lang)} {t('edgesCount', lang)}
          </span>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-on-surface-variant">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container">
            <span className="w-3 h-3 rounded-full bg-primary inline-block ring-2 ring-primary/30" />
            <span>{t('startLocation', lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container">
            <span className="w-3 h-3 rounded-full bg-tertiary inline-block" />
            <span>{t('openState', lang)} {t('exit', lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container">
            <span className="w-3 h-3 rounded-full bg-error inline-block" />
            <span>{t('blockedState', lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container">
            <span className="w-5 h-1.5 rounded-full bg-primary inline-block" />
            <span>{t('activeRoute', lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indicator-container text-on-indicator-container border border-indicator/30 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-indicator inline-block ring-2 ring-indicator-bright animate-pulse" />
            <span>{t('activeStepIndicator', lang)}</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="w-full h-[360px] sm:h-[440px] md:h-[500px] relative bg-surface rounded-[20px] overflow-hidden flex items-center justify-center border border-surface-container">
        <svg
          ref={svgRef}
          id="evacuation-svg-map"
          viewBox={viewBox}
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glow filters for active path & indicator */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="routeStreakGlow" x="-25%" y="-25%" width="150%" height="150%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="indicatorGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="markerShadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2.5" stdDeviation="3" floodOpacity="0.4" />
            </filter>
          </defs>

          {/* 1. RENDER EDGES / CORRIDORS */}
          <g id="edges-layer">
            {buildingData.edges.map((edge) => {
              const from = nodeMap.get(edge.from);
              const to = nodeMap.get(edge.to);
              if (!from || !to) return null;

              const isBlocked = blockedEdges.has(edge.id);
              const isRouteEdge = routeEdgeSet.has(edge.id);
              const isCurrentStep = currentStepEdgeId === edge.id;

              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;

              let strokeColor = 'var(--outline-variant)';
              let strokeWidth = 3;
              let strokeDasharray: string | undefined = undefined;

              if (isBlocked) {
                strokeColor = 'var(--error)';
                strokeWidth = 3.5;
                strokeDasharray = '6 4';
              } else if (isCurrentStep) {
                strokeColor = 'var(--indicator)';
                strokeWidth = 8;
              } else if (isRouteEdge) {
                strokeColor = 'var(--primary)';
                strokeWidth = 5;
              }

              return (
                <g key={edge.id} className="transition-all duration-300">
                  {/* Underlay touch hit area for easy clicking */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="transparent"
                    strokeWidth={24}
                    className="cursor-pointer"
                    onClick={() => onToggleEdgeBlock(edge.id)}
                  >
                    <title>{`Corridor ${edge.id} (Cost: ${edge.cost}). Click to ${isBlocked ? 'unblock' : 'block'}.`}</title>
                  </line>

                  {/* Visible Edge Line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    filter={isCurrentStep ? 'url(#indicatorGlow)' : isRouteEdge ? 'url(#routeGlow)' : undefined}
                    className="cursor-pointer"
                    onClick={() => onToggleEdgeBlock(edge.id)}
                  />

                  {/* High-contrast animated runner streak overlay for current active step */}
                  {isCurrentStep && (
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke="var(--indicator-container)"
                      strokeWidth={3.5}
                      strokeDasharray="8 8"
                      strokeLinecap="round"
                      className="animate-escape-streak pointer-events-none"
                    />
                  )}

                  {/* Edge Cost Tag at Midpoint */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="cursor-pointer"
                    onClick={() => onToggleEdgeBlock(edge.id)}
                  >
                    <rect
                      x="-15"
                      y="-11"
                      width="30"
                      height="22"
                      rx="11"
                      fill={
                        isBlocked
                          ? 'var(--error-container)'
                          : isCurrentStep
                          ? 'var(--indicator)'
                          : isRouteEdge
                          ? 'var(--primary-container)'
                          : 'var(--surface-container-highest)'
                      }
                      stroke={
                        isBlocked
                          ? 'var(--error)'
                          : isCurrentStep
                          ? 'var(--indicator-bright)'
                          : isRouteEdge
                          ? 'var(--primary)'
                          : 'var(--outline-variant)'
                      }
                      strokeWidth={isCurrentStep ? 2 : 1.5}
                      filter={isCurrentStep ? 'url(#markerShadow)' : undefined}
                      className="transition-colors"
                    />
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fontSize="10.5"
                      fontWeight="bold"
                      fill={
                        isBlocked
                          ? 'var(--on-error-container)'
                          : isCurrentStep
                          ? 'var(--on-indicator)'
                          : isRouteEdge
                          ? 'var(--on-primary-container)'
                          : 'var(--on-surface)'
                      }
                      fontFamily="var(--font-inter)"
                    >
                      {formatNumber(edge.cost, lang)}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 1.5 ESCAPE PATH ANIMATOR LAYER (Flowing Running Streaks) */}
          {fullRouteD && (
            <g id="escape-path-animator-layer" className="pointer-events-none">
              {/* Outer soft corridor glow ribbon */}
              <path
                d={fullRouteD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={9}
                strokeOpacity={0.22}
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#routeGlow)"
              />
              {/* Main solid route spine */}
              <path
                d={fullRouteD}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={4.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Animated running streak (continuous forward flowing dash stream) */}
              <path
                d={fullRouteD}
                fill="none"
                stroke="var(--primary-container)"
                strokeWidth={3}
                strokeDasharray="14 18"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-escape-streak"
                filter="url(#routeStreakGlow)"
              />
              {/* Running energy pulse wave traversing the entire escape path */}
              <path
                d={fullRouteD}
                pathLength={100}
                fill="none"
                stroke="var(--indicator-bright)"
                strokeWidth={4}
                strokeDasharray="18 82"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-escape-pulse"
                filter="url(#routeStreakGlow)"
              />
            </g>
          )}

          {/* 2. RENDER NODES */}
          <g id="nodes-layer">
            {buildingData.nodes.map((node) => {
              const isStart = node.id === startNodeId;
              const isBlocked = blockedNodes.has(node.id);
              const isClosed = closedExits.has(node.id);
              const isRouteNode = routeNodeSet.has(node.id);
              const isCurrentStepNode = currentStepNodeId === node.id;

              // Node click handling:
              // - Exits: clicking toggles open/closed
              // - Rooms/Junctions: clicking unblocked selects as start; if already start or Alt-click, toggle block!
              const handleNodeClick = (e: React.MouseEvent) => {
                if (node.type === 'exit') {
                  onToggleExitClosed(node.id);
                } else {
                  if (e.altKey || isBlocked) {
                    onToggleNodeBlock(node.id);
                  } else {
                    onSelectStartNode(node.id);
                  }
                }
              };

              if (node.type === 'exit') {
                // Exit Node Pill
                const width = 64;
                const height = 40;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={handleNodeClick}
                  >
                    <g
                      className="transition-transform duration-200 hover:scale-110 active:scale-95"
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    >
                      <title>{`${node.label} (${node.id}) - ${isClosed ? 'Closed' : 'Open'}. Click to toggle.`}</title>
                      {/* Background Pill */}
                      <rect
                        x={-width / 2}
                        y={-height / 2}
                        width={width}
                        height={height}
                        rx={14}
                        fill={
                          isClosed
                            ? 'var(--error-container)'
                            : isCurrentStepNode
                            ? 'var(--indicator-container)'
                            : isRouteNode
                            ? 'var(--tertiary-container)'
                            : 'var(--surface-container-high)'
                        }
                        stroke={
                          isClosed
                            ? 'var(--error)'
                            : isCurrentStepNode
                            ? 'var(--indicator)'
                            : isRouteNode
                            ? 'var(--tertiary)'
                            : 'var(--outline-variant)'
                        }
                        strokeWidth={isCurrentStepNode ? 4 : isRouteNode ? 3 : 1.5}
                        filter={isCurrentStepNode ? 'url(#indicatorGlow)' : isRouteNode ? 'url(#routeGlow)' : undefined}
                      />

                      {/* Exit Sign Text */}
                      <text
                        x="0"
                        y="-3"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={
                          isClosed
                            ? 'var(--on-error-container)'
                            : isCurrentStepNode
                            ? 'var(--on-indicator-container)'
                            : isRouteNode
                            ? 'var(--on-tertiary-container)'
                            : 'var(--on-surface)'
                        }
                        fontFamily="var(--font-inter)"
                      >
                        {node.id}
                      </text>
                      <text
                        x="0"
                        y="11"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="500"
                        fill={
                          isClosed
                            ? 'var(--error)'
                            : isCurrentStepNode
                            ? 'var(--indicator)'
                            : isRouteNode
                            ? 'var(--tertiary)'
                            : 'var(--on-surface-variant)'
                        }
                        fontFamily="var(--font-inter)"
                      >
                        {isClosed ? t('closedState', lang) : t('exit', lang)}
                      </text>
                    </g>
                  </g>
                );
              }

              if (node.type === 'room') {
                // Room Node Squircle
                const size = 46;
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    className="cursor-pointer"
                    onClick={handleNodeClick}
                  >
                    <g
                      className="transition-transform duration-200 hover:scale-110 active:scale-95"
                      style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                    >
                      <title>{`${node.label} (${node.id}) - ${isBlocked ? 'Blocked' : isStart ? 'Start' : 'Available'}. Click to select / Alt-click to block.`}</title>
                      {/* Ring for Start Node */}
                      {isStart && (
                        <rect
                          x={-(size + 8) / 2}
                          y={-(size + 8) / 2}
                          width={size + 8}
                          height={size + 8}
                          rx={16}
                          fill="none"
                          stroke="var(--primary)"
                          strokeWidth={2.5}
                          strokeDasharray="4 2"
                          className="animate-spin-slow"
                        />
                      )}

                      {/* Ring for Current Step Node */}
                      {isCurrentStepNode && (
                        <rect
                          x={-(size + 8) / 2}
                          y={-(size + 8) / 2}
                          width={size + 8}
                          height={size + 8}
                          rx={16}
                          fill="none"
                          stroke="var(--indicator)"
                          strokeWidth={3}
                          className="animate-active-step"
                          filter="url(#indicatorGlow)"
                        />
                      )}

                      <rect
                        x={-size / 2}
                        y={-size / 2}
                        width={size}
                        height={size}
                        rx={12}
                        fill={
                          isBlocked
                            ? 'var(--error-container)'
                            : isCurrentStepNode
                            ? 'var(--indicator-container)'
                            : isStart
                            ? 'var(--primary)'
                            : isRouteNode
                            ? 'var(--primary-container)'
                            : 'var(--surface-container-high)'
                        }
                        stroke={
                          isBlocked
                            ? 'var(--error)'
                            : isCurrentStepNode
                            ? 'var(--indicator)'
                            : isStart
                            ? 'var(--primary)'
                            : isRouteNode
                            ? 'var(--primary)'
                            : 'var(--outline-variant)'
                        }
                        strokeWidth={isCurrentStepNode ? 3.5 : isStart || isRouteNode ? 2.5 : 1.5}
                        filter={isCurrentStepNode ? 'url(#indicatorGlow)' : undefined}
                      />

                      <text
                        x="0"
                        y="-4"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={
                          isBlocked
                            ? 'var(--on-error-container)'
                            : isCurrentStepNode
                            ? 'var(--on-indicator-container)'
                            : isStart
                            ? 'var(--on-primary)'
                            : isRouteNode
                            ? 'var(--on-primary-container)'
                            : 'var(--on-surface)'
                        }
                        fontFamily="var(--font-inter)"
                      >
                        {node.id}
                      </text>
                      <text
                        x="0"
                        y="10"
                        textAnchor="middle"
                        fontSize="8"
                        fontWeight="600"
                        fill={
                          isBlocked
                            ? 'var(--error)'
                            : isCurrentStepNode
                            ? 'var(--indicator)'
                            : isStart
                            ? 'var(--on-primary)'
                            : isRouteNode
                            ? 'var(--primary)'
                            : 'var(--on-surface-variant)'
                        }
                        fontFamily="var(--font-inter)"
                      >
                        {isBlocked ? t('blockedState', lang) : isCurrentStepNode ? 'STEP' : isStart ? 'START' : t('room', lang)}
                      </text>
                    </g>
                  </g>
                );
              }

              // Junction Node Circle
              const radius = 22;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer"
                  onClick={handleNodeClick}
                >
                  <g
                    className="transition-transform duration-200 hover:scale-110 active:scale-95"
                    style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  >
                    <title>{`${node.label} (${node.id}) - ${isBlocked ? 'Blocked' : isStart ? 'Start' : 'Available'}. Click to select / Alt-click to block.`}</title>
                  {isStart && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke="var(--primary)"
                      strokeWidth={2.5}
                      strokeDasharray="4 2"
                    />
                  )}

                  {isCurrentStepNode && (
                    <circle
                      r={radius + 5}
                      fill="none"
                      stroke="var(--indicator)"
                      strokeWidth={3}
                      className="animate-active-step"
                      filter="url(#indicatorGlow)"
                    />
                  )}

                  <circle
                    r={radius}
                    fill={
                      isBlocked
                        ? 'var(--error-container)'
                        : isCurrentStepNode
                        ? 'var(--indicator-container)'
                        : isStart
                        ? 'var(--primary)'
                        : isRouteNode
                        ? 'var(--primary-container)'
                        : 'var(--surface-container-high)'
                    }
                    stroke={
                      isBlocked
                        ? 'var(--error)'
                        : isCurrentStepNode
                        ? 'var(--indicator)'
                        : isStart
                        ? 'var(--primary)'
                        : isRouteNode
                        ? 'var(--primary)'
                        : 'var(--outline-variant)'
                    }
                    strokeWidth={isCurrentStepNode ? 3.5 : isStart || isRouteNode ? 2.5 : 1.5}
                    filter={isCurrentStepNode ? 'url(#indicatorGlow)' : undefined}
                  />

                  <text
                    x="0"
                    y="-3"
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="bold"
                    fill={
                      isBlocked
                        ? 'var(--on-error-container)'
                        : isCurrentStepNode
                        ? 'var(--on-indicator-container)'
                        : isStart
                        ? 'var(--on-primary)'
                        : isRouteNode
                        ? 'var(--on-primary-container)'
                        : 'var(--on-surface)'
                    }
                    fontFamily="var(--font-inter)"
                  >
                    {node.id}
                  </text>
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="500"
                    fill={
                      isBlocked
                        ? 'var(--error)'
                        : isCurrentStepNode
                        ? 'var(--indicator)'
                        : isStart
                        ? 'var(--on-primary)'
                        : isRouteNode
                        ? 'var(--primary)'
                        : 'var(--on-surface-variant)'
                    }
                    fontFamily="var(--font-inter)"
                  >
                    {isBlocked ? 'BLKD' : isCurrentStepNode ? 'STEP' : isStart ? 'START' : 'JUNC'}
                  </text>
                </g>
              </g>
            );
            })}
          </g>

          {/* 3. RUNNER / ACTIVE EVACUEE BEACON (Prominent High-Contrast Indicator) */}
          {activeStepIndex !== null && routeResult.status === 'FOUND' && (
            (() => {
              const fromId = routeResult.path[activeStepIndex];
              const toId = routeResult.path[activeStepIndex + 1];
              const fromNode = fromId ? nodeMap.get(fromId) : null;
              const toNode = toId ? nodeMap.get(toId) : null;
              if (!fromNode) return null;

              const angle = toNode
                ? Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x) * (180 / Math.PI)
                : 0;

              return (
                <g
                  id="active-runner-indicator"
                  transform={`translate(${fromNode.x}, ${fromNode.y})`}
                  className="pointer-events-none transition-transform duration-300 ease-out"
                >
                  {/* Outer expanding radar wave */}
                  <circle
                    r={26}
                    fill="none"
                    stroke="var(--indicator)"
                    strokeWidth={2.5}
                    className="animate-ping opacity-60"
                  />

                  {/* Pulsing beacon aura ring */}
                  <circle
                    r={20}
                    fill="var(--indicator)"
                    fillOpacity={0.2}
                    stroke="var(--indicator)"
                    strokeWidth={1.5}
                  />

                  {/* Center high-contrast beacon disc */}
                  <circle
                    r={13}
                    fill="var(--indicator)"
                    stroke="var(--on-indicator)"
                    strokeWidth={2.5}
                    filter="url(#markerShadow)"
                  />

                  {/* Directional arrow or destination checkmark */}
                  {toNode ? (
                    <g transform={`rotate(${angle})`}>
                      <polygon
                        points="-3,-4 5,0 -3,4"
                        fill="var(--on-indicator)"
                      />
                    </g>
                  ) : (
                    <path
                      d="M -4 0 L -1 3 L 4 -3"
                      fill="none"
                      stroke="var(--on-indicator)"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}

                  {/* Floating Step Badge */}
                  <g transform="translate(0, -24)">
                    <rect
                      x={-34}
                      y={-10}
                      width={68}
                      height={20}
                      rx={10}
                      fill="var(--indicator)"
                      stroke="var(--on-indicator)"
                      strokeWidth={1.5}
                      filter="url(#markerShadow)"
                    />
                    <text
                      x={0}
                      y={3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill="var(--on-indicator)"
                      fontFamily="var(--font-inter)"
                    >
                      {`${t('stepNumber', lang)} ${formatNumber(activeStepIndex + 1, lang)}`}
                    </text>
                  </g>
                </g>
              );
            })()
          )}
        </svg>
      </div>

      {/* Helpful Hint */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant px-1">
        <span>{t('clickToToggle', lang)}</span>
        <span className="hidden sm:inline">
          {t('selectStartPrompt', lang)}
        </span>
      </div>
    </div>
  );
};
