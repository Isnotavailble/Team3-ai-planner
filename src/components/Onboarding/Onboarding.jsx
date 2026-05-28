import React, { useState } from 'react';
import { FileUp, ChevronRight, ChevronLeft, Sparkles, Check, Plus, Trash2 } from 'lucide-react';
import { translations } from '../../data/translations';
import { importSalesFile } from '../../utils/salesImporter';

export default function Onboarding({ onImportComplete, language = 'mm' }) {
  const t = translations[language] || translations['en']; // Fallback
  
  // Form Wizard Steps (0 to 10)
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  // Profile Form States
  const [product, setProduct] = useState('');
  const [hasPOS, setHasPOS] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState(['Monthly']);
  const [salesData, setSalesData] = useState({ daily: '', weekly: '', monthly: '12000', yearly: '' });
  const [expenses, setExpenses] = useState('8000');
  const [competitorInput, setCompetitorInput] = useState('');
  const [rivalsList, setRivalsList] = useState([]);
  const [rivalDetails, setRivalDetails] = useState({});
  const [currentRivalIdx, setCurrentRivalIdx] = useState(0);

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
    if (step === 2 && selectedPeriods.length === 0) newErrors.periods = language === 'mm' ? "အနည်းဆုံးတစ်ခု ရွေးချယ်ပါ" : "Select at least one period";
    if (step === 3) {
      selectedPeriods.forEach(p => {
        const val = salesData[p.toLowerCase()];
        if (!val || isNaN(val) || parseFloat(val) <= 0) newErrors[p] = "Enter valid amount";
      });
    }
    if (step === 4 && (!expenses || isNaN(expenses) || parseFloat(expenses) < 0)) {
      newErrors.expenses = "Enter valid expense";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 11 steps total (0 to 10)
  const maxSteps = 11;

  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 5) {
      if (competitorInput.trim() && competitorInput.toLowerCase() !== 'none') {
        const list = competitorInput.split(',').map(n => n.trim()).filter(Boolean);
        setRivalsList(list);
        const details = {};
        list.forEach(name => { details[name] = { pricing: 'Market Matcher (Same price)', audience: 'SMB Retailers' }; });
        setRivalDetails(details);
        setCurrentRivalIdx(0);
        setStep(6);
      } else {
        setRivalsList([]);
        setStep(7); // Skip to customer list
      }
    } else if (step === 6) {
      if (currentRivalIdx + 1 < rivalsList.length) {
        setCurrentRivalIdx(currentRivalIdx + 1);
      } else {
        setStep(7); // Go to customers
      }
    } else if (step === 10) {
      finishOnboarding();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    setErrors({});
    if (step === 10) finishOnboarding();
    else setStep(step + 1);
  };

  const finishOnboarding = () => {
    const profile = {
      product,
      hasPOS,
      sales: {},
      expenses: parseFloat(expenses) || 0,
      rivals: rivalsList.map(name => ({
        name,
        pricing: rivalDetails[name]?.pricing || 'Market Matcher',
        audience: rivalDetails[name]?.audience || 'SMB Retailers'
      })),
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
    if (step === 7) {
      if (rivalsList.length > 0) {
        setCurrentRivalIdx(rivalsList.length - 1);
        setStep(6);
      } else {
        setStep(5);
      }
    } else if (step === 6) {
      if (currentRivalIdx > 0) setCurrentRivalIdx(currentRivalIdx - 1);
      else setStep(5);
    } else {
      setStep(step - 1);
    }
  };

  return (
    <div className="animate-fade-in light-mesh-bg" style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="glass-card flex flex-col" style={{
        width: '100%', maxWidth: '720px', flex: 1, maxHeight: '800px',
        overflow: 'hidden', borderRadius: '24px', boxShadow: '0 12px 48px rgba(0,0,0,0.1)'
      }}>
        
          <div className="flex flex-col h-full overflow-hidden">
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div className="flex items-center gap-1.5">
                  <Sparkles size={16} className="text-txt-primary opacity-80" style={{ color: 'var(--accent)' }} />
                  <span className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    {language === 'mm' ? "အဆင့်" : "STEP"} {step + 1} {t.outOf || "OF"} {maxSteps}
                  </span>
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  {Math.round(((step + 1) / maxSteps) * 100)}%
                </span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${((step + 1) / maxSteps) * 100}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.3s ease-out' }} />
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-center items-center">
              <div style={{ maxWidth: '460px', width: '100%' }}>
                
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
                        <button key={item} onClick={() => { setProduct(item); setErrors({}); }}
                          className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${product === item ? 'border-border-dark font-semibold' : 'border-border-default'}`}
                          style={{
                            background: product === item ? 'var(--accent-soft)' : 'var(--bg-surface)',
                            borderColor: product === item ? 'var(--accent)' : 'var(--border-default)',
                            color: product === item ? 'var(--accent)' : 'var(--text-primary)'
                          }}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                        {language === 'mm' ? "သို့မဟုတ် ကိုယ်တိုင်ရေးသွင်းရန်" : "Or type custom category:"}
                      </label>
                      <input type="text" value={product} onChange={(e) => { setProduct(e.target.value); setErrors({}); }}
                        placeholder="e.g. Handmade Crafts"
                        style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '14px' }}
                      />
                      {errors.product && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors.product}</p>}
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "POS စနစ်ကို အသုံးပြုပါသလား?" : "Do you use a Point-of-Sale system?"}
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {language === 'mm' ? "အရောင်းမှတ်တမ်းများအတွက် စက် သို့မဟုတ် တက်ဘလက် သုံးစွဲမှုကို ဖော်ပြပါ။" : "Choose whether you run software sales tracking."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setHasPOS(true)}
                        className="p-6 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-3"
                        style={{ background: hasPOS ? 'var(--accent-soft)' : 'var(--bg-surface)', borderColor: hasPOS ? 'var(--accent)' : 'var(--border-default)', color: hasPOS ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        <span style={{ fontSize: '28px' }}>📊</span>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>{language === 'mm' ? "အသုံးပြုပါသည်" : "Yes, I use POS"}</span>
                      </button>
                      <button onClick={() => setHasPOS(false)}
                        className="p-6 rounded-2xl border text-center cursor-pointer transition-all flex flex-col items-center gap-3"
                        style={{ background: !hasPOS ? 'var(--accent-soft)' : 'var(--bg-surface)', borderColor: !hasPOS ? 'var(--accent)' : 'var(--border-default)', color: !hasPOS ? 'var(--accent)' : 'var(--text-primary)' }}
                      >
                        <span style={{ fontSize: '28px' }}>📝</span>
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>{language === 'mm' ? "မသုံးပါ" : "No, manual ledger"}</span>
                      </button>
                    </div>
                  </div>
                )}

                {step === 2 && (
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
                          <button key={period} onClick={() => { 
                            setSelectedPeriods(prev => prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]); 
                            setErrors({}); 
                          }}
                            className="w-full flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all text-left"
                            style={{ background: isSelected ? 'var(--accent-soft)' : 'var(--bg-surface)', borderColor: isSelected ? 'var(--accent)' : 'var(--border-default)', color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {isSelected ? <Check size={20} color="var(--accent)" /> : <div style={{ width: '20px', height: '20px', borderRadius: '4px', border: '2px solid var(--border-default)' }} />}
                              <span style={{ fontWeight: 600, fontSize: '15px' }}>{period}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.periods && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors.periods}</p>}
                  </div>
                )}

                {step === 3 && (
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
                          <input type="number" value={salesData[period.toLowerCase()]} onChange={(e) => { setSalesData(prev => ({...prev, [period.toLowerCase()]: e.target.value})); setErrors({}); }}
                            placeholder="e.g. 5000" className="font-number"
                            style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '15px' }}
                          />
                          {errors[period] && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors[period]}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "လစဉ် အသုံးစရိတ် (MMK) ကို ထည့်ပါ" : "Enter your monthly expenses (MMK)"}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="mono" style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Monthly Expenses</label>
                      <input type="number" value={expenses} onChange={(e) => { setExpenses(e.target.value); setErrors({}); }}
                        placeholder="e.g. 3000" className="font-number"
                        style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '15px' }}
                      />
                      {errors.expenses && <p style={{ color: 'var(--critical)', fontSize: '12px' }}>{errors.expenses}</p>}
                    </div>
                  </div>
                )}

                {step === 5 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "ပြိုင်ဘက်များရှိပါသလား?" : "Do you have competitors?"}
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {language === 'mm' ? "ရှိပါက အမည်များကို ကော်မာခံ၍ ရေးပါ" : "Enter names separated by commas. Leave blank to skip."}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input type="text" value={competitorInput} onChange={(e) => setCompetitorInput(e.target.value)}
                        placeholder="e.g. Shop A, Shop B"
                        style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '14px' }}
                      />
                    </div>
                  </div>
                )}

                {step === 6 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                        {language === 'mm' ? `ပြိုင်ဘက် "${rivalsList[currentRivalIdx]}" ၏ အချက်အလက်များ` : `Configure "${rivalsList[currentRivalIdx]}"`}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Pricing Strategy</label>
                        <div className="grid grid-cols-1 gap-2">
                          {['Discount Leader (10% cheaper)', 'Market Matcher (Same price)', 'Premium Brand (15% more expensive)'].map(opt => (
                            <button key={opt} onClick={() => {
                                const r = rivalsList[currentRivalIdx];
                                setRivalDetails(prev => ({...prev, [r]: {...prev[r], pricing: opt}}));
                              }}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition-all font-semibold ${rivalDetails[rivalsList[currentRivalIdx]]?.pricing === opt ? 'border-border-dark' : 'border-border-default'}`}
                              style={{ background: rivalDetails[rivalsList[currentRivalIdx]]?.pricing === opt ? 'var(--accent-soft)' : 'var(--bg-surface)', color: 'var(--text-primary)' }}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* NEW STEPS */}
                {step === 7 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "သင့်ဖောက်သည်အမည်များကို ထည့်ပါ (10-30)" : "Enter your customers (10-30)"}
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Optional. Used for AI churn detection.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Name" value={newCustomerName} onChange={e=>setNewCustomerName(e.target.value)} style={{flex:1, height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none'}} />
                        <input type="text" placeholder="Contact (opt)" value={newCustomerContact} onChange={e=>setNewCustomerContact(e.target.value)} style={{flex:1, height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none'}} />
                        <button onClick={handleAddCustomer} style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:'8px', padding:'0 16px', fontWeight:600}}><Plus size={16}/></button>
                      </div>
                      <div className="flex flex-col gap-1 mt-4 max-h-40 overflow-y-auto">
                        {customers.map(c => (
                          <div key={c.id} className="flex justify-between items-center p-2 rounded bg-surface-elevated border border-border-default">
                            <span style={{fontSize:'13px', fontWeight:600}}>{c.name}</span>
                            <button onClick={()=>setCustomers(customers.filter(x=>x.id!==c.id))} style={{background:'none', border:'none', color:'var(--critical)', cursor:'pointer'}}><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 8 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "ထုတ်ကုန်/မီနူးစာရင်း (5-10) ကို ထည့်ပါ" : "Enter your product/menu items (5-10)"}
                      </h2>
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Product Name" value={newProductName} onChange={e=>setNewProductName(e.target.value)} style={{flex:2, height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none'}} />
                        <input type="number" placeholder="Price (MMK)" value={newProductPrice} onChange={e=>setNewProductPrice(e.target.value)} style={{flex:1, height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none'}} />
                        <button onClick={handleAddProductList} style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:'8px', padding:'0 16px', fontWeight:600}}><Plus size={16}/></button>
                      </div>
                      <div className="flex flex-col gap-1 mt-4 max-h-40 overflow-y-auto">
                        {productsList.map(p => (
                          <div key={p.id} className="flex justify-between items-center p-2 rounded bg-surface-elevated border border-border-default">
                            <span style={{fontSize:'13px', fontWeight:600}}>{p.name}</span>
                            <span className="font-number text-xs" style={{color:'var(--text-secondary)'}}>{p.price} MMK</span>
                            <button onClick={()=>setProductsList(productsList.filter(x=>x.id!==p.id))} style={{background:'none', border:'none', color:'var(--critical)', cursor:'pointer'}}><Trash2 size={14}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 9 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "ကုန်ပစ္စည်းသွင်းသူများ (3-8) ထည့်ပါ" : "Enter your suppliers (3-8)"}
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Contact details will be securely masked.</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <input type="text" placeholder="Supplier Name" value={newSupplierName} onChange={e=>setNewSupplierName(e.target.value)} style={{width:'100%', height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none', marginBottom:'4px'}} />
                      <input type="text" placeholder="Products supplied (comma separated)" value={newSupplierProducts} onChange={e=>setNewSupplierProducts(e.target.value)} style={{width:'100%', height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none', marginBottom:'4px'}} />
                      <div className="flex gap-2">
                        <input type="text" placeholder="Contact Email/Phone" value={newSupplierContact} onChange={e=>setNewSupplierContact(e.target.value)} style={{flex:1, height:'40px', padding:'0 10px', borderRadius:'8px', border:'1px solid var(--border-default)', outline:'none'}} />
                        <button onClick={handleAddSupplier} style={{background:'var(--accent)', color:'#fff', border:'none', borderRadius:'8px', padding:'0 16px', fontWeight:600}}>Add</button>
                      </div>
                      
                      <div className="flex flex-col gap-2 mt-4 max-h-40 overflow-y-auto">
                        {suppliers.map(s => (
                          <div key={s.id} className="flex justify-between items-center p-3 rounded-lg bg-surface-elevated border border-border-default">
                            <div>
                              <div style={{fontSize:'13px', fontWeight:600}}>{s.name}</div>
                              <div className="mono" style={{fontSize:'10px', color:'var(--text-tertiary)'}}>{s.contactMasked}</div>
                            </div>
                            <button onClick={()=>setSuppliers(suppliers.filter(x=>x.id!==s.id))} style={{background:'none', border:'none', color:'var(--critical)', cursor:'pointer'}}><Trash2 size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 10 && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h2 style={{ fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {language === 'mm' ? "အရောင်းမှတ်တမ်းဖိုင် အပ်လုဒ်လုပ်ပါ" : "Bulk Sales History Import"}
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Upload an Excel or CSV file (up to 30 days) to power AI forecasting.</p>
                    </div>
                    
                    <div style={{ padding: '20px', border: '2px dashed var(--border-default)', borderRadius: '12px', textAlign: 'center', background: 'var(--bg-surface)' }}>
                      <FileUp size={28} style={{ color: 'var(--text-tertiary)', margin: '0 auto 10px' }} />
                      <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleBulkUpload} style={{ display: 'none' }} id="file-upload" />
                      <label htmlFor="file-upload" style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                        {language === 'mm' ? "ဖိုင်ရွေးချယ်ရန်" : "Select File"}
                      </label>
                    </div>
                    
                    {filePreview && (
                      <div className="mt-4 p-4 rounded-lg bg-surface-elevated border border-border-default">
                        <h4 style={{fontSize:'12px', fontWeight:600, marginBottom:'8px'}}>Preview (first 5 rows)</h4>
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

            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-default)', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={handleBack} disabled={step === 0}
                className="flex items-center gap-1 bg-transparent hover:bg-surface-hover/80 text-txt-secondary disabled:opacity-30 disabled:cursor-not-allowed border-none font-semibold text-sm py-2 px-3 rounded-lg cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                <ChevronLeft size={16} /> {t.back}
              </button>
              
              <div className="flex gap-3">
                {[5, 6, 7, 8, 9, 10].includes(step) && (
                  <button onClick={handleSkip}
                    style={{ background: 'transparent', border: '1px solid var(--border-default)', padding: '0 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}
                  >
                    {language === 'mm' ? "ကျော်သွားမည်" : "Skip"}
                  </button>
                )}
                
                <button onClick={handleNext} className="btn-primary"
                  style={{ height: '44px', padding: '0 24px', fontSize: '14px', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
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
