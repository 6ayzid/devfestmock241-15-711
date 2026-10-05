import React, { useEffect } from 'react';
import type { RouteResult } from '../types/building';
import type { Language } from '../utils/i18n';
import { t, formatNumber } from '../utils/i18n';
import { PlayIcon, PauseIcon, StepForwardIcon, StepBackIcon, ResetIcon } from './Icons';

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
  const stepsCount = routeResult.edgeIds.length;

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
      }, 1200);
    }
    return () => clearInterval(timer);
  }, [isPlaying, stepsCount, setActiveStepIndex, setIsPlaying]);

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

  return (
    <div className="w-full bg-surface-container-high rounded-[24px] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
      {/* Step Info */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
            activeStepIndex !== null
              ? 'bg-indicator text-on-indicator'
              : 'bg-surface-container text-on-surface-variant'
          }`}
        >
          {activeStepIndex !== null ? formatNumber(currentStepNum, lang) : '•'}
        </div>
        <div>
          <span className="text-xs font-semibold text-on-surface-variant block">
            {t('walkthroughTitle', lang)}
          </span>
          <span className="text-xs font-bold text-on-surface">
            {activeStepIndex !== null
              ? `${t('stepNumber', lang)} ${formatNumber(currentStepNum, lang)} / ${formatNumber(
                  stepsCount,
                  lang
                )}: ${routeResult.path[activeStepIndex]} → ${routeResult.path[activeStepIndex + 1]}`
              : lang === 'bn'
              ? 'ধাপে ধাপে পথ দেখতে প্লে বাটনে ক্লিক করুন'
              : 'Click Play or Step buttons to begin walkthrough'}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-2">
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
          className="btn-tactile touch-target px-4 py-2 rounded-full bg-indicator text-on-indicator font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
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
  );
};
