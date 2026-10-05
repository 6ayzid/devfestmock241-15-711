# Precision Mid-Contest Commands (Copy-Paste As Needed)

### 1. Build a Slice
```markdown
SLICE: Build slice S<n> from SPEC.md end-to-end. Run npm run build, fix any errors, commit with prompt in message format, and tick off matching R-items in SPEC.md.
```

### 2. Surgical Bug Fix
```markdown
FIX: <paste exact error or describe bug>. Smallest possible fix only. Do not refactor surrounding code or introduce new abstractions.
```

### 3. Material 3 Expressive Craft Pass (Kole Jain Standards)
```markdown
M3E CRAFT PASS: Audit <screen> against Material 3 Expressive and Kole Jain principles:
1. Eradicate all emojis in favor of crisp SVG icons (1.5-2px stroke).
2. Replace any native <select> dropdowns with M3 Filter Chips with active checkmarks.
3. Remove 1px hairline borders; use genuine tonal surface containers (surface-container-low, surface-container-high).
4. Verify 48px minimum touch targets and mobile-friendly tap spacing.
5. Verify Hind Siliguri typography (line-height: 1.75, letter-spacing: 0.015em).
```

### 4. Bilingual Parity Audit
```markdown
I18N AUDIT: Switch to বাংলা. Walk every screen and record:
1. Find any hardcoded English strings or untranslated labels.
2. Confirm all seed data records have natural Bengali versions.
3. Ensure numbers use bn-BD formatting (১২৩৪) and dates are localized.
4. Check for clipped or squished text. Fix all.
```

### 5. State Completeness
```markdown
STATE AUDIT: Ensure <screen> has designed Empty, Loading, and Error states in both English and Bengali. Test behavior with completely cleared localStorage.
```

### 6. Ponytail Anti-Bloat Cut
```markdown
PONYTAIL CUT: This is becoming over-engineered. Apply Ponytail:
1. Strip unnecessary helper files, abstractions, and complex menus.
2. Rely on browser-native features and existing state.
3. Keep the component under 150 lines. Focus on the core user flow.
```

### 7. Stuck / Circuit Breaker
```markdown
STUCK: You have spent 2 attempts on this. Stop. Provide the simplest browser-native alternative that satisfies the requirement, and implement that immediately.
```

### 8. Deployment Verification
```markdown
DEPLOY CHECK: Confirm the latest commit is live on Vercel. Test the live URL in an incognito window with empty localStorage. Ensure no 404s or console errors exist.
```
