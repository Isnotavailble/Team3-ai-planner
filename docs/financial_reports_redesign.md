# Financial Reports Page Redesign (ဘဏ္ဍာရေး အစီရင်ခံစာ)

This document specifies the technical design, layout enhancements, and integration details for the redesigned **Financial Reports** page in the Strivo AI Strategic Planner application.

---

## 1. Design Strategy & Layout Overview

The layout has been updated to mimic a high-end fintech/SaaS business intelligence panel, shifting away from generic mobile layouts to a responsive, balanced desktop-friendly architecture.

```
┌────────────────────────────────────────────────────────┐
│ Header (Reports Title & Export Actions)                │
├──────────────────────────────┬─────────────────────────┤
│                              │                         │
│ Composed Chart               │ Expenses Donut Chart    │
│ (Sales vs Target - Jan-Dec)  │ (Supplier, Rent, etc)   │
│                              │                         │
├──────────────────────────────┴─────────────────────────┤
│ Period Selector & Active Time Indicators                │
├────────────────────────────────────────────────────────┤
│ Key Financial Analytics KPI Grid                       │
│ ┌──────────────┐ ┌──────────────┐ ┌───────┐ ┌────────┐ │
│ │ Top Product  │ │ Month Growth │ │ Best  │ │ Retent │ │
│ └──────────────┘ └──────────────┘ └───────┘ └────────┘ │
└────────────────────────────────────────────────────────┘
```

---

## 2. Specific Feature Specifications

### 2.1 Sales vs. Target Composed Chart
* **Replaces:** The legacy radial gauge target card.
* **Component:** Recharts `<ComposedChart>` combining lines and bar representations.
* **Colors:**
  * **Actual Sales (Revenue/Expenses):** Modern green (`#10b981`).
  * **Monthly Target:** Rich Plum brand accent (`var(--accent)` / `#6B2D7B`).
* **Timeline Scale:** X-Axis maps complete months **Jan to Dec**.
* **Hover Tooltip:** Dynamic percentage achievement computed inside `<CustomTooltip>` on the fly:
  $$\text{Achievement \%} = \left( \frac{\text{Actual Revenue}}{\text{Target}} \right) \times 100$$
* **Interactive Toggles:** Let users flip the chart bar dataset values between **Revenue** (ရောင်းရငွေ) and **Expenses** (အသုံးစရိတ်).

### 2.2 Bottom KPI Analytics Grid
To preserve visual weight and page balance after removing the bottom transaction ledger card, a 4-column responsive grid containing business indicators was introduced:

1. **Top Selling Product (ဦးဆောင်ထုတ်ကုန်):** Dynamically extracts the top-performing item name and price cataloged in the profile.
2. **Monthly Growth Rate (လစဉ်တိုးတက်မှုနှုန်း):** Computes actual growth indicators from transaction logs and scales with positive trend icons (`+14.8%` baseline).
3. **Best Sales Day (အရောင်းရဆုံးနေ့):** Projects busiest weekday traffic metrics (e.g. Saturday / စနေနေ့).
4. **Customer Retention (ဝယ်ယူသူထိန်းသိမ်းမှုနှုန်း):** Displays repeat customer ratio analytics (`82.4%`).

---

## 3. Visual Styling & Polish
* **Fluid Grids:** Grid panels automatically wrap from 4-columns on desktop to 2-columns on tablet and 1-column on mobile viewports.
* **Micro-animations:** Incorporates Framer-like transition scales (`transform: translateY(-4px)`) and drop-shadow elevations on card mouse hovering.
* **CSS Consistency:** Mapped directly to existing CSS variable design tokens defined in `index.css` for instant dark mode compatibility.
