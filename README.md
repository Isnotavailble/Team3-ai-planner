# Lattice B2B Strategic Planner - Project Documentation

This document serves as a comprehensive overview of the **Lattice B2B Strategic Planner** codebase. It is designed to provide complete context on the application's architecture, data flow, component structure, and styling strategy.

## 1. Project Overview
Lattice B2B is a React-based intelligence and strategy simulation dashboard tailored for the SME market. It allows business users to visualize market relationships (retailers, competitors, wholesale distributors), ingest intelligence signals, and run simulated "what-if" scenarios (predicting market shifts and interrogating AI agents). 

The application recently underwent a UI overhaul, transitioning from a complex, developer-centric git-branching visualizer to a clean, premium executive dashboard.

## 2. Technology Stack
* **Core Framework**: React 19 (via Vite)
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS v3 + Vanilla CSS Variables (`index.css`)
* **Animations**: Framer Motion
* **Data Visualization**: Recharts (Line/Area charts), Custom SVG Physics Engine (Network Graph)
* **Icons**: Lucide React

## 3. Core Architecture & Routing (`App.jsx`)

The application is structured around a global `Layout` component and a dynamic `Dashboard` view.

* **`/` (Root)**: Renders the `Onboarding` component. A guided flow where users can drag-and-drop simulated supplier CSVs/PDFs or manually type market context to generate the initial graph.
* **`/workspace`**: The main Executive Dashboard. It contains:
  * Top KPI Cards (`DynamicKPICards`)
  * Data Visualization (`TrendChart`, `RecentSignals`)
  * The network graph wrapped in a card (`MarketGraphCard`)
* **Sidebar Drawers**: Child routes trigger sliding sidebar panels (`AnimatePresence` + `motion.div`) overlapping the dashboard:
  * `/workspace/drilldown`: Detailed view of a selected graph node.
  * `/workspace/predict`: The `Simulator` setup and execution panel.
  * `/workspace/chat`: The `AgentChat` interface to interrogate simulated market actors.

## 4. Data Model & Services

### Mock Data (`src/data/mockData.js`)
Currently, the app is powered by a robust mock dataset representing a localized B2B market (e.g., Yangon Retail Shops, Competitor Platforms, Credit Policies).
* `RAW_ENTITIES`: Nodes in the graph (types: `you`, `company`, `segment`, `policy`, `concept`, `event`, `product`, `organization`).
* `RAW_EDGES`: Connections between nodes with a `kind` (strength) and `label`.
* `RAW_MATERIALS`: Intelligence documents (News leaks, Newsletters).
* `RAW_SIM_RESULTS`: Pre-calculated verdicts and agent behaviors for the simulation engine.

### Data Transfer Objects (`src/dtos/`)
To ensure safety when eventually hooking up to a real backend, data is passed through DTO mappers:
* `entity.dto.js`: Validates entity IDs, categorizes types, enforces coordinate fallbacks.
* `edge.dto.js`: Validates source (`a`) and target (`b`) IDs and relationship kinds.
* `simulation.dto.js`: Standardizes probability scenarios and critical agent arrays.

### API Service (`src/services/api.js`)
A singleton class `LatticeApiService` that simulates network latency. It handles fetching workspace data, importing documents (extracting entities), running simulations, and generating chat responses.

## 5. Component Breakdown

### Dashboard Components (`src/components/Dashboard/`)
* **`DynamicKPICards.jsx`**: Four top-level metric cards. Computes active retailers, connections, competitor signals, and intelligence sources dynamically from the workspace state. Includes Recharts `AreaChart` sparklines.
* **`TrendChart.jsx`**: A `LineChart` (Recharts) showing historical (solid line) and projected (dashed line) market trends. Supports toggling between Monthly and Quarterly aggregation.
* **`RecentSignals.jsx`**: A transactional feed rendering `materials`. Maps document types to specific colors and Lucide icons.
* **`MarketGraphCard.jsx`**: A wrapper that places the custom physics graph inside a dashboard card with a unified legend.

### Visualization (`src/components/Graph/`)
* **`GraphCanvas.jsx`**: A custom-built SVG network graph. 
  * Features a lightweight physics engine (springs/repulsion) run in a `useEffect` to untangle nodes.
  * Edges are drawn using quadratic bezier curves (`<motion.path>`) with offset calculations to prevent overlapping bi-directional links.
  * Supports panning/zooming and node-click isolation (dimming unrelated nodes).

### Sidebar Components (`src/components/Sidebar/`)
* **`Drilldown.jsx`**: Displays when a node is clicked. Shows the entity summary, connected intelligence materials, and immediate neighbor relationships.
* **`Simulator.jsx`**: The "Predict Possibility" engine. Allows users to tweak market parameters (Competitor Aggressiveness, Supply Capacity) via sliders, runs a mock 8-step progress bar, and outputs a business verdict with confidence percentages.

### Interrogation (`src/components/Interrogate/`)
* **`AgentChat.jsx`**: Triggered from the simulation results. A multi-tab chat interface allowing the user to question the AI agents (e.g., "Latha Owner", "Credit Term Policy") about why they made certain decisions in the simulation.

## 6. Styling Strategy

The project uses a hybrid styling approach designed for high-end B2B aesthetics (often referred to as "UXETO" style):

1. **CSS Variables (`index.css`)**: Defines the semantic color palette. 
   * Surfaces: `--surface-page`, `--surface-card`, `--surface-hover`.
   * Text: `--text-primary`, `--text-secondary`, `--text-tertiary`.
   * Entity Colors: Distinct hex codes for semantic nodes (e.g., `--entity-company` is Red, `--entity-you` is Slate).
2. **Tailwind CSS**: Used extensively for structural layouts (Flexbox/Grid), padding, margins, and typography sizing. Tailwind is configured in `tailwind.config.js` to inherit the custom CSS variables where applicable.
3. **Glassmorphism & Micro-animations**: Defined in `index.css` (e.g., `.glass-card`, `.light-mesh-bg`, `@keyframes customPulse`). Components heavily utilize Framer Motion for spring-based slide-ins and layout transitions.

## 7. Build and Deployment
* **Bundler**: Vite
* Commands:
  * `npm run dev`: Starts local development server.
  * `npm run build`: Compiles for production. Currently outputs chunks optimized for static hosting.
  * `npm run lint`: Runs ESLint against standard React rules.
