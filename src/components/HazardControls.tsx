import React from 'react';
import type { BuildingData } from '../types/building';
import type { Language } from '../utils/i18n';
import { t, formatNumber } from '../utils/i18n';
import { CheckIcon, CrossIcon } from './Icons';

interface HazardControlsProps {
  buildingData: BuildingData;
  startNodeId: string;
  onSelectStartNode: (nodeId: string) => void;
  blockedNodes: Set<string>;
  onToggleNodeBlock: (nodeId: string) => void;
  blockedEdges: Set<string>;
  onToggleEdgeBlock: (edgeId: string) => void;
  closedExits: Set<string>;
  onToggleExitClosed: (exitId: string) => void;
  onRunScenario: (scenario: 'baseline' | 'blocked_c2' | 'exits_closed' | 'start_r2' | 'blocked_start') => void;
  lang: Language;
}

export const HazardControls: React.FC<HazardControlsProps> = ({
  buildingData,
  startNodeId,
  onSelectStartNode,
  blockedNodes,
  onToggleNodeBlock,
  blockedEdges,
  onToggleEdgeBlock,
  closedExits,
  onToggleExitClosed,
  onRunScenario,
  lang,
}) => {
  const roomsAndJunctions = buildingData.nodes.filter((n) => n.type !== 'exit');
  const exits = buildingData.nodes.filter((n) => n.type === 'exit');

  return (
    <div className="w-full bg-surface-container rounded-[24px] p-5 sm:p-6 shadow-xs flex flex-col gap-6">
      {/* 1. Quick Sample Checks (Section 4.1) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            {t('scenarios', lang)}
          </span>
          <span className="text-[11px] text-on-surface-variant">
            {lang === 'bn' ? '১-ক্লিক ভেরিফিকেশন' : '1-Click Verification'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onRunScenario('baseline')}
            className="btn-tactile touch-target px-3.5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface cursor-pointer"
          >
            {t('scenarioBaseline', lang)}
          </button>
          <button
            onClick={() => onRunScenario('blocked_c2')}
            className="btn-tactile touch-target px-3.5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface cursor-pointer"
          >
            {t('scenarioBlockedC2', lang)}
          </button>
          <button
            onClick={() => onRunScenario('exits_closed')}
            className="btn-tactile touch-target px-3.5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface cursor-pointer"
          >
            {t('scenarioExitsClosed', lang)}
          </button>
          <button
            onClick={() => onRunScenario('start_r2')}
            className="btn-tactile touch-target px-3.5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface cursor-pointer"
          >
            {t('scenarioDifferentStart', lang)}
          </button>
          <button
            onClick={() => onRunScenario('blocked_start')}
            className="btn-tactile touch-target px-3.5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-xs font-semibold text-on-surface cursor-pointer"
          >
            {t('scenarioBlockedStart', lang)}
          </button>
        </div>
      </div>

      <hr className="border-surface-container-highest" />

      {/* 2. Select Starting Point (Filter Chips) */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {t('startLocation', lang)}:
          </label>
          <span className="text-xs text-on-surface-variant font-mono">
            {startNodeId}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {roomsAndJunctions.map((node) => {
            const isSelected = node.id === startNodeId;
            const isBlocked = blockedNodes.has(node.id);

            return (
              <button
                key={`start-${node.id}`}
                onClick={() => onSelectStartNode(node.id)}
                className={`btn-tactile touch-target px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-on-primary shadow-xs'
                    : isBlocked
                    ? 'bg-error-container text-on-error-container line-through'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                }`}
              >
                {isSelected && <CheckIcon size={14} />}
                <span>{node.id}</span>
                <span className="text-[10px] opacity-80">({node.label})</span>
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-surface-container-highest" />

      {/* 3. Rooms & Junctions Block Toggles */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {t('blockedNodes', lang)}:
        </label>
        <div className="flex flex-wrap gap-2">
          {roomsAndJunctions.map((node) => {
            const isBlocked = blockedNodes.has(node.id);

            return (
              <button
                key={`block-${node.id}`}
                onClick={() => onToggleNodeBlock(node.id)}
                className={`btn-tactile touch-target px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isBlocked
                    ? 'bg-error text-on-error shadow-xs'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                }`}
              >
                {isBlocked ? <CrossIcon size={14} /> : <span className="w-2 h-2 rounded-full bg-outline-variant" />}
                <span>{node.id}</span>
                <span className="text-[10px] opacity-80">
                  {isBlocked ? t('blockedState', lang) : t('normalState', lang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Corridors Block Toggles */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {t('blockedCorridors', lang)}:
        </label>
        <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
          {buildingData.edges.map((edge) => {
            const isBlocked = blockedEdges.has(edge.id);

            return (
              <button
                key={`edge-${edge.id}`}
                onClick={() => onToggleEdgeBlock(edge.id)}
                className={`btn-tactile touch-target px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isBlocked
                    ? 'bg-error text-on-error shadow-xs'
                    : 'bg-surface-container-high hover:bg-surface-container-highest text-on-surface'
                }`}
              >
                {isBlocked ? <CrossIcon size={14} /> : <span className="w-2 h-2 rounded-full bg-outline-variant" />}
                <span>{edge.id}</span>
                <span className="text-[10px] opacity-75 font-mono">
                  ({edge.from}↔{edge.to}, {formatNumber(edge.cost, lang)})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Closed Exits Toggles */}
      <div className="flex flex-col gap-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
          {t('closedExits', lang)}:
        </label>
        <div className="flex flex-wrap gap-2">
          {exits.map((exit) => {
            const isClosed = closedExits.has(exit.id);

            return (
              <button
                key={`exit-${exit.id}`}
                onClick={() => onToggleExitClosed(exit.id)}
                className={`btn-tactile touch-target px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer ${
                  isClosed
                    ? 'bg-error text-on-error shadow-xs'
                    : 'bg-tertiary text-on-tertiary shadow-xs'
                }`}
              >
                {isClosed ? <CrossIcon size={14} /> : <CheckIcon size={14} />}
                <span>{exit.id}</span>
                <span className="text-[10px] opacity-90">({exit.label})</span>
                <span className="text-[10px] uppercase font-bold tracking-wide">
                  [{isClosed ? t('closedState', lang) : t('openState', lang)}]
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
