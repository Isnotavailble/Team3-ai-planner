import React, { useState } from 'react';
import { Globe, Check, FileUp, LogOut, Sliders, Plus, Trash2 } from 'lucide-react';
import { translations } from '../../data/translations';
import { supabase } from '../../utils/supabaseClient';
import api from '../../services/api';
import ProfileSkeleton from './ProfileSkeleton';

export default function ProfileView({ businessProfile = {}, setBusinessProfile, language = 'mm', setLanguage, isLoading = false }) {
  const t = translations[language] || translations['en'];



  // Telegram Linking State (Removed)

  const [userEmail, setUserEmail] = useState('');
  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.email) {
        setUserEmail(user.email);
      }
    });
  }, []);

  const [editName, setEditName] = useState(businessProfile?.businessName || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  
  React.useEffect(() => {
    if (businessProfile?.businessName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditName(businessProfile.businessName);
    }
  }, [businessProfile?.businessName]);

  const handleSaveName = async () => {
    if (!editName.trim()) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    try {
      await setBusinessProfile(prev => ({
        ...prev,
        businessName: editName.trim()
      }));
      setIsEditingName(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingName(false);
    }
  };

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('operations'); // 'operations' | 'financials' | 'network' | 'sales' | 'inventory'
  
  


  const [product, setProduct] = useState(businessProfile?.product || '');
  const [hasPOS, setHasPOS] = useState(businessProfile?.hasPOS || false);
  const [expenses, setExpenses] = useState(businessProfile?.expenses || '');
  const [salesData, setSalesData] = useState({
    daily: businessProfile?.sales?.daily || '',
    weekly: businessProfile?.sales?.weekly || '',
    monthly: businessProfile?.sales?.monthly || '',
    yearly: businessProfile?.sales?.yearly || ''
  });
  const [rivals, setRivals] = useState(businessProfile?.rivals || []);
  const [customers, setCustomers] = useState(businessProfile?.customers || []);
  const [productsList, setProductsList] = useState(businessProfile?.products || []);
  const [suppliers, setSuppliers] = useState(businessProfile?.suppliers || []);

  // Network tab inner navigation
  const [activeNetworkSubTab, setActiveNetworkSubTab] = useState('products'); // 'products' | 'rivals' | 'customers' | 'suppliers'

  // Input states for builders
  const [newRivalName, setNewRivalName] = useState('');
  const [newRivalPricing, setNewRivalPricing] = useState('Same price as our product');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierProducts, setNewSupplierProducts] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  // Sync state variables with profile updates
  React.useEffect(() => {
    if (businessProfile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProduct(businessProfile.product || '');
      setHasPOS(businessProfile.hasPOS || false);
      setExpenses(businessProfile.expenses || '');
      setSalesData({
        daily: businessProfile.sales?.daily || '',
        weekly: businessProfile.sales?.weekly || '',
        monthly: businessProfile.sales?.monthly || '',
        yearly: businessProfile.sales?.yearly || ''
      });
      setRivals(businessProfile.rivals || []);
      setCustomers(businessProfile.customers || []);
      setProductsList(businessProfile.products || []);
      setSuppliers(businessProfile.suppliers || []);
    }
  }, [businessProfile]);

  const maskContact = (contact) => {
    if (!contact) return '';
    if (contact.includes('@')) {
      const [name, domain] = contact.split('@');
      return `${name[0]}***@${domain}`;
    }
    if (contact.length > 4) {
      return `***-***-${contact.slice(-4)}`;
    }
    return '***';
  };

  const handleAddCompetitor = () => {
    if (newRivalName.trim()) {
      setRivals([...rivals, {
        id: Date.now(),
        name: newRivalName.trim(),
        pricing: newRivalPricing,
        audience: 'SMB Retailers'
      }]);
      setNewRivalName('');
    }
  };

  const handleAddCustomer = () => {
    if (newCustomerName.trim()) {
      setCustomers([...customers, { id: Date.now(), type: 'customer', name: newCustomerName.trim(), contact: newCustomerContact.trim() }]);
      setNewCustomerName('');
      setNewCustomerContact('');
    }
  };

  const handleAddProductList = () => {
    if (newProductName.trim() && newProductPrice) {
      setProductsList([...productsList, { id: Date.now(), type: 'product', name: newProductName.trim(), price: parseFloat(newProductPrice) || 0 }]);
      setNewProductName('');
      setNewProductPrice('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplierName.trim()) {
      setSuppliers([...suppliers, { 
        id: Date.now(), 
        type: 'supplier', 
        name: newSupplierName.trim(), 
        products: newSupplierProducts.split(',').map(s => s.trim()).filter(Boolean),
        contactMasked: maskContact(newSupplierContact.trim())
      }]);
      setNewSupplierName('');
      setNewSupplierProducts('');
      setNewSupplierContact('');
    }
  };

  const [isSavingOps, setIsSavingOps] = useState(false);
  const [opsSaveMsg, setOpsSaveMsg] = useState('');
  const [isSavingFin, setIsSavingFin] = useState(false);
  const [finSaveMsg, setFinSaveMsg] = useState('');
  const [isSavingNet, setIsSavingNet] = useState(false);
  const [netSaveMsg, setNetSaveMsg] = useState('');

  const handleSaveOperations = async () => {
    setIsSavingOps(true);
    setOpsSaveMsg('');
    try {
      await setBusinessProfile(prev => ({
        ...prev,
        product: product.trim() || null,
        hasPOS: hasPOS
      }));
      setOpsSaveMsg(language === 'mm' ? "လုပ်ငန်းအချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ" : "Operations settings saved successfully!");
      setTimeout(() => setOpsSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingOps(false);
    }
  };

  const handleSaveFinancials = async () => {
    setIsSavingFin(true);
    setFinSaveMsg('');
    try {
      await setBusinessProfile(prev => ({
        ...prev,
        expenses: parseFloat(expenses) || 0,
        sales: {
          ...(prev.sales || {}),
          daily: salesData.daily !== '' ? parseFloat(salesData.daily) : null,
          weekly: salesData.weekly !== '' ? parseFloat(salesData.weekly) : null,
          monthly: salesData.monthly !== '' ? parseFloat(salesData.monthly) : null,
          yearly: salesData.yearly !== '' ? parseFloat(salesData.yearly) : null
        }
      }));
      setFinSaveMsg(language === 'mm' ? "ငွေကြေးခန့်မှန်းချက်များ သိမ်းဆည်းပြီးပါပြီ" : "Financial estimates saved successfully!");
      setTimeout(() => setFinSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingFin(false);
    }
  };

  const handleSaveNetwork = async () => {
    setIsSavingNet(true);
    setNetSaveMsg('');
    try {
      await setBusinessProfile(prev => ({
        ...prev,
        products: productsList,
        rivals: rivals,
        customers: customers,
        suppliers: suppliers
      }));
      setNetSaveMsg(language === 'mm' ? "လုပ်ငန်းကွန်ရက် အချက်အလက်များ သိမ်းဆည်းပြီးပါပြီ" : "Network configuration saved successfully!");
      setTimeout(() => setNetSaveMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingNet(false);
    }
  };
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => { setIsDragging(false); };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    processSalesFile(file);
  };
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processSalesFile(file);
  };

  const handleResetSalesData = () => {
    setBusinessProfile(prev => ({
      ...prev,
      salesHistory: [],
      sales: {
        ...(prev.sales || {}),
        summary: null
      }
    }));
    setFilePreview(null);
  };

  const processSalesFile = async (file) => {
    setUploadProgress({ step: language === 'mm' ? 'ဖိုင်ကို ဆာဗာသို့ တင်နေပါသည်...' : 'Uploading file to server...', value: 30 });
    try {
      const response = await api.uploadSalesFile(file);
      setUploadProgress({ step: language === 'mm' ? 'အချက်အလက်များ သိမ်းဆည်းနေပါသည်...' : 'Saving parsed sales history...', value: 75 });
      if (response && response.success) {
        setBusinessProfile(prev => ({
          ...prev,
          salesHistory: response.data,
          sales: {
            ...(prev.sales || {}),
            summary: response.summary
          }
        }));
        setFilePreview(response.data.slice(0, 5));
      } else {
        throw new Error(response?.error || 'Failed to parse file');
      }
    } catch (err) {
      console.error(err);
      alert(err.message || 'An error occurred during file upload. Please ensure your file has Date and Sales columns.');
    } finally {
      setUploadProgress(null);
    }
  };

  const displayBusinessName = (businessProfile?.businessName === 'My Business' || !businessProfile?.businessName)
    ? 'New user ( change your username )'
    : businessProfile.businessName;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* PROFILE HEADER */}
      <header style={{
        background: 'var(--bg-gradient-1)', border: '1px solid var(--border-default)',
        borderRadius: '24px', padding: '28px', display: 'flex', alignItems: 'center', gap: '20px'
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', fontWeight: 600
        }}>
          {displayBusinessName ? displayBusinessName.slice(0, 1).toUpperCase() : "?"}
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {displayBusinessName}
          </h1>
          {userEmail && (
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {userEmail}
            </p>
          )}
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t.businessType}: {businessProfile?.product || (language === 'mm' ? "ဒေတာမရှိပါ" : "Not enough data")}
          </p>
          <span className="mono" style={{
            fontSize: '9px', background: 'rgba(0,0,0,0.05)', padding: '2px 8px',
            borderRadius: '10px', textTransform: 'uppercase', display: 'inline-block', marginTop: '6px'
          }}>
            {t.posStatus}: {businessProfile?.hasPOS === true ? (language === 'mm' ? "အသုံးပြုပါသည်" : "WITH POS") : businessProfile?.hasPOS === false ? (language === 'mm' ? "လက်စွဲ စာရင်းသွင်းသည်" : "WITHOUT POS") : (language === 'mm' ? "ဒေတာမရှိပါ" : "NOT ENOUGH DATA")}
          </span>
        </div>
      </header>

      {/* BUSINESS PROFILE SETTINGS (CHANGE USERNAME) */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {language === 'mm' ? "လုပ်ငန်း ဆက်တင်များ" : "Business Profile Settings"}
        </h3>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "လုပ်ငန်းအမည်" : "Business Name"}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {language === 'mm' ? "စနစ်အတွင်းပြသမည့် အမည် (Username)" : "Displayed username in the system"}
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter name"
                disabled={!isEditingName}
                style={{
                  width: '180px', padding: '8px 12px', borderRadius: '0',
                  border: 'none',
                  borderBottom: isEditingName ? '2px solid var(--accent)' : '2px solid transparent',
                  outline: 'none',
                  fontSize: '14px', fontWeight: 600,
                  background: 'transparent', 
                  color: isEditingName ? 'var(--accent)' : 'var(--text-primary)', 
                  textAlign: isEditingName ? 'left' : 'right',
                  transition: 'all 0.2s ease', cursor: isEditingName ? 'text' : 'default',
                  boxShadow: 'none'
                }}
              />
              <button
                onClick={() => {
                  if (isEditingName) {
                    handleSaveName();
                  } else {
                    setIsEditingName(true);
                  }
                }}
                disabled={isSavingName}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: isEditingName ? 'var(--accent)' : 'var(--bg-surface)', 
                  border: isEditingName ? '1px solid transparent' : '1px solid var(--border-default)',
                  color: isEditingName ? '#fff' : 'var(--text-primary)', fontSize: '13px',
                  fontWeight: 600, cursor: 'pointer', display: 'flex', 
                  alignItems: 'center', gap: '6px',
                  boxShadow: isEditingName ? '0 4px 12px rgba(107, 45, 123, 0.2)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => { 
                  e.currentTarget.style.transform = 'translateY(-1px)'; 
                  if (isEditingName) e.currentTarget.style.boxShadow = '0 6px 16px rgba(107, 45, 123, 0.3)';
                }}
                onMouseLeave={(e) => { 
                  e.currentTarget.style.transform = 'none'; 
                  if (isEditingName) e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 45, 123, 0.2)';
                  else e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                }}
              >
                {isEditingName ? (
                   isSavingName ? (language === 'mm' ? "သိမ်းနေသည်..." : "Saving...") : (
                     <>
                       <Check size={14} />
                       {language === 'mm' ? "သိမ်းမည်" : "Save"}
                     </>
                   )
                ) : (
                  language === 'mm' ? "အမည်ပြောင်းမည်" : "Change Business Name"
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LANGUAGE SELECTOR */}
      <section style={{
        background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
        borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Globe size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {t.languageLabel}
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {language === 'mm' ? "စနစ်တွက်ချက်မှု ဘာသာစကား ရွေးချယ်ရန်" : "Configure primary system interface language"}
            </p>
          </div>
        </div>

        {/* Toggle Pills */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '3px', borderRadius: '8px' }}>
          <button
            onClick={() => {
              setLanguage('mm');
              localStorage.setItem('language', 'mm');
            }}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600, transition: 'all 0.2s',
              background: language === 'mm' ? 'var(--accent)' : 'transparent',
              color: language === 'mm' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            မြန်မာ
          </button>
          <button
            onClick={() => {
              setLanguage('en');
              localStorage.setItem('language', 'en');
            }}
            style={{
              padding: '6px 14px', border: 'none', borderRadius: '6px', cursor: 'pointer',
              fontSize: '11px', fontWeight: 600, transition: 'all 0.2s',
              background: language === 'en' ? 'var(--accent)' : 'transparent',
              color: language === 'en' ? '#fff' : 'var(--text-secondary)'
            }}
          >
            English
          </button>
        </div>
      </section>

      {/* CHANNELS INTEGRATIONS */}
    

      {/* BUSINESS QUESTIONNAIRE & SYSTEM SETTINGS */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {language === 'mm' ? "လုပ်ငန်း မေးခွန်းလွှာ နှင့် စနစ် ဆက်တင်များ" : "Business Questionnaire & System Settings"}
        </h3>
        <div style={{
          background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {language === 'mm' 
              ? "လုပ်ငန်းအမျိုးအစား၊ POS စနစ်သုံးစွဲမှု၊ ငွေကြေးခန့်မှန်းချက်များနှင့် ထုတ်ကုန်၊ ပြိုင်ဘက်၊ ဖောက်သည်၊ ကုန်သွင်းသူ ကွန်ရက်အချက်အလက်များကို ပြင်ဆင်ရန်" 
              : "Configure business categories, financials, network maps (products, competitors, customers, suppliers) and upload sales history."}
          </span>
          <button onClick={() => setShowSettingsModal(true)} style={{
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Sliders size={16} />
            {language === 'mm' ? "မေးခွန်းလွှာနှင့် ဆက်တင်များ ပြင်ဆင်ရန်" : "Configure Questionnaire & Settings"}
          </button>
        </div>
      </section>
      {/* SIGN OUT SECTION */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {language === 'mm' ? "အကောင့်စီမံခန့်ခွဲမှု" : "Account Settings"}
        </h3>
        <div style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <LogOut size={20} style={{ color: 'var(--critical)' }} />
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "အကောင့်မှ ထွက်ရန်" : "Sign Out"}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                {language === 'mm' ? "သင်၏ Strivo စာရှင်းမှ ထွက်ခွာမည်" : "Logout of your active Strivo planning session"}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              localStorage.setItem('login', 'false');
            }}
            style={{
              padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-default)',
              background: 'rgba(163, 61, 92, 0.1)', color: 'var(--critical)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            {language === 'mm' ? "ထွက်မည်" : "Sign Out"}
          </button>
        </div>
      </section>

      {/* SETTINGS MODAL POPUP */}
      {showSettingsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '640px',
            display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "လုပ်ငန်း မေးခွန်းလွှာ ဆက်တင်များ" : "Business Questionnaire Settings"}
              </h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px', overflowX: 'auto', paddingRight: '8px' }}>
              {[
                { id: 'operations', labelMm: 'လုပ်ငန်း', labelEn: 'Operations' },
                { id: 'financials', labelMm: 'ငွေကြေး', labelEn: 'Financials' },
                { id: 'network', labelMm: 'လုပ်ငန်းကွန်ရက်', labelEn: 'Network' },
                { id: 'sales', labelMm: 'အရောင်းဖိုင်', labelEn: 'Sales Upload' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '8px 16px', border: 'none', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
                    background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {language === 'mm' ? tab.labelMm : tab.labelEn}
                </button>
              ))}
            </div>
            
            <div style={{ minHeight: '260px' }}>
              {/* OPERATIONS PANEL */}
              {activeTab === 'operations' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveOperations(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ထုတ်ကုန်/လုပ်ငန်း အမျိုးအစား" : "Business Category / Product"}
                    </label>
                    <input
                      type="text"
                      required
                      value={product}
                      onChange={(e) => setProduct(e.target.value)}
                      placeholder={language === 'mm' ? "ဥပမာ - လက်ဖက်ရည်ဆိုင်၊ ကုန်စုံဆိုင်" : "e.g. Tea Shop, Grocery"}
                      style={{
                        padding: '10px 12px', borderRadius: '8px',
                        border: '1px solid var(--border-default)', outline: 'none',
                        fontSize: '14px', background: 'var(--bg-base)', color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {language === 'mm' ? "POS စနစ် အသုံးပြုပါသည်" : "Use Point-of-Sale (POS) System"}
                      </span>
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {language === 'mm' ? "ရောင်းချမှုများကို စက်ဖြင့် မှတ်တမ်းတင်ခြင်း" : "Track sales via software or digital systems"}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={hasPOS}
                      onChange={(e) => setHasPOS(e.target.checked)}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button type="submit" disabled={isSavingOps} style={{
                      background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px 16px', fontSize: '13px', fontWeight: 600, 
                      cursor: isSavingOps ? 'not-allowed' : 'pointer', 
                      opacity: isSavingOps ? 0.6 : 1,
                      alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {isSavingOps ? (language === 'mm' ? "သိမ်းနေသည်..." : "Saving...") : (language === 'mm' ? "အချက်အလက် သိမ်းဆည်းမည်" : "Save Operations")}
                    </button>
                    {opsSaveMsg && (
                      <div className="animate-fade-in" style={{ color: 'var(--positive)', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> {opsSaveMsg}
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* FINANCIALS PANEL */}
              {activeTab === 'financials' && (
                <form onSubmit={(e) => { e.preventDefault(); handleSaveFinancials(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "လစဉ် အသုံးစရိတ် (MMK)" : "Monthly Expenses (MMK)"}
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="1"
                      value={expenses}
                      onChange={(e) => setExpenses(e.target.value)}
                      placeholder="e.g. 8000"
                      style={{
                        padding: '10px 12px', borderRadius: '8px',
                        border: '1px solid var(--border-default)', outline: 'none',
                        fontSize: '14px', background: 'var(--bg-base)', color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ပျမ်းမျှ အရောင်းပမာဏ ခန့်မှန်းချက်များ (MMK)" : "Estimated Average Sales (MMK)"}
                    </label>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{language === 'mm' ? "နေ့စဉ်" : "Daily"}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={salesData.daily}
                          onChange={(e) => setSalesData({ ...salesData, daily: e.target.value })}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{language === 'mm' ? "အပတ်စဉ်" : "Weekly"}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={salesData.weekly}
                          onChange={(e) => setSalesData({ ...salesData, weekly: e.target.value })}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{language === 'mm' ? "လစဉ်" : "Monthly"}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={salesData.monthly}
                          onChange={(e) => setSalesData({ ...salesData, monthly: e.target.value })}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{language === 'mm' ? "နှစ်စဉ်" : "Yearly"}</span>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={salesData.yearly}
                          onChange={(e) => setSalesData({ ...salesData, yearly: e.target.value })}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                    <button type="submit" disabled={isSavingFin} style={{
                      background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px 16px', fontSize: '13px', fontWeight: 600, 
                      cursor: isSavingFin ? 'not-allowed' : 'pointer', 
                      opacity: isSavingFin ? 0.6 : 1,
                      alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {isSavingFin ? (language === 'mm' ? "သိမ်းနေသည်..." : "Saving...") : (language === 'mm' ? "ဘဏ္ဍာရေး သိမ်းဆည်းမည်" : "Save Financials")}
                    </button>
                    {finSaveMsg && (
                      <div className="animate-fade-in" style={{ color: 'var(--positive)', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> {finSaveMsg}
                      </div>
                    )}
                  </div>
                </form>
              )}

              {/* NETWORK PANEL */}
              {activeTab === 'network' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Network Sub-Tabs */}
                  <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-elevated)', padding: '2px', borderRadius: '6px' }}>
                    {[
                      { id: 'products', labelMm: 'ကုန်ပစ္စည်း', labelEn: 'Products' },
                      { id: 'rivals', labelMm: 'ပြိုင်ဘက်', labelEn: 'Rivals' },
                      { id: 'customers', labelMm: 'ဝယ်သူ', labelEn: 'Customers' },
                      { id: 'suppliers', labelMm: 'ကုန်သွင်းသူ', labelEn: 'Suppliers' }
                    ].map(sub => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setActiveNetworkSubTab(sub.id)}
                        style={{
                          flex: 1, padding: '6px 0', border: 'none', borderRadius: '4px', cursor: 'pointer',
                          fontSize: '11px', fontWeight: 600, transition: 'all 0.15s',
                          background: activeNetworkSubTab === sub.id ? 'var(--bg-surface)' : 'transparent',
                          color: activeNetworkSubTab === sub.id ? 'var(--accent)' : 'var(--text-secondary)'
                        }}
                      >
                        {language === 'mm' ? sub.labelMm : sub.labelEn}
                      </button>
                    ))}
                  </div>

                  {/* PRODUCTS BUILDER PANEL */}
                  {activeNetworkSubTab === 'products' && (
                    <form onSubmit={(e) => { e.preventDefault(); handleAddProductList(); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          required
                          placeholder={language === 'mm' ? "ကုန်ပစ္စည်းအမည် (ဥပမာ - မုန့်ဟင်းခါး)" : "Product name (e.g. Mohinga)"}
                          value={newProductName}
                          onChange={e => setNewProductName(e.target.value)}
                          style={{ flex: 2, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                        <input
                          type="number"
                          required
                          min="0"
                          step="1"
                          placeholder={language === 'mm' ? "စျေးနှုန်း (MMK)" : "Price (MMK)"}
                          value={newProductPrice}
                          onChange={e => setNewProductPrice(e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                        <button type="submit" style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Plus size={16} />
                        </button>
                      </div>

                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                        {productsList.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className="font-number" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.price.toLocaleString()} MMK</span>
                              <button type="button" onClick={() => setProductsList(productsList.filter(x => x.id !== item.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </form>
                  )}

                  {/* RIVALS BUILDER PANEL */}
                  {activeNetworkSubTab === 'rivals' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder={language === 'mm' ? "ပြိုင်ဘက်ဆိုင်အမည် (ဥပမာ - မောင်မောင် လက်ဖက်ရည်)" : "Rival Shop Name"}
                            value={newRivalName}
                            onChange={e => setNewRivalName(e.target.value)}
                            style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                          />
                          <button onClick={handleAddCompetitor} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Plus size={16} />
                          </button>
                        </div>
                        <select
                          value={newRivalPricing}
                          onChange={e => setNewRivalPricing(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)', outline: 'none' }}
                        >
                          <option value="Same price as our product">{language === 'mm' ? 'ကျွန်ုပ်တို့နှင့် စျေးနှုန်းတူ' : 'Same price as our product'}</option>
                          <option value="Lower price than our product">{language === 'mm' ? 'ကျွန်ုပ်တို့ထက် စျေးသက်သာ' : 'Lower price than our product'}</option>
                          <option value="Higher price than our product">{language === 'mm' ? 'ကျွန်ုပ်တို့ထက် စျေးပိုကြီး' : 'Higher price than our product'}</option>
                        </select>
                      </div>

                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                        {rivals.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.pricing}</div>
                            </div>
                            <button onClick={() => setRivals(rivals.filter(x => x.id !== item.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CUSTOMERS BUILDER PANEL */}
                  {activeNetworkSubTab === 'customers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder={language === 'mm' ? "ဖောက်သည်အမည်" : "Customer name"}
                          value={newCustomerName}
                          onChange={e => setNewCustomerName(e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                        <input
                          type="text"
                          placeholder={language === 'mm' ? "ဖုန်း သို့မဟုတ် အီးမေးလ်" : "Phone or Email"}
                          value={newCustomerContact}
                          onChange={e => setNewCustomerContact(e.target.value)}
                          style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                        <button onClick={handleAddCustomer} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <Plus size={16} />
                        </button>
                      </div>

                      <div style={{ maxHeight: '160px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                        {customers.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                              {item.contact && <div className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{maskContact(item.contact)}</div>}
                            </div>
                            <button onClick={() => setCustomers(customers.filter(x => x.id !== item.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUPPLIERS BUILDER PANEL */}
                  {activeNetworkSubTab === 'suppliers' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder={language === 'mm' ? "ကုန်သွင်းသူအမည်" : "Supplier name"}
                            value={newSupplierName}
                            onChange={e => setNewSupplierName(e.target.value)}
                            style={{ flex: 1, padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                          />
                          <button onClick={handleAddSupplier} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '6px', width: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Plus size={16} />
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder={language === 'mm' ? "သွင်းသည့်ပစ္စည်းများ (ကော်မာခြားပါ၊ ဥပမာ - ကော်ဖီ၊ နို့ဆီ)" : "Supplied items (comma-separated, e.g. Tea, Milk)"}
                          value={newSupplierProducts}
                          onChange={e => setNewSupplierProducts(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                        <input
                          type="text"
                          placeholder={language === 'mm' ? "ဖုန်း သို့မဟုတ် အီးမေးလ်" : "Contact (Phone or Email)"}
                          value={newSupplierContact}
                          onChange={e => setNewSupplierContact(e.target.value)}
                          style={{ padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-default)', fontSize: '13px', background: 'var(--bg-base)', color: 'var(--text-primary)' }}
                        />
                      </div>

                      <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
                        {suppliers.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: 'var(--bg-elevated)', border: '1px solid var(--border-light)' }}>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</div>
                              {item.products && item.products.length > 0 && <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginTop: '2px' }}>{item.products.join(', ')}</div>}
                              {item.contactMasked && <div className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)', marginTop: '1px' }}>{item.contactMasked}</div>}
                            </div>
                            <button onClick={() => setSuppliers(suppliers.filter(x => x.id !== item.id))} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <button onClick={handleSaveNetwork} disabled={isSavingNet || (!productsList.length && !rivals.length && !customers.length && !suppliers.length)} style={{
                      background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
                      padding: '10px 16px', fontSize: '13px', fontWeight: 600, 
                      cursor: (isSavingNet || (!productsList.length && !rivals.length && !customers.length && !suppliers.length)) ? 'not-allowed' : 'pointer', 
                      opacity: (isSavingNet || (!productsList.length && !rivals.length && !customers.length && !suppliers.length)) ? 0.6 : 1,
                      alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                      {isSavingNet ? (language === 'mm' ? "သိမ်းနေသည်..." : "Saving...") : (language === 'mm' ? "လုပ်ငန်းကွန်ရက် သိမ်းဆည်းမည်" : "Save Network Map")}
                    </button>
                    {netSaveMsg && (
                      <div className="animate-fade-in" style={{ color: 'var(--positive)', fontSize: '12px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Check size={14} /> {netSaveMsg}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SALES HISTORY BULK IMPORT TAB PANEL */}
              {activeTab === 'sales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {language === 'mm' ? "အရောင်းဖိုင်တင်သွင်းရန် (CSV / Excel)" : "Upload Sales Report (CSV / Excel)"}
                    </h4>
                  </div>
                  
                  {uploadProgress ? (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{uploadProgress.step}</span>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-track)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress.value}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.2s' }} />
                      </div>
                    </div>
                  ) : (
                    <div 
                      onDragEnter={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragOver={handleDragOver} 
                      onDragLeave={handleDragLeave} 
                      onDrop={handleDrop}
                      style={{
                        padding: '32px 24px', border: '2px dashed var(--border-default)', borderRadius: '12px',
                        textAlign: 'center', background: isDragging ? 'var(--accent-soft)' : 'var(--bg-surface)',
                        transition: 'all 0.2s', cursor: 'pointer'
                      }}
                    >
                      <FileUp size={36} style={{ color: 'var(--text-tertiary)', margin: '0 auto 12px' }} />
                      <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileInputChange} style={{ display: 'none' }} id="modal-file-upload" />
                      <label htmlFor="modal-file-upload" style={{ background: 'var(--accent)', color: '#fff', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                        {language === 'mm' ? "ဖိုင်ရွေးချယ်ရန်" : "Select File"}
                      </label>
                      <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '12px' }}>
                        {language === 'mm' ? "သို့မဟုတ် ဤနေရာသို့ ဆွဲထည့်ပါ" : "or drag and drop here"}
                      </span>
                    </div>
                  )}

                  {businessProfile?.salesHistory && businessProfile.salesHistory.length > 0 && (
                    <div style={{ padding: '16px', background: 'var(--bg-elevated)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "လက်ရှိတင်သွင်းပြီးသားဖိုင်" : "Ingested History Status"}
                        </span>
                        <span className="mono" style={{ fontSize: '11px', background: 'rgba(92,123,107,0.1)', color: 'var(--positive)', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
                          {businessProfile.salesHistory.length} {language === 'mm' ? "ရက်မှတ်တမ်း" : "Days Loaded"}
                        </span>
                      </div>
                      {filePreview && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {filePreview.map((row, i) => (
                            <div key={i} className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                              <span>{row.date}</span>
                              <span className="font-number">{row.sales.toLocaleString()} MMK</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <button
                        onClick={handleResetSalesData}
                        style={{
                          marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px',
                          background: 'rgba(239, 68, 68, 0.1)', color: 'var(--critical)',
                          border: '1px solid rgba(239, 68, 68, 0.2)', padding: '8px 12px',
                          borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                          width: '100%', justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                        {language === 'mm' ? "တင်သွင်းထားသော စာရင်းဖျက်မည်" : "Reset Uploaded Data"}
                      </button>

                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
