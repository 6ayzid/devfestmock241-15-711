import React from 'react';
import type { Language } from '../utils/i18n';
import { t } from '../utils/i18n';
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ResetIcon,
  UploadIcon,
  DownloadIcon,
  ShieldAlertIcon,
} from './Icons';

export type ThemeMode = 'light' | 'dark' | 'system';

interface TopAppBarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onResetHazards: () => void;
  onOpenUpload: () => void;
  onExportCsv: () => void;
  onExportPng: () => void;
  buildingName: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeChange,
  onResetHazards,
  onOpenUpload,
  onExportCsv,
  onExportPng,
  buildingName,
}) => {
  return (
    <header className="h-16 w-full bg-surface-container text-on-surface px-4 sm:px-6 flex items-center justify-between shadow-xs sticky top-0 z-30 transition-colors">
      {/* Brand & Building Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-primary text-on-primary flex items-center justify-center shadow-xs">
          <ShieldAlertIcon size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-base sm:text-lg leading-tight tracking-tight">
              {t('appTitle', lang)}
            </h1>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant hidden md:inline-block">
              {t('diuBranding', lang)}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant truncate max-w-[200px] sm:max-w-xs">
            {buildingName}
          </p>
        </div>
      </div>

      {/* Action Controls & Toggles */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Reset Hazards Button */}
        <button
          onClick={onResetHazards}
          title={t('resetHazards', lang)}
          className="btn-tactile touch-target flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs sm:text-sm font-medium cursor-pointer"
        >
          <ResetIcon size={16} />
          <span className="hidden sm:inline">{t('resetHazards', lang)}</span>
        </button>

        {/* Upload Dataset Button */}
        <button
          onClick={onOpenUpload}
          title={t('uploadJson', lang)}
          className="btn-tactile touch-target flex items-center gap-1.5 px-3 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs sm:text-sm font-medium cursor-pointer"
        >
          <UploadIcon size={16} />
          <span className="hidden md:inline">{t('uploadJson', lang)}</span>
        </button>

        {/* Export Actions (CSV & PNG) */}
        <div className="hidden lg:flex items-center gap-1 bg-surface-container-high rounded-full p-1">
          <button
            onClick={onExportCsv}
            title={t('exportRouteCsv', lang)}
            className="btn-tactile px-3 py-1.5 rounded-full hover:bg-surface-container-highest text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <DownloadIcon size={14} />
            <span>CSV</span>
          </button>
          <button
            onClick={onExportPng}
            title={t('exportMapPng', lang)}
            className="btn-tactile px-3 py-1.5 rounded-full hover:bg-surface-container-highest text-xs font-medium flex items-center gap-1 cursor-pointer"
          >
            <DownloadIcon size={14} />
            <span>PNG</span>
          </button>
        </div>

        {/* Theme Segmented Switcher */}
        <div className="flex items-center bg-surface-container-high p-1 rounded-full">
          <button
            onClick={() => onThemeChange('light')}
            aria-label="Light theme"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <SunIcon size={16} />
          </button>
          <button
            onClick={() => onThemeChange('system')}
            aria-label="System theme"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              theme === 'system'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MonitorIcon size={16} />
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            aria-label="Dark theme"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <MoonIcon size={16} />
          </button>
        </div>

        {/* Language Segmented Pill [ EN | বাংলা ] */}
        <div className="flex items-center bg-surface-container-high p-1 rounded-full font-medium text-xs">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
              lang === 'en'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('bn')}
            className={`px-2.5 py-1.5 rounded-full transition-colors font-bengali cursor-pointer ${
              lang === 'bn'
                ? 'bg-primary text-on-primary font-semibold shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            বাংলা
          </button>
        </div>
      </div>
    </header>
  );
};
