# Strivo AI Strategic Planner - Project Documentation

This document serves as a comprehensive overview of the **Strivo AI Strategic Planner** codebase. It is designed to provide complete context on the application's architecture, data flow, component structure, and styling strategy.

---

## 1. Project Overview

**Strivo AI Strategic Planner** (formerly Lattice B2B) is a modern, React-based intelligence and strategy simulation dashboard tailored for B2B and SME markets. It enables business users to visualize market relationships (retailers, competitors, wholesale distributors), ingest intelligence signals, and run simulated "what-if" scenarios powered by swarm-intelligence mock agents. 

The application recently underwent a major upgrade, transforming from a developer-centric visualization tool to a premium, executive-level strategic hub.

---

## 2. Key Enhancements & New Features

### 💬 Interactive Chat-Based Onboarding
* **Dynamic Context Ingestion**: Instead of rigid forms, users can describe their market structure in natural language.
* **AI Dialogue Flow**: An AI assistant interrogates the user for missing details (such as budget, sales, and challenges) to generate a complete business profile.
* **Typing Indicator & Guards**: Displays a pulsing bounce dots typing indicator while the AI is "thinking" and blocks rapid double-submissions. Includes defensive guards to prevent index state crashes.
* **Strivo Assistant Rebranding**: Rebranded the onboarding bot from "Lattice Assistant" to "Strivo Assistant" and replaced the green status dot with a pulsing `Sparkles` icon.
* **Native Form Submissions & Validations**: Onboarding and profile settings utilize standard `<form>` tags to support "Enter-to-submit" accessibility and robust HTML5 validations (e.g., non-negative whole numbers for MMK monetary fields).

### 💀 High-Fidelity Shimmering Skeleton Loaders
* **Page-Level Workspace Loaders**: Switching session histories or completing onboarding triggers a page-wide shimmering loading state (mimicking KPI cards, financials/budgeting grids, sales charts, and graph canvas).
* **Predictive Simulation Result Skeletons**: Displays a structured placeholder of the verdict, Scenario Probability AreaChart, evaluated pathways, and dynamics lists while logs compile and agents process.
* **Theme-Aware Skeletons**: All skeleton loaders automatically adapt their background and gradient colors based on the active Dark/Light mode theme.
* **Synchronized Loading State**: The loading UI is completely synchronized with the actual API data fetching lifecycle, avoiding arbitrary `setTimeout` delays.

### 🌓 Premium Dark & Light Mode Support
* **CSS Variable Architecture**: The entire application is themed using CSS variables mapped within `tailwind.config.js` to ensure fluid transitions between Light Mode (Plum/Linen aesthetic) and Dark Mode (Plum/Charcoal aesthetic).
* **FOUC Prevention**: A synchronous script in `index.html` reads the `localStorage` theme preference before React mounts, preventing the Flash of Unstyled Content (FOUC).

### 🌍 Bilingual Localization (Myanmar & English)
* **Seamless Language Toggling**: Full dual-language support built into the layout header, dynamically translating charts, KPI labels, AI recommendations, and navigation without requiring page reloads.

### 📊 Categorized Metrics Dashboard Section
Once the business profile is generated, a new multi-dimensional metrics section is shown on the dashboard via `CategorizedMetrics.jsx`:
* **Financial Health**: Visualizes actual vs. target revenue over a 6-month period and breaks down budget allocation (Marketing, Operations, Software) dynamically.
* **Sales & Market Penetration**: Projects sales velocity trends over 30 days.
* **Customer Acquisition**: Displays relative marketing channel effectiveness and segment alignment (SMBs, Enterprise, Retail) based on onboarding profiles.

### 🧠 Promoted Full-Page AI Predictive Simulation
* **Full-Page Sim Experience**: The simulator has been promoted from a small drawer panel to a dedicated, high-impact workspace page (`AnalyticsView.jsx`).
* **Interactive Probability Charts**: Uses a vertical bar chart to cleanly render the probabilities of key scenario pathways.
* **Live System Logs & Scanners**: The simulation process displays a progressive terminal-style log output and a pulsating CPU scanner, immersing the user in the data calculation process.

### 📈 Dynamic Probability Curves & Normal Distribution Model
* **7-Scenario Spectrum**: Upgraded from a simple binary decision mode to a comprehensive 7-scenario normal distribution curve (ranging from Aggressive Market Capture to Total Market Retreat).
* **Dynamic Parameter Shifting**: Sliding parameters like competitor aggressiveness shifts the distribution peak and recalculates probabilities dynamically on the AreaChart.

