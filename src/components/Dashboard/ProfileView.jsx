import React, { useState } from 'react';
import { User, Globe, MessageCircle, Send, Users, Shield, LogOut, ChevronRight, Check, Package, FileUp, Plus, Trash2 } from 'lucide-react';
import { translations } from '../../data/translations';
import { importSalesFile } from '../../utils/salesImporter';

export default function ProfileView({ workspace = {}, businessProfile = {}, setBusinessProfile, language = 'mm', setLanguage }) {
  const t = translations[language] || translations['en'];

  // Telegram Linking State
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [connectionCode] = useState("L9-B28"); // Mock 6-character linking code

  // Shortcuts directories modales
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [showAddMissingModal, setShowAddMissingModal] = useState(false);

  // Active Tab for Add Missing Data Modal
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'products' | 'suppliers' | 'inventory' | 'sales'

  // New Data Fields for Modal
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierProducts, setNewSupplierProducts] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');
  
  const [inventoryLow, setInventoryLow] = useState(businessProfile?.thresholds?.inventoryLow || 10);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  // Filter entities for directories
  const customers = businessProfile?.customers || [];
  const suppliers = businessProfile?.suppliers || [];
  const products = businessProfile?.products || [];

  // Mask contact for privacy
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

  const handleAddCustomer = () => {
    if (newCustomerName) {
      setBusinessProfile(prev => ({
        ...prev,
        customers: [...(prev.customers || []), { 
          id: Date.now(), 
          type: 'customer', 
          name: newCustomerName, 
          contact: newCustomerContact 
        }]
      }));
      setNewCustomerName('');
      setNewCustomerContact('');
    }
  };

  const handleDeleteCustomer = (id) => {
    setBusinessProfile(prev => ({
      ...prev,
      customers: (prev.customers || []).filter(c => c.id !== id)
    }));
  };

  const handleAddProduct = () => {
    if (newProductName && newProductPrice) {
      setBusinessProfile(prev => ({
        ...prev,
        products: [...(prev.products || []), { 
          id: Date.now(), 
          type: 'product', 
          name: newProductName, 
          price: parseFloat(newProductPrice) || 0 
        }]
      }));
      setNewProductName('');
      setNewProductPrice('');
    }
  };

  const handleDeleteProduct = (id) => {
    setBusinessProfile(prev => ({
      ...prev,
      products: (prev.products || []).filter(p => p.id !== id)
    }));
  };

  const handleAddSupplier = () => {
    if (newSupplierName) {
      setBusinessProfile(prev => ({
        ...prev,
        suppliers: [...(prev.suppliers || []), { 
          id: Date.now(), 
          type: 'supplier', 
          name: newSupplierName, 
          products: newSupplierProducts.split(',').map(s => s.trim()).filter(Boolean),
          contactMasked: maskContact(newSupplierContact)
        }]
      }));
      setNewSupplierName('');
      setNewSupplierProducts('');
      setNewSupplierContact('');
    }
  };

  const handleDeleteSupplier = (id) => {
    setBusinessProfile(prev => ({
      ...prev,
      suppliers: (prev.suppliers || []).filter(s => s.id !== id)
    }));
  };

  const handleSaveThreshold = () => {
    setBusinessProfile(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        inventoryLow: parseInt(inventoryLow) || 10
      }
    }));
  };

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
  const processSalesFile = async (file) => {
    setUploadProgress({ step: language === 'mm' ? 'AI ဖြင့် အရောင်းမှတ်တမ်းများ ဆန်းစစ်နေပါသည်...' : 'AI parsing sales history...', value: 40 });
    setTimeout(async () => {
      setUploadProgress({ step: language === 'mm' ? 'အချက်အလက်များ သိမ်းဆည်းနေပါသည်...' : 'Saving parsed sales records...', value: 80 });
      try {
        const data = await importSalesFile(file);
        setBusinessProfile(prev => ({
          ...prev,
          salesHistory: data
        }));
        setFilePreview(data.slice(0, 5));
        setUploadProgress(null);
      } catch (err) {
        alert(err.message);
        setUploadProgress(null);
      }
    }, 1000);
  };

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
          {businessProfile?.product ? businessProfile.product.slice(0, 1) : "A"}
        </div>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {businessProfile?.product ? `${businessProfile.product} ${language === 'mm' ? "လုပ်ငန်း" : "Enterprise"}` : "Aung Kyaw Store"}
          </h1>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t.businessType}: {businessProfile?.product || (language === 'mm' ? "ကုန်စုံဆိုင်" : "General Store")}
          </p>
          <span className="mono" style={{
            fontSize: '9px', background: 'rgba(0,0,0,0.05)', padding: '2px 8px',
            borderRadius: '10px', textTransform: 'uppercase', display: 'inline-block', marginTop: '6px'
          }}>
            {t.posStatus}: {businessProfile?.hasPOS ? (language === 'mm' ? "အသုံးပြုပါသည်" : "WITH POS") : (language === 'mm' ? "လက်စွဲ စာရင်းသွင်းသည်" : "WITHOUT POS")}
          </span>
        </div>
      </header>

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
            onClick={() => setLanguage('mm')}
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
            onClick={() => setLanguage('en')}
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
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {language === 'mm' ? "ချိတ်ဆက်ထားသော စနစ်များ" : "Integrations & Channels"}
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Telegram Bot */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Send size={18} style={{ color: '#0088cc' }} />
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {t.telegramLink}
                  </h4>
                  <p className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>@LatticeMyanmarBot</p>
                </div>
              </div>

              <button
                onClick={() => setTelegramLinked(!telegramLinked)}
                style={{
                  padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-default)',
                  background: telegramLinked ? 'rgba(92, 123, 107, 0.1)' : 'transparent',
                  color: telegramLinked ? 'var(--positive)' : 'var(--text-secondary)',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {telegramLinked ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={12} /> {t.linkedStatus}</span>
                ) : (
                  language === 'mm' ? "ချိတ်ဆက်မည်" : "Connect Bot"
                )}
              </button>
            </div>

            {!telegramLinked && (
              <div style={{
                background: 'var(--bg-elevated)', borderRadius: '8px', padding: '12px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {t.viberInstructions}
                </span>
                <div style={{ textAlign: 'right' }}>
                  <span className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{t.telegramCodeLabel}</span>
                  <div className="font-number" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{connectionCode}</div>
                </div>
              </div>
            )}
          </div>

          {/* Viber share setup */}
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '12px'
          }}>
            <MessageCircle size={20} style={{ color: '#7360F2' }} />
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {t.viberLink}
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {t.viberInstructions}
              </p>
            </div>
            <span className="mono" style={{ fontSize: '9px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>SHARE SHEET</span>
          </div>

        </div>
      </section>

      {/* SHORTCUTS DIRECTORIES */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {t.shortcuts}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {/* Customers Directory */}
          <button 
            onClick={() => setShowCustomersModal(true)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <Users size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{t.customersList}</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {/* Products Directory */}
          <button 
            onClick={() => setShowProductsModal(true)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <Package size={16} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{t.productsList}</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
          </button>

          {/* Suppliers Directory */}
          <button 
            onClick={() => setShowSuppliersModal(true)}
            style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
              borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)' }}>
              <Shield size={16} style={{ color: 'var(--positive)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{t.suppliersList}</span>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
          </button>
        </div>
      </section>

      {/* ADD MISSING DATA SECTION */}
      <section className="space-y-4">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
            {t.addDataManagement}
          </h3>
        </div>
        <div style={{
          background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {language === 'mm' ? "Onboarding တွင် ကျော်ခဲ့သော အချက်အလက်များကို ထပ်မံဖြည့်စွက်နိုင်ပါသည်။" : "Insert any data skipped during the onboarding setup."}
          </span>
          <button onClick={() => setShowAddMissingModal(true)} style={{
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer'
          }}>
            {t.addMissingDataBtn}
          </button>
        </div>
      </section>

      {/* EXIT & DATA */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
        <button style={{
          background: 'none', border: 'none', color: 'var(--text-secondary)',
          textDecoration: 'underline', fontSize: '12px', cursor: 'pointer'
        }}>
          {t.dataPrivacy}
        </button>
        
        <button style={{
          background: 'none', border: 'none', color: 'var(--critical)',
          display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px',
          fontWeight: 600, cursor: 'pointer'
        }}>
          <LogOut size={14} /> {t.signOut}
        </button>
      </section>

      {/* CUSTOMERS DIRECTORY MODAL POPUP */}
      {showCustomersModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.customersList}</h3>
              <button onClick={() => setShowCustomersModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {customers.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  {language === 'mm' ? "ဖောက်သည် မတွေ့ရှိသေးပါ" : "No customer records active."}
                </p>
              ) : (
                customers.map((c, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{c.name}</div>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>{c.contact ? maskContact(c.contact) : "Retail Buyer"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* PRODUCTS DIRECTORY MODAL POPUP */}
      {showProductsModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.productsList}</h3>
              <button onClick={() => setShowProductsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {products.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  {language === 'mm' ? "ထုတ်ကုန် မတွေ့ရှိသေးပါ" : "No product records active."}
                </p>
              ) : (
                products.map((p, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="font-number" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>{p.price.toLocaleString()} MMK</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUPPLIERS DIRECTORY MODAL POPUP */}
      {showSuppliersModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '450px'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{t.suppliersList}</h3>
              <button onClick={() => setShowSuppliersModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>
            
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {suppliers.length === 0 ? (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                  {language === 'mm' ? "ကုန်ပစ္စည်း ပံ့ပိုးသူ မရှိသေးပါ" : "No suppliers identified in dataset."}
                </p>
              ) : (
                suppliers.map((s, idx) => (
                  <div key={idx} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>{s.contactMasked || maskContact(s.contact) || "Wholesaler"}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD MISSING DATA MODAL POPUP */}
      {showAddMissingModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '520px',
            display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? t.addMissingDataModalTitle : t.addMissingDataModalTitle}
              </h3>
              <button onClick={() => setShowAddMissingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px', overflowX: 'auto' }}>
              {[
                { id: 'customers', labelMm: 'ဖောက်သည်', labelEn: 'Customers' },
                { id: 'products', labelMm: 'ထုတ်ကုန်', labelEn: 'Products' },
                { id: 'suppliers', labelMm: 'ပံ့ပိုးသူ', labelEn: 'Suppliers' },
                { id: 'inventory', labelMm: 'သတ်မှတ်ချက်', labelEn: 'Threshold' },
                { id: 'sales', labelMm: 'အရောင်းဖိုင်', labelEn: 'Sales History' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '6px 12px', border: 'none', borderRadius: '6px', cursor: 'pointer',
                    fontSize: '12px', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
                    background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
                    color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {language === 'mm' ? tab.labelMm : tab.labelEn}
                </button>
              ))}
            </div>
            
            <div style={{ minHeight: '260px' }}>
              {/* CUSTOMERS TAB PANEL */}
              {activeTab === 'customers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? t.addCustomer : t.addCustomer}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder={language === 'mm' ? "ဖောက်သည်အမည်" : "Customer Name"} value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px' }} />
                      <input type="text" placeholder={language === 'mm' ? "ဖုန်း သို့မဟုတ် အီးမေးလ်" : "Phone or Email"} value={newCustomerContact} onChange={e => setNewCustomerContact(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px' }} />
                      <button onClick={handleAddCustomer} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer' }}><Plus size={16}/></button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "လက်ရှိ ဖောက်သည်များ" : "Current Customers"} ({customers.length})
                    </label>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {customers.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>
                          {language === 'mm' ? "ဖောက်သည် မရှိသေးပါ" : "No customers active."}
                        </p>
                      ) : (
                        customers.map(c => (
                          <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</span>
                              {c.contact && <span className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>({maskContact(c.contact)})</span>}
                            </div>
                            <button onClick={() => handleDeleteCustomer(c.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB PANEL */}
              {activeTab === 'products' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? t.addProduct : t.addProduct}
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder={language === 'mm' ? "ထုတ်ကုန်အမည်" : "Product Name"} value={newProductName} onChange={e => setNewProductName(e.target.value)}
                        style={{ flex: 2, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px' }} />
                      <input type="number" placeholder={language === 'mm' ? "စျေးနှုန်း (MMK)" : "Price (MMK)"} value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px' }} />
                      <button onClick={handleAddProduct} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer' }}><Plus size={16}/></button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "လက်ရှိ ထုတ်ကုန်များ" : "Current Products"} ({products.length})
                    </label>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {products.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>
                          {language === 'mm' ? "ထုတ်ကုန် မရှိသေးပါ" : "No products active."}
                        </p>
                      ) : (
                        products.map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                              <span className="font-number" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>{p.price.toLocaleString()} MMK</span>
                            </div>
                            <button onClick={() => handleDeleteProduct(p.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUPPLIERS TAB PANEL */}
              {activeTab === 'suppliers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? t.addSupplier : t.addSupplier}
                    </label>
                    <input type="text" placeholder={language === 'mm' ? "ကုန်ပစ္စည်း ပံ့ပိုးသူအမည်" : "Supplier Name"} value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px', marginBottom: '4px' }} />
                    <input type="text" placeholder={language === 'mm' ? "ပံ့ပိုးသော ကုန်ပစ္စည်းများ (ကော်မာ ခံရေးပါ)" : "Supplied Products (comma separated)"} value={newSupplierProducts} onChange={e => setNewSupplierProducts(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px', marginBottom: '4px' }} />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="text" placeholder={language === 'mm' ? "ဖုန်း သို့မဟုတ် အီးမေးလ်" : "Phone or Email"} value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)}
                        style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px' }} />
                      <button onClick={handleAddSupplier} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px', cursor: 'pointer', fontWeight: 600 }}>{language === 'mm' ? "ထည့်မည်" : "Add"}</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "လက်ရှိ ပံ့ပိုးသူများ" : "Current Suppliers"} ({suppliers.length})
                    </label>
                    <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {suppliers.length === 0 ? (
                        <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', textAlign: 'center', padding: '12px' }}>
                          {language === 'mm' ? "ပံ့ပိုးသူ မရှိသေးပါ" : "No suppliers active."}
                        </p>
                      ) : (
                        suppliers.map(s => (
                          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                            <div>
                              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</span>
                              {s.products && s.products.length > 0 && <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '8px' }}>({s.products.join(', ')})</span>}
                            </div>
                            <button onClick={() => handleDeleteSupplier(s.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer' }}><Trash2 size={14} /></button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* INVENTORY THRESHOLD TAB PANEL */}
              {activeTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ကုန်ပစ္စည်းလက်ကျန် အနည်းဆုံးသတ်မှတ်ချက် (Threshold)" : "Inventory Low Threshold"}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="number" value={inventoryLow} onChange={e => setInventoryLow(e.target.value)}
                        style={{ width: '80px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '13px' }} />
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {language === 'mm' ? "ခုအောက်ရောက်ပါက အချက်ပေးရန်" : "items (alert when drops below this)"}
                      </span>
                    </div>
                  </div>
                  <button onClick={handleSaveThreshold} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', alignSelf: 'flex-start' }}>
                    {language === 'mm' ? "သိမ်းဆည်းမည်" : "Save Threshold"}
                  </button>
                </div>
              )}

              {/* SALES HISTORY BULK IMPORT TAB PANEL */}
              {activeTab === 'sales' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {language === 'mm' ? "အရောင်းဖိုင်တင်သွင်းရန် (CSV / Excel)" : "Upload Sales Report (CSV / Excel)"}
                    </h4>
                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {language === 'mm' ? "နောက်ဆုံး ၃၀ ရက်အထိ အရောင်းမှတ်တမ်းဖိုင် တင်သွင်းရန်" : "Supports CSV/Excel files (up to 30 days history)"}
                    </p>
                  </div>
                  
                  {uploadProgress ? (
                    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>{uploadProgress.step}</span>
                      <div style={{ width: '100%', height: '4px', background: 'var(--bg-track)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress.value}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.2s' }} />
                      </div>
                    </div>
                  ) : (
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
                      style={{
                        padding: '24px', border: '2px dashed var(--border-default)', borderRadius: '12px',
                        textAlign: 'center', background: isDragging ? 'var(--accent-soft)' : 'var(--bg-surface)',
                        transition: 'all 0.2s', cursor: 'pointer'
                      }}
                    >
                      <FileUp size={32} style={{ color: 'var(--text-tertiary)', margin: '0 auto 8px' }} />
                      <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileInputChange} style={{ display: 'none' }} id="modal-file-upload" />
                      <label htmlFor="modal-file-upload" style={{ background: 'var(--accent)', color: '#fff', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-block' }}>
                        {language === 'mm' ? "ဖိုင်ရွေးချယ်ရန်" : "Select File"}
                      </label>
                      <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                        {language === 'mm' ? "သို့မဟုတ် ဤနေရာသို့ ဆွဲထည့်ပါ" : "or drag and drop here"}
                      </span>
                    </div>
                  )}

                  {businessProfile?.salesHistory && businessProfile.salesHistory.length > 0 && (
                    <div style={{ padding: '12px', background: 'var(--bg-elevated)', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {language === 'mm' ? "လက်ရှိတင်သွင်းပြီးသားဖိုင်" : "Ingested History Status"}
                        </span>
                        <span className="mono" style={{ fontSize: '10px', background: 'rgba(92,123,107,0.1)', color: 'var(--positive)', padding: '2px 6px', borderRadius: '4px' }}>
                          {businessProfile.salesHistory.length} {language === 'mm' ? "ရက်မှတ်တမ်း" : "Days Loaded"}
                        </span>
                      </div>
                      {filePreview && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {filePreview.map((row, i) => (
                            <div key={i} className="mono" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                              <span>{row.date}</span>
                              <span>{row.sales.toLocaleString()} MMK</span>
                            </div>
                          ))}
                        </div>
                      )}
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
