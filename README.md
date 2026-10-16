# SplitTrip — Frontend

Web client for **SplitTrip**, an app to split shared expenses among friends and settle up with the fewest possible payments.

## Collaborators

Juan Esteban Rodriguez

## Tech stack

- React 19 · TypeScript · Vite
- React Router
- Plain CSS with design tokens (no UI framework)
- Oxlint

## Features

- Sign up with a live password checklist, email verification, login with "remember me", and password reset
- **My groups:** search, filter by category, and see your balance in each group
- **Create group:** category and participants (you are included automatically)
- **Group detail:** expenses, balances (paid vs. fair share) and a settlement plan
- **Add expense:** who paid, who shares it, and a live per-person amount
- Responsive layout for desktop and mobile

## Getting started

Requirements: Node.js 20.19+ (LTS recommended) and the [SplitTrip backend](https://github.com/JuanEstebanRodriguez2021/SplitTrip_Backend) running on port 7986.

```bash
npm install
npm run dev       # http://localhost:5173
```

### Environment

The API URL is set in `.env`:

```
VITE_API_URL=http://localhost:7986/api
```

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run Oxlint |

## Routes

| Path | Page |
|---|---|
| `/login`, `/register` | Authentication |
| `/verify-email?token=…` | Email verification (link from email) |
| `/forgot-password`, `/reset-password?token=…` | Password reset |
| `/` | My groups |
| `/trips/new` | Create group |
| `/trips/:tripId` | Group detail |
| `/trips/:tripId/expenses/new` | Add expense |

## Project structure

```
src/
├── api/          HTTP client, endpoints, types and session storage
├── auth/         Auth context and route guards
├── components/   Shared UI (header, avatars, layouts)
├── lib/          Formatting helpers, password rules, useApi hook
├── pages/        One file per screen
└── index.css     Styles and design tokens
```

## Notes

- The session is kept in `localStorage` with "remember me", or in `sessionStorage` without it. An expired token sends you back to login.
- Amounts are shown in Colombian pesos format (`$845.000`).

## Related

Backend: [SplitTrip_Backend](https://github.com/JuanEstebanRodriguez2021/SplitTrip_Backend)
