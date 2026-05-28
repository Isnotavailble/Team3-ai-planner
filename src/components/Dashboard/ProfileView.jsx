import React, { useState } from 'react';
import { Globe, MessageCircle, Send, Check, FileUp, Settings } from 'lucide-react';
import { translations } from '../../data/translations';
import { importSalesFile } from '../../utils/salesImporter';

export default function ProfileView({ workspace = {}, businessProfile = {}, setBusinessProfile, language = 'mm', setLanguage }) {
  const t = translations[language] || translations['en'];

  // Telegram Linking State
  const [telegramLinked, setTelegramLinked] = useState(false);
  const [connectionCode] = useState("L9-B28"); // Mock 6-character linking code

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'sales'
  
  const [inventoryLow, setInventoryLow] = useState(businessProfile?.thresholds?.inventoryLow || 10);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

  const handleSaveThreshold = () => {
    setBusinessProfile(prev => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        inventoryLow: parseInt(inventoryLow) || 10
      }
    }));
    setShowSettingsModal(false);
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

      {/* SALES & INVENTORY SETTINGS */}
      <section className="space-y-4">
        <h3 className="mono" style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {language === 'mm' ? "အရောင်းနှင့် ကုန်ပစ္စည်း စီမံခန့်ခွဲမှု" : "Sales & Inventory Settings"}
        </h3>
        <div style={{
          background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)',
          borderRadius: '16px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', textAlign: 'center'
        }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {language === 'mm' ? "ကုန်ပစ္စည်း သတ်မှတ်ချက်များနှင့် အရောင်းဖိုင် (CSV) တင်သွင်းရန်" : "Manage inventory alert thresholds and upload offline sales records."}
          </span>
          <button onClick={() => setShowSettingsModal(true)} style={{
            background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px',
            padding: '10px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <Settings size={16} />
            {language === 'mm' ? "ဆက်တင်များ ပြင်ဆင်ရန်" : "System Settings"}
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
            borderRadius: '24px', padding: '24px', width: '100%', maxWidth: '520px',
            display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '90vh', overflowY: 'auto'
          }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {language === 'mm' ? "ဆက်တင်များ" : "System Settings"}
              </h3>
              <button onClick={() => setShowSettingsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: 'var(--text-tertiary)' }}>&times;</button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
              {[
                { id: 'inventory', labelMm: 'ကုန်ပစ္စည်း သတ်မှတ်ချက်', labelEn: 'Inventory Alerts' },
                { id: 'sales', labelMm: 'အရောင်းဖိုင် တင်သွင်းရန်', labelEn: 'Sales Upload' }
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
              {/* INVENTORY THRESHOLD TAB PANEL */}
              {activeTab === 'inventory' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {language === 'mm' ? "ကုန်ပစ္စည်းလက်ကျန် အနည်းဆုံးသတ်မှတ်ချက် (Threshold)" : "Inventory Low Threshold"}
                    </label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="number" value={inventoryLow} onChange={e => setInventoryLow(e.target.value)}
                        style={{ width: '80px', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', outline: 'none', fontSize: '14px', background: 'var(--bg-base)' }} />
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
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                      {language === 'mm' ? "အရောင်းဖိုင်တင်သွင်းရန် (CSV / Excel)" : "Upload Sales Report (CSV / Excel)"}
                    </h4>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      {language === 'mm' ? "နောက်ဆုံး ၃၀ ရက်အထိ အရောင်းမှတ်တမ်းဖိုင် တင်သွင်းရန်" : "Supports CSV/Excel files (up to 30 days history)"}
                    </p>
                  </div>
                  
                  {uploadProgress ? (
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', background: 'var(--bg-elevated)', borderRadius: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{uploadProgress.step}</span>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-track)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${uploadProgress.value}%`, height: '100%', background: 'var(--accent)', transition: 'width 0.2s' }} />
                      </div>
                    </div>
                  ) : (
                    <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
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
