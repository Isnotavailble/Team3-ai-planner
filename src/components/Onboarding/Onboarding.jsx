import React, { useState } from 'react';
import { FileUp, ChevronRight, ChevronLeft, Sparkles, Check, Plus, Trash2 } from 'lucide-react';
import { translations } from '../../data/translations';
import { importSalesFile } from '../../utils/salesImporter';

export default function Onboarding({ onImportComplete, language = 'mm' }) {
  const t = translations[language] || translations['en']; // Fallback

  // Form Wizard Steps (0 to 10)
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [focusField, setFocusField] = useState(null);

  // Profile Form States
  const [product, setProduct] = useState('');
  // Removed POS question per requirement
  // const [hasPOS, setHasPOS] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState([]); // no auto-select
  const [salesData, setSalesData] = useState({ daily: '', weekly: '', monthly: '', yearly: '' }); // no auto-fill
  const [expensesData, setExpensesData] = useState({ daily: '', weekly: '', monthly: '', yearly: '' }); // no auto-fill
  const [rivals, setRivals] = useState([]);
  const [newRivalName, setNewRivalName] = useState('');
  const [newRivalPricing, setNewRivalPricing] = useState(''); // no auto-select

  const OptionCard = ({ selected, onClick, children, style }) => (
    <button
      type="button"
      onClick={onClick}
      className="w-full border text-left cursor-pointer transition-all"
      style={{
        background: selected ? 'var(--accent-soft)' : 'transparent',
        border: selected ? '2px solid var(--accent)' : '1.5px solid var(--border-default)',
        borderRadius: '16px',
        padding: '14px 16px',
        color: selected ? 'var(--accent)' : 'var(--text-primary)',
        fontWeight: selected ? 600 : 500,
        ...style
      }}
    >
      {children}
    </button>
  );

  const handleAddCompetitor = () => {
    if (newRivalName.trim()) {
      setRivals([...rivals, {
        id: Date.now(),
        name: newRivalName.trim(),
        pricing: newRivalPricing || 'Same price as our product',
        audience: 'SMB Retailers'
      }]);
      setNewRivalName('');
    }
  };

  // New Data Gaps states
  const [customers, setCustomers] = useState([]);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');

  const [productsList, setProductsList] = useState([]);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierProducts, setNewSupplierProducts] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  const [salesHistory, setSalesHistory] = useState([]);
  const [filePreview, setFilePreview] = useState(null);

  // Mask contact for privacy
  const maskContact = (contact) => {
    if (!contact) return '';
    if (contact.includes('@')) {
      const [name, domain] = contact.split('@');
      return `${name[0]}***@${domain}`;
    }
    // Assume phone number
    if (contact.length > 4) {
      return `***-***-${contact.slice(-4)}`;
    }
    return '***';
  };

  const handleAddCustomer = () => {
    if (newCustomerName) {
      setCustomers([...customers, { id: Date.now(), type: 'customer', name: newCustomerName, contact: newCustomerContact }]);
      setNewCustomerName('');
      setNewCustomerContact('');
    }
  };

  const handleAddProductList = () => {
    if (newProductName && newProductPrice) {
      setProductsList([...productsList, { id: Date.now(), type: 'product', name: newProductName, price: parseFloat(newProductPrice) || 0 }]);
      setNewProductName('');
      setNewProductPrice('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplierName) {
      setSuppliers([...suppliers, {
        id: Date.now(),
        type: 'supplier',
        name: newSupplierName,
        products: newSupplierProducts.split(',').map(s => s.trim()).filter(Boolean),
        contactMasked: maskContact(newSupplierContact)
      }]);
      setNewSupplierName('');
      setNewSupplierProducts('');
      setNewSupplierContact('');
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await importSalesFile(file);
      setSalesHistory(data);
      setFilePreview(data.slice(0, 5)); // show first 5
    } catch (err) {
      alert(err.message);
    }
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0 && !product.trim()) newErrors.product = language === 'mm' ? "ထုတ်ကုန်အမည် ဖြည့်သွင်းရန် လိုအပ်ပါသည်" : "Product name is required";
    if (step === 1 && selectedPeriods.length === 0) newErrors.periods = language === 'mm' ? "အနည်းဆုံးတစ်ခု ရွေးချယ်ပါ" : "Select at least one period";
    if (step === 2) {
      selectedPeriods.forEach(p => {
        const val = salesData[p.toLowerCase()];
        if (!val || isNaN(val) || parseFloat(val) <= 0) newErrors[p] = "Enter valid amount";
      });
    }
    if (step === 3) {
      selectedPeriods.forEach(p => {
        const val = expensesData[p.toLowerCase()];
        // expenses can be 0 but must be a number
        if (val === '' || val === null || val === undefined || isNaN(val) || parseFloat(val) < 0) {
          newErrors[`exp_${p}`] = "Enter valid expense";
        }
      });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 9 steps total (0 to 8) — POS step removed
  const maxSteps = 9;

  const handleNext = () => {
    if (!validateStep()) return;

    if (step === maxSteps - 1) {
      finishOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    setErrors({});
    if (step === maxSteps - 1) finishOnboarding();
    else setStep(step + 1);
  };

  const finishOnboarding = () => {
    const expensesByPeriod = {};
    selectedPeriods.forEach(p => {
      expensesByPeriod[p.toLowerCase()] = parseFloat(expensesData[p.toLowerCase()]) || 0;
    });
    // Keep a numeric monthly expense for compatibility across the app
    const derivedMonthlyExpense =
      expensesByPeriod.monthly ??
      (expensesByPeriod.daily ? expensesByPeriod.daily * 30 : undefined) ??
      (expensesByPeriod.weekly ? expensesByPeriod.weekly * 4 : undefined) ??
      (expensesByPeriod.yearly ? Math.round(expensesByPeriod.yearly / 12) : undefined) ??
      0;

    const profile = {
      product,
      sales: {},
      expenses: derivedMonthlyExpense,
      expensesByPeriod,
      rivals: rivals,
      targetScenario: 'Competitor Price Cut',
      expectedResult: 'Less Profit',
      customers,
      products: productsList,
      suppliers,
      salesHistory,
      thresholds: { inventoryLow: 10 }
    };
    selectedPeriods.forEach(p => {
      profile.sales[p.toLowerCase()] = parseFloat(salesData[p.toLowerCase()]) || 0;
    });

    onImportComplete(profile);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <div className="animate-fade-in" style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px',
      background: 'var(--bg-base)'
    }}>
      <div style={{
        width: '100%', maxWidth: '720px', display: 'flex', flexDirection: 'column', maxHeight: '850px',
        overflow: 'hidden', borderRadius: '24px', boxShadow: '0 12px 48px rgba(0,0,0,0.06)',
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)'
      }}>

        <div className="flex flex-col h-full overflow-hidden">
          <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="flex items-center gap-1.5">
                <span className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  STEP {step + 1} OF {maxSteps}
                </span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {Math.round(((step + 1) / maxSteps) * 100)}%
              </span>
            </div>
            <div style={{ width: '100%', height: '4px', background: 'var(--bg-track)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${((step + 1) / maxSteps) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease-out' }} />
            </div>
          </div>

          <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-start items-center">
            <div style={{ maxWidth: '480px', width: '100%' }}>

              {step === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "သင့်အရောင်းထုတ်ကုန်အမည်က ဘာလဲ?" : "What product do you sell?"}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "အဓိကရောင်းချသော ထုတ်ကုန်အမျိုးအစားကို ဖော်ပြပေးပါ။" : "Select or type your primary selling category."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {['Clothing Apparel', 'Grocery Staples', 'Electronics', 'Coffee & Foods'].map(item => (
                      <OptionCard
                        key={item}
                        selected={product === item}
                        onClick={() => { setProduct(item); setErrors({}); }}
                        style={{ textAlign: 'center', fontSize: '14px' }}
                      >
                        {item}
                      </OptionCard>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "သို့မဟုတ် ကိုယ်တိုင်ရေးသွင်းရန်" : "Or type custom category:"}
                    </label>
                    <input type="text" value={product} onChange={(e) => { setProduct(e.target.value); setErrors({}); }}
                      placeholder="e.g. Handmade Crafts"
                      style={{
                        width: '100%',
                        height: '44px',
                        padding: '0 14px',
                        borderRadius: '10px',
                        border: focusField === 'product' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                        background: 'transparent',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        fontSize: '14px',
                        transition: 'border-color 0.15s ease'
                      }}
                      onFocus={() => setFocusField('product')}
                      onBlur={() => setFocusField(null)}
                    />
                    {errors.product && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors.product}</p>}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "ဘယ်အချိန်ကာလအထိ အရောင်းမှတ်တမ်းများကို သိမ်းဆည်းထားပါသလဲ?" : "Which sales periods do you record?"}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(period => {
                      const isSelected = selectedPeriods.includes(period);
                      return (
                        <OptionCard
                          key={period}
                          selected={isSelected}
                          onClick={() => {
                            setSelectedPeriods(prev => prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]);
                            setErrors({});
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isSelected ? (
                              <Check size={20} color="var(--accent)" />
                            ) : (
                              <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid var(--border-default)' }} />
                            )}
                            <span style={{ fontWeight: 600, fontSize: '15px' }}>{period}</span>
                          </div>
                        </OptionCard>
                      );
                    })}
                  </div>
                  {errors.periods && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors.periods}</p>}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "အထက်ပါ ကာလအတွက် အ average အရောင်းပမာဏကို ထည့်ပါ (MMK)" : "Enter average sales for each selected period (MMK)"}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    {selectedPeriods.map(period => (
                      <div key={period} className="flex flex-col gap-2">
                        <label className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          Average {period} Sales (MMK)
                        </label>
                        <input type="number" min="0" step="1" required value={salesData[period.toLowerCase()]} onChange={(e) => { setSalesData(prev => ({ ...prev, [period.toLowerCase()]: e.target.value })); setErrors({}); }}
                          placeholder="e.g. 5000" className="font-number"
                          style={{
                            width: '100%',
                            height: '44px',
                            padding: '0 14px',
                            borderRadius: '10px',
                            border: focusField === `sales_${period}` ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '15px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField(`sales_${period}`)}
                          onBlur={() => setFocusField(null)}
                        />
                        {errors[period] && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors[period]}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm'
                        ? "ရွေးထားသော ကာလအတွက် အသုံးစရိတ် (MMK) ကို ထည့်ပါ"
                        : "Enter expenses for each selected period (MMK)"}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    {selectedPeriods.map(period => (
                      <div key={period} className="flex flex-col gap-2">
                        <label className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          {language === 'mm'
                            ? `${period} အသုံးစရိတ် (MMK)`
                            : `Average ${period} Expenses (MMK)`}
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          value={expensesData[period.toLowerCase()]}
                          onChange={(e) => {
                            setExpensesData(prev => ({ ...prev, [period.toLowerCase()]: e.target.value }));
                            setErrors({});
                          }}
                          placeholder="e.g. 3000"
                          className="font-number"
                          style={{
                            width: '100%',
                            height: '44px',
                            padding: '0 14px',
                            borderRadius: '10px',
                            border: focusField === `exp_${period}` ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '15px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField(`exp_${period}`)}
                          onBlur={() => setFocusField(null)}
                        />
                        {errors[`exp_${period}`] && (
                          <p style={{ color: 'var(--critical)', fontSize: '12px' }}>
                            {errors[`exp_${period}`]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "ပြိုင်ဘက်များကို ထည့်သွင်းရန်" : "Add Competitors"}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ပြိုင်ဘက်ဆိုင်များ၏ အမည်နှင့် စျေးနှုန်းမဟာဗျူဟာကို ထည့်ပါ (စိတ်ကြိုက်အချက်အလက်)" : "Enter competitor names and pricing strategies. Optional."}
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleAddCompetitor(); }} className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'transparent', border: '1.5px solid var(--border-default)' }}>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "ပြိုင်ဘက်ဆိုင် အမည်" : "Competitor Name"}
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Shop B"
                          value={newRivalName}
                          onChange={e => setNewRivalName(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'rivalName' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('rivalName')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "စျေးနှုန်းမဟာဗျူဟာ" : "Pricing Strategy"}
                        </label>
                        <select
                          value={newRivalPricing}
                          onChange={e => setNewRivalPricing(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 10px',
                            borderRadius: '8px',
                            border: focusField === 'rivalPricing' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '13px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('rivalPricing')}
                          onBlur={() => setFocusField(null)}
                        >
                          <option value="" disabled>{language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select one'}</option>
                          <option value="Same price as our product">{language === 'mm' ? 'ကျွန်ုပ်တို့နှင့် စျေးနှုန်းတူ' : 'Same price as our product'}</option>
                          <option value="Lower price than our product">{language === 'mm' ? 'ကျွန်ုပ်တို့ထက် စျေးသက်သာ' : 'Lower price than our product'}</option>
                          <option value="Higher price than our product">{language === 'mm' ? 'ကျွန်ုပ်တို့ထက် စျေးပိုကြီး' : 'Higher price than our product'}</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          marginTop: '4px',
                          transition: 'opacity 0.15s ease'
                        }}
                      >
                        <Plus size={16} />
                        <span>{language === 'mm' ? "ပြိုင်ဘက်ဆိုင် ထည့်မည်" : "Add Competitor"}</span>
                      </button>
                    </form>

                    {rivals.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto">
                        {rivals.map(r => (
                          <div key={r.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'transparent', border: '1px solid var(--border-default)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {language === 'mm' ? (
                                  r.pricing.includes('Lower') ? 'ကျွန်ုပ်တို့ထက် စျေးသက်သာ' : r.pricing.includes('Higher') ? 'ကျွန်ုပ်တို့ထက် စျေးပိုကြီး' : 'စျေးတူ'
                                ) : r.pricing}
                              </span>
                            </div>
                            <button
                              onClick={() => setRivals(rivals.filter(x => x.id !== r.id))}
                              style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "သင့်ဖောက်သည်အမည်များကို ထည့်ပါ (10-30)" : "Enter your customers (10-30)"}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Optional. Used for AI churn detection.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleAddCustomer(); }} className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'transparent', border: '1.5px solid var(--border-default)' }}>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Mg Mg"
                          value={newCustomerName}
                          onChange={e => setNewCustomerName(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'customerName' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('customerName')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 09-xxxxxxxxx"
                          value={newCustomerContact}
                          onChange={e => setNewCustomerContact(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'customerContact' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('customerContact')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Customer</span>
                      </button>
                    </form>

                    {customers.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto">
                        {customers.map(c => (
                          <div key={c.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'transparent', border: '1px solid var(--border-default)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                              {c.contact && <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{c.contact}</span>}
                            </div>
                            <button onClick={() => setCustomers(customers.filter(x => x.id !== c.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 6 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "ထုတ်ကုန်/မီနူးစာရင်း (5-10) ကို ထည့်ပါ" : "Enter your product/menu items (5-10)"}
                    </h2>
                  </div>
                  <div className="flex flex-col gap-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleAddProductList(); }} className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'transparent', border: '1.5px solid var(--border-default)' }}>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Product Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Coffee Latte"
                          value={newProductName}
                          onChange={e => setNewProductName(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'prodName' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('prodName')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Price (MMK)</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          placeholder="e.g. 3500"
                          value={newProductPrice}
                          onChange={e => setNewProductPrice(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'prodPrice' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('prodPrice')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Product</span>
                      </button>
                    </form>

                    {productsList.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto">
                        {productsList.map(p => (
                          <div key={p.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'transparent', border: '1px solid var(--border-default)' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                            <span className="font-number text-xs" style={{ color: 'var(--text-secondary)' }}>{p.price} MMK</span>
                            <button onClick={() => setProductsList(productsList.filter(x => x.id !== p.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "ကုန်ပစ္စည်းသွင်းသူများ (3-8) ထည့်ပါ" : "Enter your suppliers (3-8)"}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Contact details will be securely masked.</p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleAddSupplier(); }} className="flex flex-col gap-3 p-4 rounded-xl" style={{ background: 'transparent', border: '1.5px solid var(--border-default)' }}>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Supplier Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. ABC Wholesale"
                          value={newSupplierName}
                          onChange={e => setNewSupplierName(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'suppName' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('suppName')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Products Supplied (comma separated)</label>
                        <input
                          type="text"
                          placeholder="e.g. Coffee Beans, Cups"
                          value={newSupplierProducts}
                          onChange={e => setNewSupplierProducts(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'suppProds' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('suppProds')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Contact Email/Phone</label>
                        <input
                          type="text"
                          placeholder="e.g. contact@abc.com"
                          value={newSupplierContact}
                          onChange={e => setNewSupplierContact(e.target.value)}
                          style={{
                            width: '100%',
                            height: '42px',
                            padding: '0 12px',
                            borderRadius: '8px',
                            border: focusField === 'suppCont' ? '1.5px solid var(--accent)' : '1.5px solid var(--border-default)',
                            background: 'transparent',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            fontSize: '14px',
                            transition: 'border-color 0.15s ease'
                          }}
                          onFocus={() => setFocusField('suppCont')}
                          onBlur={() => setFocusField(null)}
                        />
                      </div>
                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          height: '42px',
                          background: 'var(--accent)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          cursor: 'pointer',
                          marginTop: '4px'
                        }}
                      >
                        <Plus size={16} />
                        <span>Add Supplier</span>
                      </button>
                    </form>

                    {suppliers.length > 0 && (
                      <div className="flex flex-col gap-2 mt-2 max-h-40 overflow-y-auto">
                        {suppliers.map(s => (
                          <div key={s.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'transparent', border: '1px solid var(--border-default)' }}>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</div>
                              {s.products && s.products.length > 0 && (
                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Supplies: {s.products.join(', ')}</div>
                              )}
                              <div className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>{s.contactMasked}</div>
                            </div>
                            <button onClick={() => setSuppliers(suppliers.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      {language === 'mm' ? "အရောင်းမှတ်တမ်းဖိုင် အပ်လုဒ်လုပ်ပါ" : "Bulk Sales History Import"}
                    </h2>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Upload an Excel or CSV file (up to 30 days) to power AI forecasting.</p>
                  </div>

                  <div style={{ padding: '32px 20px', border: '2px dashed var(--border-default)', borderRadius: '16px', textAlign: 'center', background: 'transparent' }}>
                    <FileUp size={28} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
                    <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleBulkUpload} style={{ display: 'none' }} id="file-upload" />
                    <label htmlFor="file-upload" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                      {language === 'mm' ? "ဖိုင်ရွေးချယ်ရန်" : "Select File"}
                    </label>
                  </div>

                  {filePreview && (
                    <div className="mt-4 p-4 rounded-xl" style={{ background: 'transparent', border: '1px solid var(--border-default)' }}>
                      <h4 style={{ fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>Preview (first 5 rows)</h4>
                      <div className="flex flex-col gap-1">
                        {filePreview.map((row, i) => (
                          <div key={i} className="flex justify-between text-xs mono text-txt-secondary">
                            <span>{row.date}</span>
                            <span>Sales: {row.sales}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-default)', background: 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={handleBack} disabled={step === 0}
              className="flex items-center gap-1 bg-transparent hover:bg-surface-hover/80 text-txt-secondary disabled:opacity-30 disabled:cursor-not-allowed border-none font-semibold text-sm py-2 px-3 rounded-lg cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft size={16} /> {t.back}
            </button>

            <div className="flex gap-3">
              {[4, 5, 6, 7, 8].includes(step) && (
                <button onClick={handleSkip}
                  style={{ background: 'transparent', border: '1px solid var(--border-default)', padding: '0 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}
                >
                  {language === 'mm' ? "ကျော်သွားမည်" : "Skip"}
                </button>
              )}

              <button onClick={handleNext}
                className="flex items-center gap-1 bg-transparent hover:bg-surface-hover/80 text-txt-secondary border-none font-semibold text-sm py-2 px-3 rounded-lg cursor-pointer"
                style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {step === maxSteps - 1 ? (language === 'mm' ? "လုပ်ငန်းစခရင်သို့ သွားမည်" : "Build Workspace") : t.next}
                {step !== maxSteps - 1 && <ChevronRight size={16} />}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
