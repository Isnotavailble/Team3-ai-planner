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

### 📊 Categorized Metrics Dashboard Section
Once the business profile is generated, a new multi-dimensional metrics section is shown on the dashboard via [CategorizedMetrics.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/CategorizedMetrics.jsx):
* **Financial Health**: Visualizes actual vs. target revenue over a 6-month period and breaks down budget allocation (Marketing, Operations, Software) dynamically.
* **Sales & Market Penetration**: Projects sales velocity trends over 30 days.
* **Customer Acquisition**: Displays relative marketing channel effectiveness and segment alignment (SMBs, Enterprise, Retail) based on onboarding profiles.

### 🧠 Promoted Full-Page AI Predictive Simulation
* **Full-Page Sim Experience**: The simulator has been promoted from a small drawer panel to a dedicated, high-impact workspace page ([AIReportPage.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/AIReportPage.jsx)).
* **Interactive Probability Charts**: Uses a vertical bar chart to cleanly render the probabilities of key scenario pathways.
* **Post-Simulation Agent Consultation**: Allows the user to directly click and consult simulated B2B actors to understand their reasoning.

### 📈 Dynamic Probability Curves & Normal Distribution Model
* **7-Scenario Spectrum**: Upgraded from a simple binary decision mode to a comprehensive 7-scenario normal distribution curve (ranging from Aggressive Market Capture to Total Market Retreat).
* **Dynamic Parameter Shifting**: Sliding parameters like competitor aggressiveness shifts the distribution peak and recalculates probabilities dynamically on the AreaChart.

### 🛠️ UX, Tooltip, and Precision Fixes
* **Recharts Overlapping Dot Deduplication**: Patched the Trend Analysis chart tooltip to deduplicate lines on coordinate overlap.
* **Floating-Point Precision Fix**: Resolved JS floating point rounding artifacts in financials dashboard cards.
* **User-Friendly Naming Overhaul**: Replaced developer-centric jargon ("Interrogate Room" -> "AI Simulation Assistant", "AI Copilot" -> "Ask AI", back button cleanup) to maintain a professional, high-end SaaS product tone.

### ⚙️ Developer Mode Graph Toggle
* **Resource Optimization**: The SVG physics-based relationship map is now hidden behind a **Dev Mode Toggle** on the dashboard card ([MarketGraphCard.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/MarketGraphCard.jsx)). This prevents high resource consumption on page load and optimizes performance.

---

## 3. Technology Stack

* **Core Framework**: React 19 (via Vite)
* **Routing**: React Router DOM v7
* **Styling**: Tailwind CSS v3 + Vanilla CSS Variables ([index.css](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/index.css))
* **Animations**: Framer Motion
* **Data Visualization**: Recharts (Line, Area, Pie, and Bar charts)
* **Icons**: Lucide React

---

## 4. Core Architecture & Routing (`App.jsx`)

The routing structure in [App.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/App.jsx) is optimized to render layouts and dynamic panels seamlessly:

* **`/` (Root)**: Renders the [Onboarding](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Onboarding/Onboarding.jsx) component. Users can input details manually or complete an interactive AI chat onboarding sequence.
* **`/workspace`**: The Executive Dashboard, featuring:
  * **Dynamic KPI Cards** with sparklines.
  * **Categorized Metrics** containing financial, sales, and channel charts.
  * **Historical Trend Charts** and **Recent Intelligence Signals**.
  * **Market Relationship Map** wrapped in a Dev Mode toggled panel.
* **`/workspace/predict`**: Renders the dedicated full-page [AIReportPage](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/AIReportPage.jsx) simulation suite.
* **Sidebar Drawers**: Slide-in panels handled on child routes:
  * `/workspace/drilldown`: Detailed panel of a selected node.
  * `/workspace/chat`: The agent interrogation panel to chat with simulated actors.

---

## 5. Component Structure

### Dashboard (`src/components/Dashboard/`)
* **[DynamicKPICards.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/DynamicKPICards.jsx)**: Dynamically computes active retailers, connections, and competitor signals with sparklines.
* **[CategorizedMetrics.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/CategorizedMetrics.jsx)**: Renders multiple categorized charts mapping the onboarding profile context.
* **[TrendChart.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/TrendChart.jsx)**: Displays historical and projected sales/market growth data.
* **[RecentSignals.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/RecentSignals.jsx)**: Lists transactional intelligence documents.
* **[MarketGraphCard.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Dashboard/MarketGraphCard.jsx)**: Dashboard card that toggles the SVG physics engine.

### Predictive Engine (`src/components/`)
* **[AIReportPage.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/AIReportPage.jsx)**: Configures parameters, triggers simulation steps, shows system logs, displays vertical probability charts, and routes to agent interrogation.

### Visualization (`src/components/Graph/`)
* **[GraphCanvas.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Graph/GraphCanvas.jsx)**: Custom SVG network graph using lightweight spring and repulsion physics. Includes offset calculations to prevent overlapping paths.

### Drawers & Interrogation (`src/components/Sidebar/` & `src/components/Interrogate/`)
* **[Drilldown.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Sidebar/Drilldown.jsx)**: Displays context summaries and nearest neighbors for selected entities.
* **[AgentChat.jsx](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/components/Interrogate/AgentChat.jsx)**: Tabbed chat interface simulating dialogue with B2B actors.

---

## 6. Styling Strategy

Strivo AI integrates a hybrid styling structure designed for premium executive aesthetics:
1. **CSS Variables ([index.css](file:///c:/Users/AnyaWalker/Desktop/GeminiPlayGround/hackathon/strategic-planner/src/index.css))**: Defines the semantic design token values (e.g. `--surface-page`, `--surface-card`, `--text-primary`, and specific `--entity-*` node colors).
2. **Tailwind CSS**: Manages responsive structures, flexboxes, spacing, and typography sizes.
3. **Micro-animations & Mesh Gradients**: Built-in CSS animations (`customPulse`, custom scrollbars) and Framer Motion spring-based configurations for panel transitions.

---

## 7. Build and Execution Scripts

The project utilizes Vite for bundling and hot reloading. Run the following commands:

* `npm run dev`: Starts the local development server.
* `npm run build`: Compiles optimized static assets for production deployment.
* `npm run lint`: Validates source code against ESLint configurations.
* `npm run preview`: Previews the production build locally.
