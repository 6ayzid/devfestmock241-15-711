import React from 'react';
import type { RouteResult } from '../types/building';
import type { Language } from '../utils/i18n';
import { t, formatNumber } from '../utils/i18n';
import { AlertCircleIcon, ExitIcon, CheckIcon } from './Icons';

interface RouteSummaryProps {
  routeResult: RouteResult;
  startNodeId: string;
  lang: Language;
  activeStepIndex?: number | null;
}

export const RouteSummary: React.FC<RouteSummaryProps> = ({
  routeResult,
  startNodeId,
  lang,
  activeStepIndex,
}) => {
  // Case 1: Starting location blocked
  if (routeResult.status === 'START_BLOCKED') {
    return (
      <div className="w-full bg-error-container text-on-error-container rounded-[24px] p-5 shadow-xs flex items-center gap-4 transition-all animate-shake">
        <div className="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center shrink-0">
          <AlertCircleIcon size={24} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold leading-tight">
            {t('startBlocked', lang)}
          </h2>
          <p className="text-xs sm:text-sm opacity-90 mt-0.5">
            {lang === 'bn'
              ? `প্রারম্ভিক অবস্থান (${startNodeId}) বর্তমানে অবরুদ্ধ। বিকল্প রুম নির্বাচন করুন অথবা বাধা অপসারণ করুন।`
              : `The starting point (${startNodeId}) is currently blocked by a hazard. Please choose another location or clear the hazard.`}
          </p>
        </div>
      </div>
    );
  }

  // Case 2: No route available
  if (routeResult.status === 'NO_ROUTE') {
    return (
      <div className="w-full bg-error-container text-on-error-container rounded-[24px] p-5 shadow-xs flex items-center gap-4 transition-all">
        <div className="w-12 h-12 rounded-full bg-error text-on-error flex items-center justify-center shrink-0">
          <AlertCircleIcon size={24} />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-bold leading-tight">
            {t('noRoute', lang)}
          </h2>
          <p className="text-xs sm:text-sm opacity-90 mt-0.5">
            {lang === 'bn'
              ? `বর্তমান প্রারম্ভিক অবস্থান (${startNodeId}) থেকে কোনো উন্মুক্ত বহির্গমন পথে পৌঁছানো সম্ভব নয়।`
              : `All paths from (${startNodeId}) to open exits are currently blocked or disconnected.`}
          </p>
        </div>
      </div>
    );
  }

  // Case 3: Safe evacuation route found
  return (
    <div className="w-full bg-surface-container rounded-[24px] p-5 sm:p-6 shadow-xs flex flex-col gap-4 transition-all">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-surface-container-high">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xs">
            <CheckIcon size={20} />
          </div>
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wide">
              {t('safeRouteFound', lang)}
            </span>
            <div className="text-base sm:text-lg font-bold text-on-surface flex items-center gap-2">
              <span>{t('destination', lang)}:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-sm font-semibold flex items-center gap-1">
                <ExitIcon size={14} />
                {routeResult.targetExitId}
              </span>
            </div>
          </div>
        </div>

        {/* Cost & Corridor Counters */}
        <div className="flex items-center gap-3">
          <div className="bg-surface-container-high px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">
              {t('totalCost', lang)}
            </span>
            <span className="text-xl sm:text-2xl font-black text-primary">
              {formatNumber(routeResult.totalCost, lang)}
            </span>
          </div>

          <div className="bg-surface-container-high px-4 py-2 rounded-2xl text-center">
            <span className="text-[10px] uppercase font-semibold text-on-surface-variant block">
              {t('corridorCount', lang)}
            </span>
            <span className="text-xl sm:text-2xl font-black text-secondary">
              {formatNumber(routeResult.edgeIds.length, lang)}
            </span>
          </div>
        </div>
      </div>

      {/* Path Sequence Breadcrumbs */}
      <div>
        <span className="text-xs font-semibold text-on-surface-variant block mb-2">
          {t('pathSequence', lang)}:
        </span>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {routeResult.path.map((nodeId, idx) => {
            const isLast = idx === routeResult.path.length - 1;
            const isFirst = idx === 0;
            const isCurrent = activeStepIndex !== null && activeStepIndex !== undefined && activeStepIndex === idx;

            return (
              <React.Fragment key={`${nodeId}-${idx}`}>
                <div
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    isCurrent
                      ? 'bg-indicator text-on-indicator'
                      : isFirst
                      ? 'bg-primary text-on-primary shadow-xs'
                      : isLast
                      ? 'bg-tertiary text-on-tertiary shadow-xs'
                      : 'bg-surface-container-highest text-on-surface'
                  }`}
                >
                  {isLast && <ExitIcon size={12} />}
                  <span>{nodeId}</span>
                </div>
                {!isLast && (
                  <span
                    className={`text-xs font-bold px-0.5 ${
                      isCurrent ? 'text-indicator' : 'text-on-surface-variant'
                    }`}
                  >
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
