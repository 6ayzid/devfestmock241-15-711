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
            <span className="w-6 h-1 rounded-full bg-primary inline-block" />
            <span>{t('activeRoute', lang)}</span>
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
            {/* Glow filters for active path */}
            <filter id="routeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="hazardGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
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
                strokeColor = 'var(--primary)';
                strokeWidth = 6.5;
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
                    filter={isRouteEdge ? 'url(#routeGlow)' : undefined}
                    className="cursor-pointer"
                    onClick={() => onToggleEdgeBlock(edge.id)}
                  />

                  {/* Edge Cost Tag at Midpoint */}
                  <g
                    transform={`translate(${midX}, ${midY})`}
                    className="cursor-pointer"
                    onClick={() => onToggleEdgeBlock(edge.id)}
                  >
                    <rect
                      x="-14"
                      y="-10"
                      width="28"
                      height="20"
                      rx="10"
                      fill={
                        isBlocked
                          ? 'var(--error-container)'
                          : isRouteEdge
                          ? 'var(--primary-container)'
                          : 'var(--surface-container-highest)'
                      }
                      stroke={isBlocked ? 'var(--error)' : isRouteEdge ? 'var(--primary)' : 'var(--outline-variant)'}
                      strokeWidth={1.5}
                      className="transition-colors"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fontSize="10"
                      fontWeight="bold"
                      fill={
                        isBlocked
                          ? 'var(--on-error-container)'
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
                    className="cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                    onClick={handleNodeClick}
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
                          : isRouteNode
                          ? 'var(--tertiary-container)'
                          : 'var(--surface-container-high)'
                      }
                      stroke={
                        isClosed
                          ? 'var(--error)'
                          : isRouteNode
                          ? 'var(--tertiary)'
                          : 'var(--outline-variant)'
                      }
                      strokeWidth={isCurrentStepNode ? 4 : isRouteNode ? 3 : 1.5}
                      filter={isRouteNode ? 'url(#routeGlow)' : undefined}
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
                          : isRouteNode
                          ? 'var(--tertiary)'
                          : 'var(--on-surface-variant)'
                      }
                      fontFamily="var(--font-inter)"
                    >
                      {isClosed ? t('closedState', lang) : t('exit', lang)}
                    </text>
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
                    className="cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                    onClick={handleNodeClick}
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

                    <rect
                      x={-size / 2}
                      y={-size / 2}
                      width={size}
                      height={size}
                      rx={12}
                      fill={
                        isBlocked
                          ? 'var(--error-container)'
                          : isStart
                          ? 'var(--primary)'
                          : isRouteNode
                          ? 'var(--primary-container)'
                          : 'var(--surface-container-high)'
                      }
                      stroke={
                        isBlocked
                          ? 'var(--error)'
                          : isStart
                          ? 'var(--primary)'
                          : isRouteNode
                          ? 'var(--primary)'
                          : 'var(--outline-variant)'
                      }
                      strokeWidth={isCurrentStepNode ? 4 : isStart || isRouteNode ? 2.5 : 1.5}
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
                          : isStart
                          ? 'var(--on-primary)'
                          : isRouteNode
                          ? 'var(--primary)'
                          : 'var(--on-surface-variant)'
                      }
                      fontFamily="var(--font-inter)"
                    >
                      {isBlocked ? t('blockedState', lang) : isStart ? 'START' : t('room', lang)}
                    </text>
                  </g>
                );
              }

              // Junction Node Circle
              const radius = 22;
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  className="cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                  onClick={handleNodeClick}
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

                  <circle
                    r={radius}
                    fill={
                      isBlocked
                        ? 'var(--error-container)'
                        : isStart
                        ? 'var(--primary)'
                        : isRouteNode
                        ? 'var(--primary-container)'
                        : 'var(--surface-container-high)'
                    }
                    stroke={
                      isBlocked
                        ? 'var(--error)'
                        : isStart
                        ? 'var(--primary)'
                        : isRouteNode
                        ? 'var(--primary)'
                        : 'var(--outline-variant)'
                    }
                    strokeWidth={isCurrentStepNode ? 4 : isStart || isRouteNode ? 2.5 : 1.5}
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
                        : isStart
                        ? 'var(--on-primary)'
                        : isRouteNode
                        ? 'var(--primary)'
                        : 'var(--on-surface-variant)'
                    }
                    fontFamily="var(--font-inter)"
                  >
                    {isBlocked ? 'BLKD' : isStart ? 'START' : 'JUNC'}
                  </text>
                </g>
              );
            })}
          </g>
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
