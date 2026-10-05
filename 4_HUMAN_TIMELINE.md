# Human Game Plan & Contest Checklist (You, Not the Agent)

## 1. Pre-Contest Setup Window (Minute -30 to 0)
* **Hardware & Connectivity (Rule 2.1 & 7.1):**
  * Bring your own laptop with charger.
  * Connect your phone hotspot as a tested backup connection (Rule 2.2).
* **Repository Setup (Rule 8.1 & 8.2):**
  * Create public GitHub repository: `devfest-<registration-number>` (e.g., `devfest-241-15-711`).
  * Initialize ONLY with `README.md` and `MIT LICENSE`.
  * **DO NOT commit any project code before T+0** (Rule 8.2 — disqualifying!).
* **Vercel Linking:**
  * Go to Vercel dashboard $\rightarrow$ Add New Project $\rightarrow$ Import `devfest-<registration-number>`.
  * Hit deploy to obtain your public HTTPS live URL before the contest starts.
* **Environment Verification:**
  * Open Antigravity / IDE, test terminal, confirm git push permissions work.

---

## 2. The 90-Minute Contest Timeline

| Time | Stage | Human Action | Strict Rulebook Requirement |
|---|---|---|---|
| **T+0** | Brief Released | Read brief quickly, paste `2_MASTER_PROMPT.md` + full brief text into Antigravity. | Phase 1 starts |
| **T+5 to T+15** | Organizer Window | Ask the organizers the 3 questions generated in Phase 1. | **Window closes at T+15!** (Rule 4.3) |
| **T+15** | GATE 1 Plan | Review the 25-line plan in `SPEC.md`. Type `"go"` to approve. | Gate 1 |
| **T+25** | Scaffolding | Agent finishes scaffold + shell. First project commit pushed. | Rule 8.3 ($\ge 1$ commit every 30m) |
| **T+35** | First Deploy | Verify Vercel live URL in phone/browser incognito. Confirm zero errors. | Rule 5.7 (Required public live site) |
| **T+55** | Slice 2 & 3 | Main requirements completed. Check commit log format. | Rule 8.4 (Every commit has prompt) |
| **T+70** | GATE 2 Freeze | Type `"freeze check"`. Halt all new feature development. | Gate 2 |
| **T+70 to T+80** | Quality Audits | Agent runs requirement, bilingual, empty state, and M3E craft passes. | Rule 5.6 (Bangla parity check) |
| **T+80 to T+85** | Ship Phase | Agent generates Section 9.3 README. Push final commit. | Rule 9.3 (Required README format) |
| **T+85** | Deployment Lock | Confirm Vercel serves the exact final commit hash. Copy SHA & URL. | Rule 8.6 & 10.2 |
| **T+88** | Form Submission | Submit the official Google form with Name, Reg No, Repo, Commit SHA, Live URL. | **Rule 9.4 (Submissions after T+90 lose 10 marks!)** |

---

## 3. Disqualification Traps to Never Trigger (Section 12)
1. **Never commit code before T+0:** Only README and LICENSE allowed in setup.
2. **Never use participant-controlled servers:** No Express, Node server, Supabase, Firebase, or cloud DB. LocalStorage only!
3. **Never hardcode API keys:** If AI is added, user must type their own key in the UI.
4. **Never rewrite git history:** No `git rebase -i`, no `git push --force`.
5. **Never commit after T+90:** Stop all commits and pushes at T+90 sharp. The extra 5 minutes (T+90 to T+95) is strictly for submitting the Google form (with a 10-mark late penalty).
