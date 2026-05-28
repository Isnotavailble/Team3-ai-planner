import React, { useState, useEffect } from 'react';
import { FileUp, ChevronRight, ChevronLeft, Clock, Sparkles, Check } from 'lucide-react';
import { translations } from '../../data/translations';

export default function Onboarding({ onImportComplete, onSkipToSandbox, language = 'mm' }) {
  const t = translations[language];
  const [manualText, setManualText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); 
  const [importStatus, setImportStatus] = useState(null); // null, 'parsing', 'wizard'
  
  // Form Wizard Steps (0 to 6)
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});

  // Profile Form States
  const [product, setProduct] = useState('');
  const [hasPOS, setHasPOS] = useState(false);
  const [selectedPeriods, setSelectedPeriods] = useState(['Monthly']);
  const [salesData, setSalesData] = useState({ daily: '', weekly: '', monthly: '12000', yearly: '' });
  const [expenses, setExpenses] = useState('8000');
  const [competitorInput, setCompetitorInput] = useState('');
  const [rivalsList, setRivalsList] = useState([]); // Array of strings e.g. ['Rival Shop']
  const [rivalDetails, setRivalDetails] = useState({}); // e.g. { 'Rival Shop': { pricing: 'Market Matcher', audience: 'SMB Retailers' } }

  // Competitor setup local step tracking (since they can have multiple rivals)
  const [currentRivalIdx, setCurrentRivalIdx] = useState(0);

  const startImportProcess = (method) => {
    setImportStatus('parsing');
    setUploadProgress({ step: language === 'mm' ? 'AI ဖြင့် လုပ်ငန်းအချက်အလက်များ လေ့လာဆန်းစစ်နေပါသည်...' : 'AI parsing business context...', value: 30 });
    
    setTimeout(() => {
      setUploadProgress({ step: language === 'mm' ? 'အချက်အလက်များ တိုက်ဆိုင်စစ်ဆေးနေပါသည်...' : 'Verifying required data points...', value: 70 });
      
      setTimeout(() => {
        setUploadProgress(null);
        
        if (method === 'text') {
          // Basic heuristic parsing
          const lowerText = manualText.toLowerCase();
          if (lowerText.includes('clothing') || lowerText.includes('cloth') || lowerText.includes('shirt') || lowerText.includes('အထည်')) {
            setProduct('Clothing Apparel');
          } else if (lowerText.includes('grocery') || lowerText.includes('store') || lowerText.includes('food') || lowerText.includes('ကုန်စုံ')) {
            setProduct('Grocery Staples');
          } else {
            setProduct('General Trading');
          }
        } else {
          setProduct('Imported Goods Shop');
        }
        
        setImportStatus('wizard');
        setStep(0);
      }, 1000);
    }, 800);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    startImportProcess('file');
  };

  const handleStartManualWizard = () => {
    setImportStatus('wizard');
    setStep(0);
  };

  const validateStep = () => {
    const newErrors = {};
    if (step === 0 && !product.trim()) {
      newErrors.product = language === 'mm' ? "ထုတ်ကုန်အမည် ဖြည့်သွင်းရန် လိုအပ်ပါသည်" : "Product name is required";
    }
    if (step === 2 && selectedPeriods.length === 0) {
      newErrors.periods = language === 'mm' ? "အရောင်းမှတ်တမ်းကာလ အနည်းဆုံးတစ်ခု ရွေးချယ်ပါ" : "Select at least one sales period";
    }
    if (step === 3) {
      selectedPeriods.forEach(p => {
        const val = salesData[p.toLowerCase()];
        if (!val || isNaN(val) || parseFloat(val) <= 0) {
          newErrors[p] = language === 'mm' ? `${p} အရောင်းပမာဏ မှန်ကန်စွာ ဖြည့်သွင်းပါ` : `Enter valid sales for ${p}`;
        }
      });
    }
    if (step === 4) {
      if (!expenses || isNaN(expenses) || parseFloat(expenses) < 0) {
        newErrors.expenses = language === 'mm' ? "လစဉ်အသုံးစရိတ် မှန်ကန်စွာ ဖြည့်သွင်းပါ" : "Enter a valid expense amount";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Determine max steps dynamically
  const maxSteps = (competitorInput.trim() && competitorInput.toLowerCase() !== 'none') ? 7 : 6;

  const handleNext = () => {
    if (!validateStep()) return;

    if (step === 5) {
      // Parse competitor list
      if (competitorInput.trim() && competitorInput.toLowerCase() !== 'none') {
        const list = competitorInput.split(',').map(n => n.trim()).filter(Boolean);
        setRivalsList(list);
        
        // Initialize detail structure
        const details = {};
        list.forEach(name => {
          details[name] = { 
            pricing: 'Market Matcher (Same price)', 
            audience: 'SMB Retailers' 
          };
        });
        setRivalDetails(details);
        setCurrentRivalIdx(0);
        setStep(6); // Go to competitor details step
      } else {
        setRivalsList([]);
        finishOnboarding([]);
      }
    } 
    else if (step === 6) {
      if (currentRivalIdx + 1 < rivalsList.length) {
        setCurrentRivalIdx(currentRivalIdx + 1);
      } else {
        finishOnboarding(rivalsList);
      }
    } 
    else {
      setStep(step + 1);
    }
  };

  const finishOnboarding = (list) => {
    const profile = {
      product,
      hasPOS,
      sales: {},
      expenses: parseFloat(expenses) || 0,
      rivals: list.map(name => ({
        name,
        pricing: rivalDetails[name]?.pricing || 'Market Matcher',
        audience: rivalDetails[name]?.audience || 'SMB Retailers'
      })),
      targetScenario: 'Competitor Price Cut', // default initial scenario
      expectedResult: 'Less Profit' // default initial result
    };

    selectedPeriods.forEach(p => {
      profile.sales[p.toLowerCase()] = parseFloat(salesData[p.toLowerCase()]) || 0;
    });

    onImportComplete(profile);
  };

  const handleBack = () => {
    if (step === 6) {
      if (currentRivalIdx > 0) {
        setCurrentRivalIdx(currentRivalIdx - 1);
      } else {
        setStep(5);
      }
    } else {
      setStep(step - 1);
    }
  };

  const togglePeriod = (period) => {
    setSelectedPeriods(prev => 
      prev.includes(period) ? prev.filter(p => p !== period) : [...prev, period]
    );
  };

  const handleSalesChange = (period, value) => {
    setSalesData(prev => ({ ...prev, [period.toLowerCase()]: value }));
  };

  const updateRivalDetails = (field, value) => {
    const rivalName = rivalsList[currentRivalIdx];
    setRivalDetails(prev => ({
      ...prev,
      [rivalName]: {
        ...prev[rivalName],
        [field]: value
      }
    }));
  };

  return (
    <div className="animate-fade-in light-mesh-bg" style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px'
    }}>
      <div className="glass-card flex" style={{
        width: '100%', maxWidth: '1200px', flex: 1, maxHeight: '720px',
        overflow: 'hidden'
      }}>
        
        {/* LEFT PANEL: PROFILE STATUS PREVIEW OR DRAG & DROP */}
        <div className="flex-1 flex flex-col" style={{
          padding: '48px', borderRight: '1px solid rgba(0,0,0,0.06)',
          overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '440px', margin: 'auto', width: '100%' }}>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: '16px' }}>
              STRIVO SETUP &middot; {language === 'mm' ? "လုပ်ငန်း စတင်ခြင်း" : "ONBOARDING"}
            </div>
            <h1 style={{ fontSize: '28px', letterSpacing: '-0.04em', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              {language === 'mm' ? "လုပ်ငန်းဒေတာ ထည့်သွင်းခြင်း" : "Import SME Data"}
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '13px', lineHeight: 1.6 }}>
              {language === 'mm' 
                ? "သင်၏ အရောင်းမှတ်တမ်းများ၊ ပြေစာများ တင်သွင်းပါ။ စနစ်မှ အလိုအလျောက် သုံးသပ်ပြီး စမ်းသပ်ပတ်ဝန်းကျင် ဖန်တီးပေးပါမည်။"
                : "Drop local POS sales reports or invoices. Strivo will verify your records and open the strategic simulation sandbox."
              }
            </p>

            {importStatus === null && (
              <>
                <div className="flex flex-col gap-5">
                  <div
                    className={`drop-zone ${isDragging ? 'active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => startImportProcess('file')}
                    style={{
                      height: '160px', display: 'flex', flexDirection: 'column', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <FileUp size={36} color={isDragging ? 'var(--accent)' : 'var(--text-tertiary)'} style={{ marginBottom: '12px' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '13px' }}>
                      {t.dropZoneText}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      {t.dropZoneSubtext}
                    </span>
                  </div>

                  <div className="flex flex-col gap-2" style={{ marginTop: '4px' }}>
                    <label className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      {t.manualLabel}
                    </label>
                    <textarea
                      placeholder={t.manualPlaceholder}
                      value={manualText}
                      onChange={(e) => setManualText(e.target.value)}
                      style={{
                        width: '100%', height: '90px', border: '1px solid var(--border-default)',
                        borderRadius: '8px', padding: '12px', resize: 'none', outline: 'none',
                        fontSize: '13px', background: 'rgba(255,255,255,0.8)', lineHeight: '1.5'
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        disabled={!manualText.trim()}
                        onClick={() => startImportProcess('text')}
                        className="btn-primary"
                        style={{ height: '38px', fontSize: '13px', flex: 1 }}
                      >
                        {language === 'mm' ? "AI ဖြင့် ဆန်းစစ်ရန်" : "AI Analyze"} <ChevronRight size={14} />
                      </button>
                      <button
                        onClick={handleStartManualWizard}
                        className="btn-primary"
                        style={{ height: '38px', fontSize: '13px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-default)', boxShadow: 'none' }}
                      >
                        {t.startWizardBtn}
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '12px', color: 'var(--text-secondary)' }}>
                    <Clock size={15} />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>{t.recentWorkspaceTitle}</span>
                  </div>
                  
                  <div
                    onClick={() => onSkipToSandbox()}
                    style={{
                      background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-light)',
                      borderRadius: '8px', padding: '14px', cursor: 'pointer', transition: 'all 0.2s ease',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.01)'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'none'; }}
                  >
                     <div>
                       <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>Yangon Retail Market Analysis</div>
                       <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{t.savedYesterday}</div>
                     </div>
                     <ChevronRight size={16} color="var(--text-tertiary)" />
                  </div>
                </div>
              </>
            )}

            {importStatus === 'parsing' && (
              <div style={{
                background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid var(--border-default)',
                padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-primary)', marginBottom: '12px', textAlign: 'center' }}>
                  {uploadProgress?.step}
                </div>
                <div style={{
                  width: '100%', height: '4px', background: 'var(--bg-track)',
                  borderRadius: '2px', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${uploadProgress?.value}%`, height: '100%',
                    background: 'var(--accent)', transition: 'width 0.2s ease-out'
                  }} />
                </div>
              </div>
            )}

            {importStatus === 'wizard' && (
              <div style={{
                background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-default)',
                borderRadius: '12px', padding: '24px'
              }}>
                <h3 style={{ fontWeight: 600, fontSize: '14px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                  {language === 'mm' ? "လုပ်ငန်းပုံစံ ခြုံငုံသုံးသပ်ချက်" : "Workspace Profile"}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <div className="mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ထုတ်ကုန်" : "Product"}
                    </div>
                    <div className="font-semibold text-sm truncate" style={{ color: product ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                      {product || (language === 'mm' ? "မသတ်မှတ်ရသေးပါ" : "Not configured")}
                    </div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <div className="mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "POS စနစ် သုံးစွဲမှု" : "POS System"}
                    </div>
                    <div className="font-semibold text-sm truncate">
                      {hasPOS ? (language === 'mm' ? "အသုံးပြုသည်" : "Active") : (language === 'mm' ? "အသုံးမပြုပါ" : "Inactive")}
                    </div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <div className="mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "အရောင်းမှတ်တမ်းများ" : "Recorded Sales"}
                    </div>
                    <div className="font-semibold text-sm font-number" style={{ color: 'var(--text-primary)' }}>
                      {selectedPeriods.map(p => {
                        const val = salesData[p.toLowerCase()];
                        return val ? `${p.slice(0,3)}: $${parseFloat(val).toLocaleString()}` : null;
                      }).filter(Boolean).join(' | ') || '—'}
                    </div>
                  </div>
                  <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <div className="mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "လစဉ် အထွေထွေကုန်ကျစရိတ်" : "Monthly Expenses"}
                    </div>
                    <div className="font-semibold text-sm font-number" style={{ color: 'var(--text-primary)' }}>
                      ${parseFloat(expenses || 0).toLocaleString()}
                    </div>
                  </div>
                  {rivalsList.length > 0 && (
                    <div style={{ background: '#fff', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                      <div className="mono text-[9px] uppercase tracking-wider text-txt-tertiary mb-1" style={{ color: 'var(--text-secondary)' }}>
                        {language === 'mm' ? "ပြိုင်ဘက်ဆိုင်များ" : "Competitors"}
                      </div>
                      <div className="font-semibold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                        {rivalsList.join(', ')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: 7-STAGE FORM QUESTIONNAIRE WIZARD */}
        <div className="flex-1 flex flex-col" style={{
          background: 'var(--bg-surface)', borderLeft: '1px solid rgba(0,0,0,0.06)'
        }}>
          {importStatus === 'wizard' ? (
            <div className="flex flex-col h-full overflow-hidden">
              
              {/* Wizard Header */}
              <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-default)', background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div className="flex items-center gap-1.5">
                    <Sparkles size={16} className="text-txt-primary opacity-80" style={{ color: 'var(--accent)' }} />
                    <span className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      {t.stepProgress} {step + 1} {t.outOf} {maxSteps}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    {Math.round(((step + 1) / maxSteps) * 100)}%
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div style={{ width: '100%', height: '3px', background: 'rgba(0,0,0,0.05)', borderRadius: '1.5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${((step + 1) / maxSteps) * 100}%`, height: '100%',
                    background: 'var(--accent)', transition: 'width 0.3s ease-out'
                  }} />
                </div>
              </div>
              
              {/* Wizard Questionnaire Body */}
              <div className="flex-1 p-8 overflow-y-auto flex flex-col justify-center">
                <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
                  
                  {/* STEP 0: PRODUCT */}
                  {step === 0 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'mm' ? "၁။ သင် ဘယ်ထုတ်ကုန်တွေ ရောင်းချပါသလဲ။" : "1. What product do you sell?"}
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "အဓိကရောင်းချသော ထုတ်ကုန်အမျိုးအစားကို ဖော်ပြပေးပါ။ (ဥပမာ - အဝတ်အထည်၊ စားသောက်ကုန်၊ ဖုန်းဆက်စပ်ပစ္စည်းများ)" : "Select or type your primary selling category."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {['Clothing Apparel', 'Grocery Staples', 'Electronics', 'Coffee & Foods'].map(item => (
                          <button
                            key={item}
                            onClick={() => { setProduct(item); setErrors({}); }}
                            className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${product === item ? 'border-border-dark font-semibold' : 'border-border-default'}`}
                            style={{
                              background: product === item ? 'var(--accent-soft)' : 'transparent',
                              borderColor: product === item ? 'var(--accent)' : 'var(--border-default)',
                              color: product === item ? 'var(--accent)' : 'var(--text-primary)'
                            }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2">
                        <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "သို့မဟုတ် ကိုယ်တိုင်ရေးသွင်းရန်" : "Or type custom category:"}
                        </label>
                        <input
                          type="text"
                          value={product}
                          onChange={(e) => { setProduct(e.target.value); setErrors({}); }}
                          placeholder="e.g. Handmade Crafts"
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px'
                          }}
                        />
                        {errors.product && <p style={{ color: 'var(--critical)', fontSize: '11px', fontWeight: 500 }}>{errors.product}</p>}
                      </div>
                    </div>
                  )}

                  {/* STEP 1: POS STATUS */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'mm' ? "၂။ သင် လုပ်ငန်းတွင် POS စနစ် သုံးပါသလား။" : "2. Do you use a Point of Sale (POS) system?"}
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "အရောင်းမှတ်တမ်းများအတွက် စက် သို့မဟုတ် တက်ဘလက် သုံးစွဲမှုကို ဖော်ပြပါ။" : "Choose whether you run software sales tracking."}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setHasPOS(true)}
                          className="p-5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-2"
                          style={{
                            background: hasPOS ? 'var(--accent-soft)' : 'transparent',
                            borderColor: hasPOS ? 'var(--accent)' : 'var(--border-default)',
                            color: hasPOS ? 'var(--accent)' : 'var(--text-primary)'
                          }}
                        >
                          <span style={{ fontSize: '24px' }}>📊</span>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{language === 'mm' ? "အသုံးပြုပါသည် (Yes)" : "Yes, I use POS"}</span>
                        </button>
                        <button
                          onClick={() => setHasPOS(false)}
                          className="p-5 rounded-xl border text-center cursor-pointer transition-all flex flex-col items-center gap-2"
                          style={{
                            background: !hasPOS ? 'var(--accent-soft)' : 'transparent',
                            borderColor: !hasPOS ? 'var(--accent)' : 'var(--border-default)',
                            color: !hasPOS ? 'var(--accent)' : 'var(--text-primary)'
                          }}
                        >
                          <span style={{ fontSize: '24px' }}>📝</span>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{language === 'mm' ? "မသုံးပါ (No)" : "No, manual ledger"}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SALES PERIODS */}
                  {step === 2 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'mm' ? "၃။ အရောင်းဒေတာကို ဘယ်လိုမှတ်တမ်းတင်လေ့ရှိပါသလဲ။" : "3. What sales records do you keep track of?"}
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "သင်မှတ်တမ်းတင်ထားသော ကာလအပိုင်းအခြားများကို ရွေးချယ်ပါ။ (အများကြီး ရွေးချယ်နိုင်သည်)" : "Select all periods for which you keep records."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(period => {
                          const isSelected = selectedPeriods.includes(period);
                          return (
                            <button
                              key={period}
                              onClick={() => { togglePeriod(period); setErrors({}); }}
                              className="w-full flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all text-left"
                              style={{
                                background: isSelected ? 'var(--accent-soft)' : 'transparent',
                                borderColor: isSelected ? 'var(--accent)' : 'var(--border-default)',
                                color: isSelected ? 'var(--accent)' : 'var(--text-primary)'
                              }}
                            >
                              <div style={{ display: 'flex', items: 'center', gap: '12px' }}>
                                {isSelected ? (
                                  <span style={{ color: 'var(--accent)' }}><Check size={18} /></span>
                                ) : (
                                  <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid var(--border-default)' }} />
                                )}
                                <span style={{ fontWeight: 600 }}>{period}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {errors.periods && <p style={{ color: 'var(--critical)', fontSize: '11px', fontWeight: 500 }}>{errors.periods}</p>}
                    </div>
                  )}

                  {/* STEP 3: SALES VALUES */}
                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'mm' ? "၄။ ပျမ်းမျှအရောင်းပမာဏ ဖြည့်သွင်းပါ။" : "4. Enter your average sales numbers"}
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "သင်ရွေးချယ်ခဲ့သည့် ကာလအလိုက် အရောင်းပမာဏကို ဒေါ်လာ/ကျပ် ဖြင့် ဖြည့်ပါ။" : "Input value estimations for your records (in USD equivalent)."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-4">
                        {selectedPeriods.map(period => (
                          <div key={period} className="flex flex-col gap-1">
                            <label className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                              Average {period} Sales ($)
                            </label>
                            <input
                              type="number"
                              value={salesData[period.toLowerCase()]}
                              onChange={(e) => { handleSalesChange(period, e.target.value); setErrors({}); }}
                              placeholder="e.g. 5000"
                              className="font-number"
                              style={{
                                width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                                border: '1px solid var(--border-default)', outline: 'none', fontSize: '14px'
                              }}
                            />
                            {errors[period] && <p style={{ color: 'var(--critical)', fontSize: '11px', fontWeight: 500 }}>{errors[period]}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: EXPENSES */}
                  {step === 4 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'mm' ? "၅။ ပျမ်းမျှ လစဉ် ကုန်ကျစရိတ်" : "5. What are your monthly expenses?"}
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "လခ၊ ဆိုင်ခန်းငှားရမ်းခ၊ ပစ္စည်းဖိုးနှင့် အထွေထွေ ကုန်ကျစရိတ်များကို ပေါင်း၍ ဖြည့်သွင်းပါ။" : "Helps calculate your estimated Net Profit and measure ROI."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          Monthly Operating Expenses ($)
                        </label>
                        <input
                          type="number"
                          value={expenses}
                          onChange={(e) => { setExpenses(e.target.value); setErrors({}); }}
                          placeholder="e.g. 3000"
                          className="font-number"
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1px solid var(--border-default)', outline: 'none', fontSize: '14px'
                          }}
                        />
                        {errors.expenses && <p style={{ color: 'var(--critical)', fontSize: '11px', fontWeight: 500 }}>{errors.expenses}</p>}
                      </div>
                    </div>
                  )}

                  {/* STEP 5: COMPETITORS INPUT */}
                  {step === 5 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                          {language === 'mm' ? "၆။ ပြိုင်ဘက်ဆိုင် (Competitors) များ" : "6. Who are your main rival shops?"}
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "ပြိုင်ဘက်ဆိုင်များ၏ အမည်များကို ကော်မာ (,) ခံ၍ ရေးပါ။ မရှိပါက 'None' ဟု ရေးပါ သို့မဟုတ် ကျော်သွားပါ။" : "Enter competitor names separated by commas, or type 'None' to skip."}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <input
                          type="text"
                          value={competitorInput}
                          onChange={(e) => setCompetitorInput(e.target.value)}
                          placeholder="e.g. Rival Shop A, Rival Shop B"
                          style={{
                            width: '100%', height: '40px', padding: '0 12px', borderRadius: '8px',
                            border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px'
                          }}
                        />
                        <button
                          onClick={() => { setCompetitorInput('None'); finishOnboarding([]); }}
                          className="mono"
                          style={{
                            alignSelf: 'flex-start', background: 'none', border: 'none',
                            color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer',
                            fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em'
                          }}
                        >
                          {language === 'mm' ? "ပြိုင်ဘက်ဆိုင် မရှိပါ (Skip)" : "I have no competitors"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: COMPETITOR DETAILS (DYNAMIC PER RIVAL) */}
                  {step === 6 && (
                    <div className="space-y-6">
                      <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {language === 'mm' 
                            ? `၇။ ပြိုင်ဘက်ဆိုင် "${rivalsList[currentRivalIdx]}" ၏ အချက်အလက်များ` 
                            : `7. Configure "${rivalsList[currentRivalIdx]}"`
                          }
                        </h2>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "စျေးနှုန်းမူဝါဒနှင့် ဖောက်သည် အမျိုးအစားကို သတ်မှတ်ပေးပါ။" : "Provide pricing dynamics and audience alignment."}
                        </p>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col gap-2">
                          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {language === 'mm' ? "စျေးနှုန်းမူဝါဒ (Pricing Strategy)" : "Rival Pricing Strategy:"}
                          </label>
                          <div className="grid grid-cols-1 gap-2">
                            {[
                              'Discount Leader (10% cheaper)',
                              'Market Matcher (Same price)',
                              'Premium Brand (15% more expensive)'
                            ].map(option => {
                              const rivalName = rivalsList[currentRivalIdx];
                              const isSelected = rivalDetails[rivalName]?.pricing === option;
                              return (
                                <button
                                  key={option}
                                  onClick={() => updateRivalDetails('pricing', option)}
                                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all text-xs font-semibold ${isSelected ? 'border-border-dark' : 'border-border-default'}`}
                                  style={{
                                    background: isSelected ? 'var(--accent-soft)' : 'transparent',
                                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-default)',
                                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)'
                                  }}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col gap-2" style={{ marginTop: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                            {language === 'mm' ? "ဖောက်သည် အမျိုးအစား (Target Audience)" : "Rival Target Audience:"}
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {['SMB Retailers', 'Wholesale Buyers', 'Online Consumers'].map(option => {
                              const rivalName = rivalsList[currentRivalIdx];
                              const isSelected = rivalDetails[rivalName]?.audience === option;
                              return (
                                <button
                                  key={option}
                                  onClick={() => updateRivalDetails('audience', option)}
                                  className={`p-2.5 rounded-lg border text-center cursor-pointer transition-all text-xs font-semibold ${isSelected ? 'border-border-dark' : 'border-border-default'}`}
                                  style={{
                                    background: isSelected ? 'var(--accent-soft)' : 'transparent',
                                    borderColor: isSelected ? 'var(--accent)' : 'var(--border-default)',
                                    color: isSelected ? 'var(--accent)' : 'var(--text-primary)'
                                  }}
                                >
                                  {option}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* Wizard Footer Navigation */}
              <div style={{
                padding: '20px 32px', borderTop: '1px solid var(--border-default)',
                display: 'flex', justifyContent: 'space-between', items: 'center',
                background: 'var(--bg-elevated)'
              }}>
                <button
                  onClick={handleBack}
                  disabled={step === 0}
                  className="flex items-center gap-1 bg-transparent hover:bg-surface-hover/80 text-txt-secondary disabled:opacity-30 disabled:cursor-not-allowed border-none font-semibold text-xs py-2 px-3 rounded-lg cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <ChevronLeft size={16} /> {t.back}
                </button>
                <button
                  onClick={handleNext}
                  className="btn-primary"
                  style={{
                    height: '38px', padding: '0 20px', fontSize: '13px',
                    background: 'var(--accent)', color: '#fff', display: 'flex', items: 'center', gap: '4px'
                  }}
                >
                  {step === maxSteps - 1 
                    ? (language === 'mm' ? "လုပ်ငန်းစခရင်သို့ သွားမည်" : "Build Workspace") 
                    : t.next
                  }
                  {step !== maxSteps - 1 && <ChevronRight size={14} />}
                </button>
              </div>
              
            </div>
          ) : (
            <div style={{ padding: '64px', overflowY: 'auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
              <div style={{ maxWidth: '440px', margin: 'auto', width: '100%' }}>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: '16px' }}>
                  STRIVO SETUP &middot; {language === 'mm' ? "လမ်းညွှန်ချက်" : "GUIDELINE"}
                </div>
                <h1 style={{ fontSize: '28px', letterSpacing: '-0.04em', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {language === 'mm' ? "မေးခွန်းများ ဖြည့်စွက်ခြင်း" : "Step-by-step Setup"}
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '13px', lineHeight: 1.6 }}>
                  {language === 'mm' 
                    ? "ဖိုင်များ မရှိပါကလည်း စိတ်ပူစရာမလိုပါ။ 'မေးခွန်းများဖြင့် စတင်မည်' ကို နှိပ်ပြီး သင့်လုပ်ငန်းအချက်အလက်များကို လွယ်ကူစွာ ဖြည့်စွက်နိုင်ပါသည်။"
                    : "No spreadsheets? Type details regarding your retailers, wholesale supplier partners, and competitor details. Our questionnaire will ask for any fields needed to run prediction simulations."
                  }
                </p>

                <div className="animate-fade-in flex flex-col gap-3">
                  <div style={{
                    height: '180px', border: '1px solid var(--border-default)', borderRadius: '12px',
                    padding: '24px', background: 'var(--bg-elevated)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text-secondary)'
                  }}>
                    <Sparkles size={36} className="text-txt-secondary opacity-40 mb-3" style={{ color: 'var(--accent)' }} />
                    <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                      {language === 'mm' ? "မေးခွန်းဝစ်ဇတ် စနစ် အသင့်ဖြစ်နေပါသည်" : "Form Wizard is Ready"}
                    </p>
                    <p className="text-xs text-txt-tertiary max-w-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                      {language === 'mm' 
                        ? "လုပ်ငန်းအဆင့်ဆင့် ဆန်းစစ်ရန် ညာဘက်ခြမ်း သို့မဟုတ် စတင်ရန်ခလုတ်ကို အသုံးပြုပါ။" 
                        : "Click 'Start Questionnaire Setup' or import a file to configure your SME model."
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
