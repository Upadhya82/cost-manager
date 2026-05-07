# Cost Manager

Cost Manager is a React + TypeScript web app for calculating product cost and selling price per packet size.

## Features

- Raw material costing with wastage-aware effective cost
- Complete processing cost inputs (grinding, steaming, drying, labour, electricity, other)
- Common costs and profit margin controls
- Full packet management (add, edit, remove packet size and packet cost)
- Save/load cost sessions in history (rename, delete, clear all)
- Validation and user-friendly error feedback
- Print-friendly cost report
- Local storage persistence with fallback error handling

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run locally

```bash
npm run dev
```

## Quality Checks

```bash
npm run lint
npm run test
npm run build
```

## Project Structure

- `src/components` reusable UI components
- `src/utils` calculations, storage, and validation helpers
- `src/constants.ts` app constants/defaults
- `src/types.ts` shared TypeScript models

## Deployment

Recommended hosting: **Vercel**.

1. Connect this repository to Vercel
2. Build command: `npm run build`
3. Output directory: `dist`
4. Deploy

## Release Checklist

- [ ] Run lint/test/build
- [ ] Smoke test packet editing, history, and print
- [ ] Confirm local storage restore behavior
- [ ] Publish to hosting target