### 🛠️ UX, Tooltip, and Precision Fixes
* **Recharts Overlapping Dot Deduplication**: Patched the Trend Analysis chart tooltip to deduplicate lines on coordinate overlap.
* **Floating-Point Precision Fix**: Resolved JS floating point rounding artifacts in financials dashboard cards.
* **User-Friendly Naming Overhaul**: Replaced developer-centric jargon ("Interrogate Room" -> "AI Simulation Assistant", "AI Copilot" -> "Ask AI", back button cleanup) to maintain a professional, high-end SaaS product tone.
* **Mobile Redirection & UI Redesign**: Added a sleek navigation sidebar option for redirecting users to the dedicated mobile app landing page. Refined the Reports Dashboard pie chart with a professional side-by-side thematic legend layout.

### ⚙️ Developer Mode Graph Toggle
* **Resource Optimization**: The SVG physics-based relationship map is now hidden behind a **Dev Mode Toggle** on the dashboard card (`MarketGraphCard.jsx`). This prevents high resource consumption on page load and optimizes performance.

---

## 3. Technology Stack

* **Core Framework**: React 19 (via Vite)
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS v3 + Vanilla CSS Variables (`index.css`) mapped to `tailwind.config.js`
* **Animations**: Framer Motion
* **Data Visualization**: Recharts (Line, Area, Pie, and Bar charts)
* **Icons**: Lucide React

---

## 4. Core Architecture & Routing (`App.jsx`)

The routing structure in `App.jsx` is optimized to render layouts and dynamic panels seamlessly:

* **`/` (Root)**: Renders the `Onboarding.jsx` component. Users can input details manually or complete an interactive AI chat onboarding sequence.
* **`/workspace`**: The Executive Dashboard, featuring:
  * **Dynamic KPI Cards** with sparklines.
  * **Categorized Metrics** containing financial, sales, and channel charts.
  * **Historical Trend Charts** and **Recent Intelligence Signals**.
  * **Market Relationship Map** wrapped in a Dev Mode toggled panel.
* **`/workspace/analytics`**: Renders the dedicated full-page `AnalyticsView.jsx` simulation suite.
* **`/workspace/reports`**: Financial and operational reporting dashboard.
* **`/workspace/profile`**: Theme selection, business inventory, and application settings.

---

## 5. Component Structure

### Dashboard (`src/components/Dashboard/`)
* **`DashboardPage.jsx`**: Centralized layout orchestrating the dashboard views.
* **`CategorizedMetrics.jsx`**: Renders multiple categorized charts mapping the onboarding profile context.
* **`TrendChart.jsx`**: Displays historical and projected sales/market growth data.
* **`RecentSignals.jsx`**: Lists transactional intelligence documents.
* **`MarketGraphCard.jsx`**: Dashboard card that toggles the SVG physics engine.

### Predictive Engine (`src/components/Dashboard/`)
* **`AnalyticsView.jsx`**: Configures parameters, triggers simulation steps, shows system logs, displays charts, and generates localized AI insights.

### Visualization (`src/components/Graph/`)
* **`GraphCanvas.jsx`**: Custom SVG network graph using lightweight spring and repulsion physics. Includes offset calculations to prevent overlapping paths.

### Drawers & Interrogation (`src/components/Sidebar/` & `src/components/Interrogate/`)
* **`Drilldown.jsx`**: Displays context summaries and nearest neighbors for selected entities.
* **`AgentChat.jsx`**: Tabbed chat interface simulating dialogue with B2B actors.

---

## 6. Styling Strategy

Strivo AI integrates a hybrid styling structure designed for premium executive aesthetics:
1. **CSS Variables & Standard Imports (`index.css`)**: Defines the semantic design token values for light and dark themes, and imports Tailwind packages. Contains shimmer loader animations.
2. **Tailwind CSS (`tailwind.config.js`)**: Extends the default palette to map directly to CSS variables, ensuring atomic classes (e.g., `bg-surface-card`) respect the active theme seamlessly.
3. **Micro-animations & Mesh Gradients**: Built-in CSS animations (`customPulse`, custom scrollbars, bouncing typing indicator).

---

## 7. Build and Execution Scripts

The project utilizes Vite for bundling and hot reloading. Run the following commands:

* `npm run dev`: Starts the local development server.
* `npm run build`: Compiles optimized static assets for production deployment.
* `npm run lint`: Validates source code against ESLint configurations.
* `npm run preview`: Previews the production build locally.
