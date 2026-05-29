# ဘဏ္ဍာရေး အစီရင်ခံစာ — အပ်ဒိတ်မှတ်တမ်း
# Financial Reports Page — Update Documentation

> **Updated**: 2026-05-30  
> **Files Modified**: `Onboarding.jsx`, `ReportsView.jsx`

---

## ✅ ပြောင်းလဲမှုများ အကျဉ်းချုပ် (Change Summary)

### 1. Onboarding — ကုန်ကျစရိတ် အသေးစိတ်ခွဲခြားမှု (Expense Breakdown)

**ဖိုင်**: `src/components/Onboarding/Onboarding.jsx`

- **Step 3 (Expenses Step)** တွင် expense breakdown feature အသစ်ထည့်သွင်းထားသည်
- User သည် total expenses ထည့်ပြီးနောက်၊ ကုန်ကျစရိတ်ကို တစ်ခုချင်းစီ ခွဲခြားထည့်နိုင်သည်
  - **အမည် (Name)**: ဥပမာ — ဆိုင်ခ၊ လစာ၊ ကုန်ပစ္စည်း
  - **ပမာဏ (Amount)**: MMK ဖြင့် တန်ဖိုး
- ထည့်ထားသော expense items များကို list အနေဖြင့် ပြသပြီး၊ total ကိုလည်း ပေါင်းပြထားသည်
- Delete ခလုတ်ဖြင့် မလိုသော item ကို ဖျက်နိုင်သည်
- ဤအပိုင်းသည် **Optional** ဖြစ်သည် — user မထည့်လျှင်လည်း ဆက်လုပ်နိုင်သည်

**ဒေတာ ပုံစံ (Data Shape)**:
```javascript
// businessProfile.expenseBreakdown
[
  { name: "ဆိုင်ခ", value: 50000 },
  { name: "လစာ", value: 30000 },
  { name: "ကုန်ပစ္စည်း", value: 20000 }
]
```

**State အသစ်များ**:
```javascript
const [expenseItems, setExpenseItems] = useState([]);        // [{id, name, value}]
const [newExpenseItemName, setNewExpenseItemName] = useState('');
const [newExpenseItemValue, setNewExpenseItemValue] = useState('');
```

---

### 2. Financial Reports Page — အမှန် data ဖြင့် ပြသမှု

**ဖိုင်**: `src/components/Dashboard/ReportsView.jsx`

#### 2.1 လအလိုက် အရောင်းရရှိမှု Summary Cards

ထိပ်ဘက်တွင် gradient cards ၃ ခု ထပ်ထည့်ထားသည်:

| Card | အရောင် | ဒေတာ |
|------|--------|------|
| **လစဉ် အရောင်းရရှိမှု** | 💚 Green gradient | `monthlySales` — user ၏ onboarding data မှ derive |
| **လစဉ် ကုန်ကျစရိတ်** | ❤️ Red gradient | `monthlyExpenses` — user ၏ expense data |
| **လစဉ် အသားတင်အမြတ်** | 💜 Purple/Orange gradient | `monthlySales - monthlyExpenses` (profit/loss) |

#### 2.2 Bar Chart — ကုန်ကျစရိတ် ပေါင်းထည့်ခြင်း

- ယခင် chart တွင် Revenue နှင့် Target ၂ ခုသာ ပြခဲ့သည်
- အခု **Expenses** bar ကို ထပ်ထည့်ထားပြီး **အနီရောင်** ဖြင့်ပြသသည်
- 12 လစလုံးအတွက် expenses data ကို user data ပေါ်အခြေခံ derive လုပ်ထားသည်

#### 2.3 Expense Breakdown Cards (အသေးစိတ်)

- User က onboarding Step 3 တွင် expense items ထည့်ခဲ့ပါက:
  - Pie chart (donut) တွင် item တစ်ခုချင်းစီကို color ခွဲပြီး ပြသသည်
  - **Expense Detail Cards** — grid layout ဖြင့် card တစ်ခုစီတွင်:
    - Item အမည် (user ထည့်ခဲ့သည့်အတိုင်း)
    - Item တန်ဖိုး (MMK)
    - Total ၏ % ရာခိုင်နှုန်း
    - Mini progress bar
- User က expense items မထည့်ခဲ့ပါက:
  - "အထွေထွေ ကုန်ကျစရိတ်" (General Expenses) ဟု total amount ကိုသာ ပြသသည်

#### 2.4 User Data Derivation Logic

```
Sales Priority:
1. dashboardData?.metrics?.monthlySales (backend)
2. salesHistory CSV data (uploaded file)
3. businessProfile.sales.monthly (onboarding entry)
4. businessProfile.sales.daily * 30
5. businessProfile.sales.weekly / 7 * 30
6. businessProfile.sales.yearly / 12
7. Fallback: 12,000 MMK

Expenses Priority:
1. dashboardData?.metrics?.monthlyExpenses (backend)
2. salesHistory CSV derived
3. businessProfile.expenses (onboarding entry)
4. Fallback: 8,000 MMK
```

---

## 📁 ပြင်ဆင်ခဲ့သော ဖိုင်များ (Files Modified)

| ဖိုင် | ပြင်ဆင်မှု |
|--------|------------|
| `src/components/Onboarding/Onboarding.jsx` | Step 3 တွင် expense breakdown items ထည့်နိုင်သော UI + state + finishOnboarding data output |
| `src/components/Dashboard/ReportsView.jsx` | Summary cards, chart expenses bar, expense breakdown detail cards |
| `docs/financial-reports-update.md` | ဤ documentation file |

---

## 🔗 Data Flow

```
Onboarding Step 3
    ├── expensesData (total per period)
    └── expenseItems[] (individual breakdown)
         │
         ▼
    finishOnboarding()
         │
         ▼
    businessProfile = {
      expenses: derivedMonthlyExpense,
      expensesByPeriod: { monthly: X, daily: Y, ... },
      expenseBreakdown: [{ name, value }, ...]
    }
         │
         ▼
    ReportsView
         ├── Summary Cards (sales, expenses, profit)
         ├── Bar Chart (Revenue + Target + Expenses)
         ├── Pie Chart (breakdown or general)
         └── Expense Detail Cards (if breakdown exists)
```

---

## 🎨 UI/UX Notes

- Expense breakdown form is integrated seamlessly within Step 3 (below the total expense inputs)
- Cards use gradient backgrounds with matching shadows for premium feel
- Profit card changes color: purple for profit, orange for loss
- Hover animations on all cards (translateY + shadow elevation)
- Responsive grid layout adapts from 1 to 3 columns
- Myanmar language support throughout

---

## ⚠️ Known Limitations

1. Expense items are entered as flat amounts — no recurring vs one-time distinction
2. Monthly chart projections for non-May months use multiplication factors (mock data)
3. If user skips expense step entirely, fallback defaults are used (8,000 MMK)
