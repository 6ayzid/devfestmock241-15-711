import React, { useState, useRef } from 'react';
import type { BuildingData } from '../types/building';
import type { Language } from '../utils/i18n';
import { t } from '../utils/i18n';
import { validateBuildingData } from '../utils/dijkstra';
import { CrossIcon, UploadIcon, ResetIcon, CheckIcon, AlertCircleIcon } from './Icons';

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadData: (data: BuildingData) => void;
  onResetToDefault: () => void;
  currentBuildingName: string;
  lang: Language;
}

export const DatasetModal: React.FC<DatasetModalProps> = ({
  isOpen,
  onClose,
  onLoadData,
  onResetToDefault,
  currentBuildingName,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [jsonText, setJsonText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    // Reject files larger than 2MB to protect against performance/memory issues
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(t('fileSizeExceeded', lang));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        const result = validateBuildingData(parsed);

        if (!result.valid || !result.data) {
          setErrorMessage(result.error || t('validationFailed', lang));
        } else {
          onLoadData(result.data);
          setSuccessMessage(`${t('validationSuccess', lang)}: "${result.data.building}"`);
          setTimeout(() => {
            onClose();
          }, 1200);
        }
      } catch (err) {
        setErrorMessage(`JSON Parse Error: ${(err as Error).message}`);
      }
    };

    reader.onerror = () => {
      setErrorMessage(t('validationFailed', lang));
    };

    reader.readAsText(file);
  };

  const handleTextProcess = () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!jsonText.trim()) {
      setErrorMessage(t('validationFailed', lang));
      return;
    }

    try {
      const parsed = JSON.parse(jsonText);
      const result = validateBuildingData(parsed);

      if (!result.valid || !result.data) {
        setErrorMessage(result.error || t('validationFailed', lang));
      } else {
        onLoadData(result.data);
        setSuccessMessage(`${t('validationSuccess', lang)}: "${result.data.building}"`);
        setTimeout(() => {
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(`JSON Parse Error: ${(err as Error).message}`);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-lg bg-surface rounded-[28px] p-6 shadow-xl flex flex-col gap-4 border border-surface-container-high animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-primary text-on-primary flex items-center justify-center">
              <UploadIcon size={18} />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-on-surface">
              {t('datasetManager', lang)}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            <CrossIcon size={18} />
          </button>
        </div>

        {/* Current Dataset Status */}
        <div className="px-4 py-2.5 rounded-2xl bg-surface-container-low text-xs flex items-center justify-between">
          <span className="text-on-surface-variant font-medium">
            {t('currentBuilding', lang)}:
          </span>
          <span className="font-bold text-on-surface font-mono truncate max-w-[260px]">
            {currentBuildingName}
          </span>
        </div>

        {/* M3 Segmented Tab Switcher */}
        <div className="flex items-center p-1 rounded-full bg-surface-container-high w-fit text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('upload');
              setErrorMessage(null);
            }}
            className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('uploadFileTab', lang)}
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('paste');
              setErrorMessage(null);
            }}
            className={`px-4 py-1.5 rounded-full transition-colors cursor-pointer ${
              activeTab === 'paste'
                ? 'bg-primary text-on-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {t('pasteJsonTab', lang)}
          </button>
        </div>

        {/* Tab 1: Drag & Drop Zone */}
        {activeTab === 'upload' && (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-[24px] p-6 flex flex-col items-center justify-center text-center gap-3 transition-colors cursor-pointer group ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-outline-variant hover:border-primary bg-surface-container-low'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-12 h-12 rounded-full bg-surface-container-high group-hover:bg-primary group-hover:text-on-primary text-primary flex items-center justify-center transition-colors">
              <UploadIcon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {t('dropJsonHere', lang)}
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                {t('jsonFileHint', lang)}
              </p>
            </div>
            <input
              ref={fileInputRef}
              id="json-file-input"
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleFileInput}
            />
          </div>
        )}

        {/* Tab 2: Raw JSON Paste Area */}
        {activeTab === 'paste' && (
          <div className="flex flex-col gap-2.5">
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder={t('pasteJsonPlaceholder', lang)}
              className="w-full p-3 rounded-2xl bg-surface-container-low border border-outline-variant focus:border-primary text-xs font-mono text-on-surface resize-none focus:outline-hidden"
            />
            <button
              type="button"
              onClick={handleTextProcess}
              className="btn-tactile touch-target w-full py-2.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <CheckIcon size={16} />
              <span>{t('validateAndLoad', lang)}</span>
            </button>
          </div>
        )}

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-error-container text-on-error-container text-xs flex items-start gap-2.5">
            <AlertCircleIcon size={18} className="shrink-0 mt-0.5 text-error" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3.5 rounded-2xl bg-tertiary-container text-on-tertiary-container text-xs flex items-center gap-2.5">
            <CheckIcon size={18} className="shrink-0 text-tertiary" />
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              onResetToDefault();
              setSuccessMessage(t('validationSuccess', lang));
              setTimeout(() => onClose(), 800);
            }}
            className="btn-tactile touch-target flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface cursor-pointer"
          >
            <ResetIcon size={14} />
            <span>{t('restoreDefault', lang)}</span>
          </button>

          <button
            onClick={onClose}
            className="btn-tactile touch-target px-5 py-2 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-xs font-bold cursor-pointer"
          >
            {t('close', lang)}
          </button>
        </div>
      </div>
    </div>
  );
};
