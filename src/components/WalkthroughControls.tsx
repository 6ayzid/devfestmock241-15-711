import React, { useState, useEffect } from 'react';
import type { RouteResult } from '../types/building';
import type { Language } from '../utils/i18n';
import { t, formatNumber } from '../utils/i18n';
import { PlayIcon, PauseIcon, StepForwardIcon, StepBackIcon, ResetIcon, ExitIcon } from './Icons';

interface WalkthroughControlsProps {
  routeResult: RouteResult;
  activeStepIndex: number | null;
  setActiveStepIndex: React.Dispatch<React.SetStateAction<number | null>>;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  lang: Language;
}

export const WalkthroughControls: React.FC<WalkthroughControlsProps> = ({
  routeResult,
  activeStepIndex,
  setActiveStepIndex,
  isPlaying,
  setIsPlaying,
  lang,
}) => {
  const [speed, setSpeed] = useState<'1x' | '2x'>('1x');
  const stepsCount = routeResult.edgeIds.length;
  const intervalMs = speed === '1x' ? 1200 : 600;

  useEffect(() => {
    let timer: number | undefined;
    if (isPlaying && stepsCount > 0) {
      timer = window.setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev === null) return 0;
          if (prev >= stepsCount - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepsCount, intervalMs, setActiveStepIndex, setIsPlaying]);

  if (routeResult.status !== 'FOUND' || stepsCount === 0) {
    return null;
  }

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveStepIndex((prev) => {
      if (prev === null || prev <= 0) return 0;
      return prev - 1;
    });
  };

  const handleNext = () => {
    setIsPlaying(false);
    setActiveStepIndex((prev) => {
      if (prev === null) return 0;
      if (prev >= stepsCount - 1) return stepsCount - 1;
      return prev + 1;
    });
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIndex(null);
  };

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      if (activeStepIndex === null || activeStepIndex >= stepsCount - 1) {
        setActiveStepIndex(0);
      }
      setIsPlaying(true);
    }
  };

  const currentStepNum = activeStepIndex !== null ? activeStepIndex + 1 : 0;
  const isCompleted = activeStepIndex !== null && activeStepIndex === stepsCount - 1;

  return (
    <div className="w-full bg-surface-container-high rounded-[24px] p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
      {/* Top Bar: Step Details & Playback Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Step Indicator & Navigation Guidance */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm shrink-0 transition-all ${
              activeStepIndex !== null
                ? 'bg-indicator text-on-indicator shadow-md ring-4 ring-indicator/20 scale-105'
                : 'bg-surface-container-highest text-on-surface-variant'
            }`}
          >
            {activeStepIndex !== null ? formatNumber(currentStepNum, lang) : '•'}
          </div>
          <div>
            <span className="text-xs font-semibold text-on-surface-variant block">
              {t('walkthroughTitle', lang)}
            </span>
            <div className="text-xs sm:text-sm font-bold text-on-surface flex items-center gap-1.5 flex-wrap">
              {activeStepIndex !== null ? (
                <>
                  <span className="text-indicator font-extrabold">
                    {t('stepNumber', lang)} {formatNumber(currentStepNum, lang)} / {formatNumber(stepsCount, lang)}:
                  </span>
                  <span>
                    {routeResult.path[activeStepIndex]} → {routeResult.path[activeStepIndex + 1]}
                  </span>
                  {isCompleted && (
                    <span className="ml-1 px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary-container text-[11px] font-bold flex items-center gap-1">
                      <ExitIcon size={12} />
                      {t('reachedExit', lang)} ({routeResult.targetExitId})
                    </span>
                  )}
                </>
              ) : (
                <span>
                  {lang === 'bn'
                    ? 'ধাপে ধাপে পথ দেখতে প্লে বাটনে ক্লিক করুন'
                    : 'Click Play or Step buttons to begin walkthrough'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle Chip */}
          <button
            onClick={() => setSpeed((s) => (s === '1x' ? '2x' : '1x'))}
            title={speed === '1x' ? t('speedFast', lang) : t('speedNormal', lang)}
            className="btn-tactile touch-target px-3 py-1.5 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface font-mono text-xs font-bold cursor-pointer border border-outline-variant/40"
          >
            {speed === '1x' ? t('speedNormal', lang) : t('speedFast', lang)}
          </button>

          <button
            onClick={handlePrev}
            disabled={activeStepIndex === null || activeStepIndex <= 0}
            title={t('prevStep', lang)}
            className="btn-tactile touch-target p-2.5 rounded-full bg-surface-container hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-on-surface"
          >
            <StepBackIcon size={16} />
          </button>

          <button
            onClick={handlePlayToggle}
            title={isPlaying ? t('pause', lang) : t('play', lang)}
            className="btn-tactile touch-target px-4 py-2 rounded-full bg-indicator text-on-indicator font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md hover:bg-indicator-bright"
          >
            {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
            <span>{isPlaying ? t('pause', lang) : t('play', lang)}</span>
          </button>

          <button
            onClick={handleNext}
            disabled={activeStepIndex !== null && activeStepIndex >= stepsCount - 1}
            title={t('nextStep', lang)}
            className="btn-tactile touch-target p-2.5 rounded-full bg-surface-container hover:bg-surface-container-highest disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-on-surface"
          >
            <StepForwardIcon size={16} />
          </button>

          <button
            onClick={handleReset}
            title={t('resetStep', lang)}
            className="btn-tactile touch-target p-2.5 rounded-full bg-surface-container hover:bg-surface-container-highest cursor-pointer text-on-surface"
          >
            <ResetIcon size={16} />
          </button>
        </div>
      </div>

      {/* Interactive Step Progress Track */}
      <div className="w-full flex items-center gap-1.5 pt-1">
        {routeResult.edgeIds.map((edgeId, idx) => {
          const isPassed = activeStepIndex !== null && idx < activeStepIndex;
          const isCurrent = activeStepIndex === idx;

          return (
            <button
              key={`progress-${edgeId}-${idx}`}
              onClick={() => {
                setIsPlaying(false);
                setActiveStepIndex(idx);
              }}
              title={`${t('stepNumber', lang)} ${idx + 1}: ${routeResult.path[idx]} → ${routeResult.path[idx + 1]}`}
              className="flex-1 h-2 rounded-full cursor-pointer transition-all relative group"
            >
              <div
                className={`w-full h-full rounded-full transition-colors ${
                  isCurrent
                    ? 'bg-indicator shadow-sm ring-2 ring-indicator-bright'
                    : isPassed
                    ? 'bg-primary'
                    : 'bg-surface-container-highest group-hover:bg-outline-variant/60'
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
