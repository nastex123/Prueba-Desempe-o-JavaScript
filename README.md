# Prueba-Desempe-o-JavaScript - Workspace Reservation SPA

A single-page application for managing workspace reservations built with vanilla JavaScript, Vite, Tailwind CSS v4, and json-server as a mock REST API.

## Features

- **Authentication** — Email/password login with session persistence (localStorage or sessionStorage via "Remember me").
- **Role-based access** — Admins can manage all reservations and workspaces; regular users can only manage their own reservations.
- **Reservation CRUD** — Create, read, update, delete, and change status (approve, reject, cancel) of reservations.
- **Dynamic workspace filtering** — When creating or editing a reservation, the workspace dropdown is filtered by capacity based on the number of people entered.
- **Duplicate prevention** — Reservations with the same workspace, date, and overlapping time slot are blocked.
- **Search & filter** — Filter reservations by workspace name and status.
- **Admin workspace management** — Dedicated page for creating, editing, and deleting workspaces.
- **Toast notifications** — Real-time feedback for all actions.

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Vanilla JavaScript (ES Modules) |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Backend | json-server v1 (mock REST API on port 3001) |
| Dev server | Vite dev server (port 5173) with concurrent json-server |

## Getting Started

```bash
# Install dependencies
npm install

# Start development (Vite + json-server concurrently)
npm run dev
```

- **Vite dev server**: http://localhost:5173
- **json-server API**: http://localhost:3001

### Running json-server

The project uses `concurrently` to run Vite and json-server together:

```bash
npm run dev
```

This starts both:
- Vite dev server on http://localhost:5173
- json-server on http://localhost:3001 watching `db.json`

To run json-server separately:

```bash
npx json-server --watch db.json --port 3001
```

### Test Accounts

| Email | Password | Role |
|---|---|---|
| admin@test.com | A123456 | admin |
| user@test.com | A123456 | user |
| user2@test.com | A123456 | user |

## Project Structure

```
src/
├── api/http.js                 # HTTP client wrapper
├── components/
│   ├── Notification.js         # Toast notification component
│   ├── ReservationCard.js      # Reservation card with action buttons
│   └── Sidebar.js              # Fixed navigation sidebar
├── controllers/
│   ├── home.controller.js      # Reservation dashboard logic
│   ├── login.controller.js     # Login form logic
│   └── workspaces.controller.js # Workspace management logic
├── router/router.js            # SPA client-side router
├── services/                   # API service modules
│   ├── reservation.service.js
│   ├── user.service.js
│   └── workspace.service.js
├── views/                      # HTML view templates
│   ├── homeView.js
│   ├── loginView.js
│   ├── notFound.js
│   └── workspacesView.js
├── main.js                     # App entry point
├── style.css                   # Tailwind CSS import
└── utils.js                    # Session helpers
```

## API Endpoints

All served by json-server at `http://localhost:3001`:

| Method | Endpoint | Description |
|---|---|---|
| GET | /users | List users |
| GET | /workspaces | List workspaces |
| GET | /reservations | List reservations |
| POST | /reservations | Create reservation |
| PUT | /reservations/:id | Update reservation |
| PATCH | /reservations/:id | Partial update (status) |
| DELETE | /reservations/:id | Delete reservation |
| POST | /workspaces | Create workspace |
| PUT | /workspaces/:id | Update workspace |
| DELETE | /workspaces/:id | Delete workspace |

## Role Permissions

| Action | Admin | User |
|---|---|---|
| View reservations | All reservations | Own reservations only |
| Create reservation | ✅ | ✅ |
| Edit reservation | Any (any status) | Own pending only |
| Delete reservation | Any | ❌ |
| Approve reservation | Pending only | ❌ |
| Reject reservation | Pending only | ❌ |
| Cancel reservation | Any | Own pending or approved |
| Create workspace | ✅ | ❌ |
| Edit workspace | ✅ | ❌ |
| Delete workspace | ✅ | ❌ |

## Technical Decisions

