import React, { useState } from 'react';
import { Plus, Target, Check, AlertTriangle, Shield, Landmark, Flame, Compass } from 'lucide-react';
import { translations } from '../../data/translations';

export default function GoalsView({ workspace = {}, businessProfile = {}, setBusinessProfile, language = 'mm' }) {
  const t = translations[language];

  // Local state for interactive Forms
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showBudgetForm, setShowBudgetForm] = useState(false);

  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalCurrent, setNewGoalCurrent] = useState('');
  const [newGoalIcon, setNewGoalIcon] = useState('Landmark');

  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetTarget, setNewBudgetTarget] = useState('');
  const [newBudgetSpent, setNewBudgetSpent] = useState('');

  // Default Goals
  const [goals, setGoals] = useState([
    { id: 1, nameMm: "ရေခဲသေတ္တာအသစ် ဝယ်ယူရန်", nameEn: "New Refrigeration Unit", current: 3200, target: 5000, icon: 'Landmark', desc: "For storing perishables" },
    { id: 2, nameMm: "လှိုင်မြို့နယ်တွင် ဆိုင်ခွဲအသစ်ဖွင့်လှစ်ရန်", nameEn: "Hlaing Branch Expansion", current: 11000, target: 25000, icon: 'Compass', desc: "Rent second kiosk ward" },
    { id: 3, nameMm: "အရေးပေါ်အရံရန်ပုံငွေ စုဆောင်းရန်", nameEn: "Emergency Cash Reserves", current: 2100, target: 3000, icon: 'Shield', desc: "Buffer for supply inflation" }
  ]);

  // Default Budgets
  const [budgets, setBudgets] = useState([
    { id: 1, nameMm: "ပစ္စည်းဝယ်ယူစရိတ်", nameEn: "Inventory Restocking", spent: 3400, limit: 4000 },
    { id: 2, nameMm: "လခနှင့် ဆိုင်ခန်းခ", nameEn: "Rent & Salaries", spent: 1800, limit: 2500 },
    { id: 3, nameMm: "သယ်ယူပို့ဆောင်ခ", nameEn: "Logistics & Transport", spent: 650, limit: 1200 }
  ]);

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!newGoalName.trim() || !newGoalTarget) return;

    const newGoalObj = {
      id: Date.now(),
      nameMm: newGoalName,
      nameEn: newGoalName,
      current: parseFloat(newGoalCurrent) || 0,
      target: parseFloat(newGoalTarget),
      icon: newGoalIcon,
      desc: "Custom User Goal"
    };

    setGoals([...goals, newGoalObj]);

    // Update business profile target values for Reports View
    if (setBusinessProfile) {
      setBusinessProfile(prev => ({
        ...prev,
        targetValue: parseFloat(newGoalTarget)
      }));
    }

    setNewGoalName('');
    setNewGoalTarget('');
    setNewGoalCurrent('');
    setShowGoalForm(false);
  };

  const handleAddBudget = (e) => {
    e.preventDefault();
    if (!newBudgetName.trim() || !newBudgetTarget) return;

    const newBudgetObj = {
      id: Date.now(),
      nameMm: newBudgetName,
      nameEn: newBudgetName,
      spent: parseFloat(newBudgetSpent) || 0,
      limit: parseFloat(newBudgetTarget)
    };

    setBudgets([...budgets, newBudgetObj]);
    setNewBudgetName('');
    setNewBudgetTarget('');
    setNewBudgetSpent('');
    setShowBudgetForm(false);
  };

  // Render Category Icon Helper
  const renderGoalIcon = (iconName) => {
    switch (iconName) {
      case 'Shield': return <Shield size={20} />;
      case 'Compass': return <Compass size={20} />;
      case 'Landmark':
      default:
        return <Landmark size={20} />;
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* HEADER */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t.goalsTitle}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {language === 'mm' ? "လုပ်ငန်း၏ ရည်မှန်းချက်များနှင့် ဘတ်ဂျက်ထိန်းချုပ်မှုများ" : "Define long-term commitments and category spending caps"}
          </p>
        </div>
      </header>

      {/* TWO COLUMNS: GOALS vs BUDGETS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', alignItems: 'start' }}>
        
        {/* Left Column: My Goals */}
        <section className="space-y-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t.activeGoals}
            </h3>
            <button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Plus size={12} /> {t.addGoalBtn}
            </button>
          </div>

          {/* New Goal Form Inline Popover */}
          {showGoalForm && (
            <form onSubmit={handleAddGoal} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--accent)',
              borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px'
            }} className="animate-fade-in">
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "ပန်းတိုင်အသစ် ဖြည့်စွက်ရန်" : "Add Goal Detail"}
              </h4>
              <input
                type="text" required placeholder={language === 'mm' ? "ပန်းတိုင် အမည် (ဥပမာ - ရေခဲသေတ္တာသစ်)" : "Goal Name (e.g. New Truck)"}
                value={newGoalName} onChange={e => setNewGoalName(e.target.value)}
                style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number" required placeholder={language === 'mm' ? "ပန်းတိုင် ပမာဏ (MMK)" : "Target Amount (MMK)"}
                  value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)}
                  className="font-number"
                  style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12px', outline: 'none' }}
                />
                <input
                  type="number" placeholder={language === 'mm' ? "လက်ရှိ စုဆောင်းငွေ (MMK)" : "Current Amount (MMK)"}
                  value={newGoalCurrent} onChange={e => setNewGoalCurrent(e.target.value)}
                  className="font-number"
                  style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowGoalForm(false)} style={{ background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 8px' }}>
                  {t.cancel}
                </button>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, padding: '6px 12px', cursor: 'pointer' }}>
                  {t.add}
                </button>
              </div>
            </form>
          )}

          {/* Goals Stacked List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {goals.map(goal => {
              const ratio = Math.min(1, goal.current / goal.target);
              return (
                <div 
                  key={goal.id}
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                    borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '12px',
                        background: 'var(--accent-soft)', color: 'var(--accent)',
                        display: 'flex', alignItems: 'center', justifyContext: 'center', flexShrink: 0,
                        padding: '8px'
                      }}>
                        {renderGoalIcon(goal.icon)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                          {language === 'mm' ? goal.nameMm : goal.nameEn}
                        </h4>
                        <p style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{goal.desc}</p>
                      </div>
                    </div>
                    {ratio >= 1 && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(92, 123, 107, 0.1)', color: 'var(--positive)',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700
                      }}>
                        <Check size={12} /> Completed
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {goal.current.toLocaleString()} MMK
                      </span>
                      <span className="font-number" style={{ color: 'var(--text-secondary)' }}>
                        {t.targetLabel}: {goal.target.toLocaleString()} MMK
                      </span>
                    </div>
                    {/* Custom progress track */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-track)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${ratio * 100}%`, height: '100%',
                        background: 'linear-gradient(90deg, var(--accent) 0%, rgba(184, 92, 142, 0.7) 100%)'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Budgets */}
        <section className="space-y-4">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {t.expenseBudgets}
            </h3>
            <button 
              onClick={() => setShowBudgetForm(!showBudgetForm)}
              style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                padding: '6px 12px', borderRadius: '6px', fontSize: '11px',
                fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <Plus size={12} /> {t.addBudgetBtn}
            </button>
          </div>

          {/* New Budget Form Inline Popover */}
          {showBudgetForm && (
            <form onSubmit={handleAddBudget} style={{
              background: 'var(--bg-surface)', border: '1px solid var(--accent)',
              borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px'
            }} className="animate-fade-in">
              <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "ဘတ်ဂျက်အသစ် ဖြည့်စွက်ရန်" : "Add Budget Limit"}
              </h4>
              <input
                type="text" required placeholder={language === 'mm' ? "ဘတ်ဂျက် အမျိုးအစား (ဥပမာ - ကုန်ပစ္စည်းစရိတ်)" : "Category Name (e.g. Fuel)"}
                value={newBudgetName} onChange={e => setNewBudgetName(e.target.value)}
                style={{ height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12px', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="number" required placeholder={language === 'mm' ? "ဘတ်ဂျက် ကန့်သတ်ချက် (MMK)" : "Budget Limit (MMK)"}
                  value={newBudgetTarget} onChange={e => setNewBudgetTarget(e.target.value)}
                  className="font-number"
                  style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12px', outline: 'none' }}
                />
                <input
                  type="number" placeholder={language === 'mm' ? "လက်ရှိ သုံးစွဲပြီးငွေ (MMK)" : "Spent So Far (MMK)"}
                  value={newBudgetSpent} onChange={e => setNewBudgetSpent(e.target.value)}
                  className="font-number"
                  style={{ flex: 1, height: '36px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--border-default)', fontSize: '12px', outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-end', marginTop: '4px' }}>
                <button type="button" onClick={() => setShowBudgetForm(false)} style={{ background: 'transparent', border: 'none', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', padding: '0 8px' }}>
                  {t.cancel}
                </button>
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 600, padding: '6px 12px', cursor: 'pointer' }}>
                  {t.add}
                </button>
              </div>
            </form>
          )}

          {/* Budget Stacked List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {budgets.map(budget => {
              const ratio = Math.min(1.2, budget.spent / budget.limit);
              const isOverLimit = budget.spent > budget.limit;
              const isNearingLimit = ratio >= 0.8; // Turn terracotta if >= 80%

              return (
                <div 
                  key={budget.id}
                  style={{
                    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                    borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {language === 'mm' ? budget.nameMm : budget.nameEn}
                    </h4>
                    {isOverLimit && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        background: 'rgba(163, 61, 92, 0.1)', color: 'var(--critical)',
                        padding: '4px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 700
                      }}>
                        <AlertTriangle size={12} /> Limit Exceeded
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span className="font-number" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {budget.spent.toLocaleString()} / {budget.limit.toLocaleString()} MMK
                      </span>
                      <span className="mono" style={{ fontSize: '10px', color: isNearingLimit ? 'var(--caution)' : 'var(--text-secondary)' }}>
                        {t.remainingLabel}: {Math.max(0, budget.limit - budget.spent).toLocaleString()} MMK
                      </span>
                    </div>
                    {/* Progress bar transitioning to terracotta past 80% */}
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-track)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, ratio * 100)}%`, height: '100%',
                        background: isNearingLimit ? 'var(--caution)' : 'var(--accent)',
                        transition: 'background-color 0.3s'
                      }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>

    </div>
  );
}
