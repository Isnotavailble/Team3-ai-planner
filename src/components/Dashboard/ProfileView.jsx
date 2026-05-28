import React, { useState } from 'react';
import { User, Globe, MessageCircle, Send, Users, Shield, LogOut, ChevronRight, Check } from 'lucide-react';
import { translations } from '../../data/translations';

export default function ProfileView({ workspace = {}, businessProfile = {}, setBusinessProfile, language = 'mm', setLanguage }) {
  const t = translations[language];

  // Telegram Linking State
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [connectionCode] = useState("L9-B28"); // Mock 6-character linking code

  // Shortcuts directories modales
  const [showCustomersModal, setShowCustomersModal] = useState(false);
  const [showSuppliersModal, setShowSuppliersModal] = useState(false);
  const [showAddMissingModal, setShowAddMissingModal] = useState(false);

  // New Data Fields for Modal
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');

  // Filter entities for directories
  const customers = businessProfile?.customers || [];
  const suppliers = businessProfile?.suppliers || [];

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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            {language === 'mm' ? "ဒေတာဖြည့်စွက်ရန်" : "Data Management"}
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
            {language === 'mm' ? "ဒေတာ အသစ်ထည့်မည်" : "Add Missing Data"}
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
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>{c.role || "Retail Buyer"}</div>
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
                    <div className="mono" style={{ fontSize: '9px', color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '2px' }}>{s.contactMasked || "Wholesaler"}</div>
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
          position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
        }}>
          <div style={{
            background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '440px',
            display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '500px', overflowY: 'auto'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "ဒေတာ အသစ်ထည့်မည်" : "Add Missing Data"}
              </h3>
              <button onClick={() => setShowAddMissingModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Add Customer</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Customer Name" value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none' }} />
                  <button onClick={() => {
                    if (newCustomerName) {
                      setBusinessProfile(prev => ({ ...prev, customers: [...(prev.customers||[]), { id: Date.now(), name: newCustomerName }] }));
                      setNewCustomerName('');
                    }
                  }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px' }}>Add</button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Add Supplier</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Supplier Name" value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none' }} />
                  <button onClick={() => {
                    if (newSupplierName) {
                      setBusinessProfile(prev => ({ ...prev, suppliers: [...(prev.suppliers||[]), { id: Date.now(), name: newSupplierName, contactMasked: '***' }] }));
                      setNewSupplierName('');
                    }
                  }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 16px' }}>Add</button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