- **Loose equality (`==`) for ID comparisons** — json-server v1 returns IDs as mixed types (strings or numbers depending on db.json state). Using `==` avoids `NaN` from `Number()` casts when nanoid strings appear, and handles type coercion between string and numeric IDs transparently.
- **Client-side SPA routing** — No framework router. A lightweight custom router using `history.pushState` and the `popstate` event keeps the bundle small and avoids external dependencies.
- **Fixed sidebar** — The sidebar uses `fixed` positioning with `ml-64` on the main content to avoid layout shifts on scroll.
- **Modal pattern** — CRUD forms use a single overlay modal (`#modalOverlay` + `#modalContent`) to avoid page navigation and preserve state. Each controller re-renders modal HTML via string templates.
- **Toast notifications** — A lightweight `Notification` component appends timed toast messages to the DOM and auto-removes them after a timeout, avoiding a notification library dependency.
- **json-server v1 over v0** — json-server v1 (`^1.0.0-beta.15`) provides native ESM support and better CLI integration, but has the side effect of rewriting `db.json` on startup (adding `$schema`, converting types).
- **Dynamic workspace filtering** — Instead of showing all workspaces and relying on the user to check capacity, the dropdown is filtered reactively on every keystroke of the people input using an `input` event listener.
- **Sequential numeric IDs** — Although json-server v1 generates nanoid strings by default, IDs in `db.json` are pre-seeded as numeric values. New resources are assigned IDs by json-server; the client never sends an `id` field in POST bodies.

## Known Issues

- **json-server v1 rewrites `db.json`** — On startup, json-server v1 adds a `$schema` line and may convert numeric IDs to strings. If the file becomes corrupted, restore it from the latest clean backup in version control. All client-side code uses `==` for ID matching to tolerate this.

## Bugs Fixed

- **Json-server v1 db.json corruption** — Json-server v1 rewrites `db.json` at runtime, converting numeric IDs to strings, adding a `$schema` line, and sometimes wiping data. Mitigated by using loose equality (`==`) for all ID comparisons and cleaning up `db.json` on restart.
- **Strict ID type mismatches** — All ID comparisons originally used `===` or `Number()` casts, causing failures when json-server returned IDs as strings while form values were also strings. Changed all comparisons to `==`.
- **NaN from Number(id)** — `Number(id)` returned `NaN` for nanoid strings generated by json-server. Removed all `Number()` casts from ID comparisons.
- **Manual sequential IDs in POST** — The reservation creation payload included a client-computed `maxId + 1` field, conflicting with json-server's own ID generation. Removed manual ID from POST body.
- **Workspace select showing nanoid values** — After db.json corruption, workspace selects displayed json-server's autogenerated nanoid values instead of meaningful names. Fixed by restoring clean `db.json`.
- **"Seleccione un espacio válido" error on new reservations** — Caused by empty workspace list (json-server wiped data) and undefined `selectedWorkspace` when `workspaces.find()` returned nothing.
- **Capacity filter exception on undefined workspace** — `selectedWorkspace.capacity` threw when `selectedWorkspace` was `undefined`.

## Features Added

- **Dynamic capacity-based workspace filtering** — Creating/editing a reservation requires entering the number of people; the workspace dropdown dynamically shows only spaces with sufficient capacity.
- **`people` field on reservations** — Each reservation stores the number of people for capacity management.
- **Duplicate reservation validation** — Client-side check prevents creating overlapping reservations for the same workspace, date, and time slot (cancelled/rejected reservations excluded).
- **Session persistence with "Recordar sesión"** — Checkbox toggles between localStorage (persistent) and sessionStorage (tab-scoped).
- **Fixed sidebar** — Sidebar stays visible on scroll with `fixed` positioning.
- **Separate workspace management page** — Admin workspace CRUD moved from the Dashboard to its own `/workspaces` route.
- **Admin-only route guard** — `/workspaces` is automatically blocked for non-admin users with redirect to `/home`.
- **Role-aware sidebar navigation** — "Gestión de Espacios" link only visible to admin; active route is highlighted.
- **Black & white action buttons** — Edit, delete, approve, reject, and cancel buttons use simple border styling instead of colored backgrounds.
- **Toast notification system** — Real-time feedback for all operations (create, update, delete, approve, reject, cancel).
- **Search and filter** — Filter reservations by workspace name (text input) and status (dropdown).
