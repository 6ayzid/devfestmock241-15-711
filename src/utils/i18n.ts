export type Language = 'en' | 'bn';

export const translations = {
  en: {
    appTitle: 'Smart Escape',
    appSubtitle: 'Interactive Evacuation Route Simulator',
    diuBranding: 'DIU AI DevFest 2026',
    tagline: 'Build an interactive map. Compute routes. Respond to hazards.',

    // Top Bar & Controls
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    resetHazards: 'Reset Hazards',
    uploadJson: 'Upload JSON',
    exportRouteCsv: 'Export CSV',
    exportMapPng: 'Export PNG',
    restoreDefault: 'Reset to Default Building',

    // Routing Statuses (Verbatim as required)
    noRoute: 'No route available',
    startBlocked: 'Starting location blocked',
    safeRouteFound: 'Safe evacuation route identified',
    selectStartPrompt: 'Select an unblocked room or junction as start point',

    // Route Metrics & Details
    startLocation: 'Starting Point',
    targetExit: 'Assigned Exit',
    totalCost: 'Total Evacuation Cost',
    corridorCount: 'Corridors Traversed',
    pathSequence: 'Optimal Node Sequence',
    costLabel: 'Cost',
    stepsCount: 'Steps',
    stepNumber: 'Step',
    destination: 'Destination',
    safeStatus: 'Clear Route',

    // Node & Edge Types
    room: 'Room',
    junction: 'Junction',
    exit: 'Exit',
    corridor: 'Corridor',

    // Hazard Statuses & Controls
    hazardControls: 'Hazard Controls',
    hazardLegend: 'Map Legend',
    blockedNodes: 'Blocked Rooms & Junctions',
    blockedCorridors: 'Blocked Corridors',
    closedExits: 'Closed Exits',
    activeRoute: 'Evacuation Path',
    normalState: 'Normal / Available',
    blockedState: 'Blocked / Hazard',
    closedState: 'Closed',
    openState: 'Open',
    clickToToggle: 'Click map elements or chips below to toggle hazard status',

    // Walkthrough & Playback
    walkthroughTitle: 'Step-by-Step Evacuation Walkthrough',
    play: 'Play Walkthrough',
    pause: 'Pause Walkthrough',
    prevStep: 'Previous',
    nextStep: 'Next',
    resetStep: 'Restart',
    currentStepDesc: 'Proceed from {from} to {to} (Corridor Cost: {cost})',
    activeStepIndicator: 'Active Step',

    // File Upload & Validation
    datasetManager: 'Building Dataset',
    uploadFileTab: 'Upload File',
    pasteJsonTab: 'Paste JSON',
    pasteJsonPlaceholder: 'Paste building.json content here...',
    validateAndLoad: 'Validate & Load',
    dropJsonHere: 'Drag & drop a custom building.json file or click to select',
    jsonFileHint: 'Supports .json schema (2-60 nodes, 1-150 edges)',
    fileSizeExceeded: 'File size cannot exceed 2 MB',
    close: 'Close',
    validationSuccess: 'Dataset loaded and validated successfully',
    validationFailed: 'Invalid building dataset format',
    nodesCount: 'Nodes',
    edgesCount: 'Edges',
    currentBuilding: 'Current Building',

    // Quick Test Scenarios
    scenarios: 'Sample Test Checks (Sec 4.1)',
    scenarioBaseline: 'Baseline (R1)',
    scenarioBlockedC2: 'Blocked Junction C2',
    scenarioExitsClosed: 'Close All Exits (E1 & E2)',
    scenarioDifferentStart: 'Start at R2',
    scenarioBlockedStart: 'Blocked Start (R1 Blocked)',
  },
  bn: {
    appTitle: 'স্মার্ট এস্কেপ',
    appSubtitle: 'ইন্টারেক্টিভ বহির্গমন রুট সিমুলেটর',
    diuBranding: 'ডিআইইউ এআই দেবফেস্ট ২০২৬',
    tagline: 'ইন্টারেক্টিভ ম্যাপ তৈরি করুন। রুট হিসাব করুন। বিপদে দ্রুত সিদ্ধান্ত নিন।',

    // Top Bar & Controls
    theme: 'থিম',
    light: 'হালকা',
    dark: 'অন্ধকার',
    system: 'সিস্টেম',
    resetHazards: 'বিপদাবস্থা রিসেট',
    uploadJson: 'JSON আপলোড',
    exportRouteCsv: 'CSV এক্সপোর্ট',
    exportMapPng: 'PNG এক্সপোর্ট',
    restoreDefault: 'ডিফল্ট বিল্ডিং রিসেট',

    // Routing Statuses (Verbatim as required)
    noRoute: 'কোনো পথ উপলব্ধ নেই',
    startBlocked: 'শুরুর স্থান অবরুদ্ধ',
    safeRouteFound: 'নিরাপদ বহির্গমন পথ নিশ্চিত করা হয়েছে',
    selectStartPrompt: 'একটি উন্মুক্ত কক্ষ বা জংশন প্রারম্ভিক বিন্দু হিসেবে বেছে নিন',

    // Route Metrics & Details
    startLocation: 'প্রারম্ভিক অবস্থান',
    targetExit: 'নির্ধারিত বহির্গমন',
    totalCost: 'মোট রুট ব্যয়',
    corridorCount: 'অতিক্রান্ত করিডোর',
    pathSequence: 'অনুকূল নোড ক্রম',
    costLabel: 'ব্যয়',
    stepsCount: 'ধাপসমূহ',
    stepNumber: 'ধাপ',
    destination: 'গন্তব্য',
    safeStatus: 'নিরাপদ পথ',

    // Node & Edge Types
    room: 'কক্ষ',
    junction: 'জংশন',
    exit: 'বহির্গমন',
    corridor: 'করিডোর',

    // Hazard Statuses & Controls
    hazardControls: 'বিপদ নিয়ন্ত্রণ প্যানেল',
    hazardLegend: 'চিহ্ন পরিচিতি',
    blockedNodes: 'অবরুদ্ধ কক্ষ ও জংশন',
    blockedCorridors: 'অবরুদ্ধ করিডোর',
    closedExits: 'বন্ধ বহির্গমন পথ',
    activeRoute: 'বহির্গমন পথ',
    normalState: 'স্বাভাবিক / উন্মুক্ত',
    blockedState: 'অবরুদ্ধ / বিপদ',
    closedState: 'বন্ধ',
    openState: 'উন্মুক্ত',
    clickToToggle: 'বিপদ অবস্থা পরিবর্তন করতে ম্যাপে অথবা নিচের চিপসে ক্লিক করুন',

    // Walkthrough & Playback
    walkthroughTitle: 'ধাপে ধাপে বহির্গমন নির্দেশনা',
    play: 'অ্যানিমেশন শুরু',
    pause: 'বিরতি',
    prevStep: 'পূর্ববর্তী',
    nextStep: 'পরবর্তী',
    resetStep: 'পুনরায় শুরু',
    currentStepDesc: '{from} থেকে {to} এর দিকে এগিয়ে যান (করিডোর ব্যয়: {cost})',
    activeStepIndicator: 'সক্রিয় ধাপ',

    // File Upload & Validation
    datasetManager: 'বিল্ডিং ডাটাবেজ',
    uploadFileTab: 'ফাইল আপলোড',
    pasteJsonTab: 'JSON পেস্ট',
    pasteJsonPlaceholder: 'এখানে building.json কোড পেস্ট করুন...',
    validateAndLoad: 'যাচাই ও লোড করুন',
    dropJsonHere: 'কাস্টম building.json ফাইল ড্রপ করুন বা ব্রাউজ করুন',
    jsonFileHint: 'শুধুমাত্র বৈধ .json ফাইল সমর্থিত (২-৬০ নোড, ১-১৫০ এজ)',
    fileSizeExceeded: 'ফাইলের আকার ২ মেগাবাইটের বেশি হতে পারবে না',
    close: 'বন্ধ করুন',
    validationSuccess: 'ডাটাবেজ সফলভাবে যাচাই এবং লোড করা হয়েছে',
    validationFailed: 'বিল্ডিং ডাটাবেজের ফরম্যাট সঠিক নয়',
    nodesCount: 'মোট নোড',
    edgesCount: 'মোট সংযোগ',
    currentBuilding: 'বর্তমান ভবন',

    // Quick Test Scenarios
    scenarios: 'নমুনা যাচাই সিনারিও (সেকশন ৪.১)',
    scenarioBaseline: 'বেসলাইন (R1)',
    scenarioBlockedC2: 'অবরুদ্ধ জংশন C2',
    scenarioExitsClosed: 'সকল বহির্গমন বন্ধ (E1 ও E2)',
    scenarioDifferentStart: 'R2 থেকে শুরু',
    scenarioBlockedStart: 'শুরুর স্থান অবরুদ্ধ (R1)',
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key] || translations.en[key] || key;
}

/**
 * Format numbers according to active locale (e.g. 1234 -> ১২৩৪ in bn-BD)
 */
export function formatNumber(num: number | string, lang: Language): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return String(num);
  try {
    return new Intl.NumberFormat(lang === 'bn' ? 'bn-BD' : 'en-US').format(n);
  } catch {
    return String(num);
  }
}

/**
 * Format date localized
 */
export function formatDate(date: Date, lang: Language): string {
  try {
    return new Intl.DateTimeFormat(lang === 'bn' ? 'bn-BD' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

/**
 * Export rows to CSV with UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
 */
export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (cell: string | number) => {
    const str = String(cell);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvContent =
    '\uFEFF' +
    [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
