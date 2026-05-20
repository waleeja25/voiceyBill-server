# Contributing to VoiceyBill

Thanks for your interest in contributing. This guide covers all three packages in the monorepo: **backend**, **client (web)**, and **mobile**.

## Ground rules

- Be respectful and constructive in all discussions.
- Focus pull requests on one clear change.
- Open an issue before starting major features.
- Do not start working on any issue without commenting on it first and being assigned. PRs for unassigned issues will be closed.
- Do not include secrets or production credentials in any commit.
- Use the issue templates for every new issue. Blank issues are disabled.
- Use the PR template for every pull request. PRs without the template completed are not considered ready for review.
- Include screenshots, screen recordings, or request/response samples when the problem involves visible behavior or API flow.

## Backend

**Location:** `backend/`  
**Stack:** Express, TypeScript, MongoDB, Passport.js

### Setup

```bash
cd backend
cp .env.example .env   # fill in required values
npm ci
npm run dev
```

### Quality checks

```bash
npm run build
npm test --if-present
```


## Client (web)

**Location:** `client/`  
**Stack:** React 19, Vite, Tailwind CSS, Redux Toolkit

### Setup

```bash
cd client
cp .env.example .env   # set VITE_API_URL
npm ci
npm run dev
```

### Quality checks

```bash
npm run build
npm run lint
```


## Mobile

**Location:** `mobile/`  
**Stack:** React Native 0.81, Expo 54, Redux Toolkit

### Setup

```bash
cd mobile
cp .env.example .env   # set EXPO_PUBLIC_API_URL to your local machine IP
npm ci
npx expo start
```

> Use your machine's LAN IP (not `localhost`) so the device/emulator can reach the backend.

### Quality checks

```bash
npx expo export         # verify the app bundles without errors
npx tsc --noEmit        # TypeScript type check
```


## Branch and commit conventions

- Branch names should be descriptive, for example:
  - `feat/voice-transcription-card`
  - `fix/mobile-theme-tokens`
  - `docs/update-mobile-readme`
- Use clear commits that explain why the change is needed.

## Pull request requirements

- PR titles follow Conventional Commits style:
  - `feat(mobile): Add transcription result card`
  - `fix(client): Correct income chart colour tokens`
  - `chore(backend): Upgrade Mongoose to v8`
- Keep PRs small and easy to review.
- Link related issues, for example `Closes #123`.
- Include screenshots or recordings for any UI-related changes.
- Use the PR template at [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md). It loads automatically when you open a PR. Fill in every section before requesting review.

## Issues and templates

Issues of all kinds are welcome. You do not need permission to open one. Bug reports, feature ideas, questions, suggestions, discussions, and anything else you want to raise are all fair game.

When your issue matches one of the templates below, use it. GitHub shows the template picker automatically when you click New Issue:

- **Bug report** - a reproducible defect with steps, expected result, and actual result
- **Feature request** - a new feature or improvement with a clear problem statement
- **Question** - usage, setup, or clarification help

Templates are at [`.github/ISSUE_TEMPLATE/`](.github/ISSUE_TEMPLATE/). If your issue does not fit any template, open a blank issue and describe it clearly. Do not leave required template fields empty.

Keep one issue focused on one topic so it can be triaged quickly. Include a screenshot or recording for anything visual or hard to explain in text.

Before picking up any open issue to work on, comment on the issue to express your interest and wait to be assigned. You can also reach out on Discord first. Do not open a pull request for an issue that has not been assigned to you.

## Security policy

- Do not open public issues for security vulnerabilities.
- Use GitHub Security Advisories for responsible disclosure.

## Helpful setup reminders

- Start MongoDB with Docker before running the backend locally.
- Use `MONGO_DB_NAME=voiceybill` so every contributor uses the same logical database name.
