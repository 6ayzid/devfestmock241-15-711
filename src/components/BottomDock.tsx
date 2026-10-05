import React from 'react';
import type { Language } from '../utils/i18n';
import { t } from '../utils/i18n';
import type { ThemeMode } from './TopAppBar';
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  DownloadIcon,
} from './Icons';

interface BottomDockProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onExportCsv: () => void;
  onExportPng: () => void;
}

export const BottomDock: React.FC<BottomDockProps> = ({
  lang,
  onLanguageChange,
  theme,
  onThemeChange,
  onExportCsv,
  onExportPng,
}) => {
  return (
    <aside
      aria-label="Mobile Navigation Dock"
      className="fixed bottom-3 inset-x-3 sm:hidden z-30 max-w-md mx-auto bg-surface-container-high text-on-surface rounded-full shadow-lg p-1.5 flex items-center justify-between gap-1 transition-colors"
    >
      {/* Language Segmented Pill [ EN | বাংলা ] */}
      <div
        className="flex items-center bg-surface-container-highest p-0.5 rounded-full font-medium text-xs"
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => onLanguageChange('en')}
          aria-label="English language"
          className={`px-3 py-1.5 rounded-full transition-colors cursor-pointer btn-tactile ${
            lang === 'en'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => onLanguageChange('bn')}
          aria-label="বাংলা ভাষা"
          className={`px-3 py-1.5 rounded-full transition-colors font-bengali cursor-pointer btn-tactile ${
            lang === 'bn'
              ? 'bg-primary text-on-primary font-semibold shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          বাংলা
        </button>
      </div>

      {/* Theme Segmented Switcher */}
      <div
        className="flex items-center bg-surface-container-highest p-0.5 rounded-full"
        role="group"
        aria-label={t('theme', lang)}
      >
        <button
          type="button"
          onClick={() => onThemeChange('light')}
          title={t('light', lang)}
          aria-label={t('light', lang)}
          className={`p-2 rounded-full transition-colors cursor-pointer btn-tactile ${
            theme === 'light'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <SunIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => onThemeChange('system')}
          title={t('system', lang)}
          aria-label={t('system', lang)}
          className={`p-2 rounded-full transition-colors cursor-pointer btn-tactile ${
            theme === 'system'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MonitorIcon size={15} />
        </button>
        <button
          type="button"
          onClick={() => onThemeChange('dark')}
          title={t('dark', lang)}
          aria-label={t('dark', lang)}
          className={`p-2 rounded-full transition-colors cursor-pointer btn-tactile ${
            theme === 'dark'
              ? 'bg-primary text-on-primary shadow-xs'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <MoonIcon size={15} />
        </button>
      </div>

      {/* Export Quick Actions (CSV & PNG) */}
      <div
        className="flex items-center bg-surface-container-highest p-0.5 rounded-full"
        role="group"
        aria-label="Export actions"
      >
        <button
          type="button"
          onClick={onExportCsv}
          title={t('exportRouteCsv', lang)}
          aria-label={t('exportRouteCsv', lang)}
          className="btn-tactile px-2.5 py-1.5 rounded-full hover:bg-surface-container text-xs font-medium flex items-center gap-1 cursor-pointer text-on-surface"
        >
          <DownloadIcon size={13} />
          <span>CSV</span>
        </button>
        <button
          type="button"
          onClick={onExportPng}
          title={t('exportMapPng', lang)}
          aria-label={t('exportMapPng', lang)}
          className="btn-tactile px-2.5 py-1.5 rounded-full hover:bg-surface-container text-xs font-medium flex items-center gap-1 cursor-pointer text-on-surface"
        >
          <DownloadIcon size={13} />
          <span>PNG</span>
        </button>
      </div>
    </aside>
  );
};
