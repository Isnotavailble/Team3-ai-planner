import React, { useState } from 'react';
import { Package, Users, Truck, ShieldAlert, Search, Plus, Trash2 } from 'lucide-react';
import { translations } from '../../data/translations';

export default function DirectoryView({ businessProfile = {}, setBusinessProfile, language = 'mm' }) {
  const t = translations[language] || translations['en'];
  
  const tabs = [
    { id: 'products', label: language === 'mm' ? "ထုတ်ကုန်များ" : "Products", icon: Package, data: businessProfile.products || [] },
    { id: 'suppliers', label: language === 'mm' ? "ကုန်ကြမ်းပေးသွင်းသူများ" : "Suppliers", icon: Truck, data: businessProfile.suppliers || [] },
    { id: 'customers', label: language === 'mm' ? "ဖောက်သည်များ" : "Customers", icon: Users, data: businessProfile.customers || [] },
    { id: 'rivals', label: language === 'mm' ? "ပြိုင်ဘက်များ" : "Competitors", icon: ShieldAlert, data: businessProfile.rivals || [] }
  ];

  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierProducts, setNewSupplierProducts] = useState('');
  const [newSupplierContact, setNewSupplierContact] = useState('');

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerContact, setNewCustomerContact] = useState('');

  const [newRivalName, setNewRivalName] = useState('');
  const [newRivalPricing, setNewRivalPricing] = useState('Same');

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

  const handleAddProduct = () => {
    if (newProductName && newProductPrice && setBusinessProfile) {
      setBusinessProfile(prev => ({
        ...prev,
        products: [...(prev.products || []), { id: Date.now(), type: 'product', name: newProductName, price: parseFloat(newProductPrice) || 0 }]
      }));
      setNewProductName(''); setNewProductPrice('');
    }
  };

  const handleAddSupplier = () => {
    if (newSupplierName && setBusinessProfile) {
      setBusinessProfile(prev => ({
        ...prev,
        suppliers: [...(prev.suppliers || []), { 
          id: Date.now(), type: 'supplier', name: newSupplierName, 
          products: newSupplierProducts.split(',').map(s => s.trim()).filter(Boolean),
          contactMasked: maskContact(newSupplierContact)
        }]
      }));
      setNewSupplierName(''); setNewSupplierProducts(''); setNewSupplierContact('');
    }
  };

  const handleAddCustomer = () => {
    if (newCustomerName && setBusinessProfile) {
      setBusinessProfile(prev => ({
        ...prev,
        customers: [...(prev.customers || []), { id: Date.now(), type: 'customer', name: newCustomerName, contact: newCustomerContact }]
      }));
      setNewCustomerName(''); setNewCustomerContact('');
    }
  };

  const handleAddRival = () => {
    if (newRivalName && setBusinessProfile) {
      setBusinessProfile(prev => ({
        ...prev,
        rivals: [...(prev.rivals || []), { id: Date.now(), name: newRivalName, audience: 'General', pricing: newRivalPricing }]
      }));
      setNewRivalName(''); setNewRivalPricing('Same');
    }
  };

  const handleDelete = (type, id) => {
    if (!setBusinessProfile) return;
    setBusinessProfile(prev => ({
      ...prev,
      [type]: (prev[type] || []).filter(item => item.id !== id)
    }));
  };

  const activeData = tabs.find(t => t.id === activeTab)?.data || [];
  
  const filteredData = activeData.filter(item => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return item.name?.toLowerCase().includes(q) || 
           item.contact?.toLowerCase().includes(q) || 
           item.contactMasked?.toLowerCase().includes(q);
  });

  const renderAddForm = () => {
    const inputStyle = { flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-default)', background: 'var(--bg-base)', outline: 'none', fontSize: '13px' };
    const btnStyle = { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, fontSize: '13px', transition: 'opacity 0.2s' };

    if (activeTab === 'products') {
      return (
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
          <input type="text" placeholder={language === 'mm' ? "ထုတ်ကုန်အမည် အသစ်" : "New Product Name"} value={newProductName} onChange={e => setNewProductName(e.target.value)} style={inputStyle} />
          <input type="number" placeholder={language === 'mm' ? "စျေးနှုန်း (MMK)" : "Price (MMK)"} value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} style={{...inputStyle, width: '160px'}} />
          <button onClick={handleAddProduct} style={btnStyle}><Plus size={16} /> {language === 'mm' ? "ထည့်မည်" : "Add"}</button>
        </div>
      );
    }
    if (activeTab === 'suppliers') {
      return (
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
          <input type="text" placeholder={language === 'mm' ? "ပေးသွင်းသူအမည်" : "Supplier Name"} value={newSupplierName} onChange={e => setNewSupplierName(e.target.value)} style={inputStyle} />
          <input type="text" placeholder={language === 'mm' ? "ကုန်ကြမ်းများ (ကော်မာ ခံရေးပါ)" : "Supplies (comma separated)"} value={newSupplierProducts} onChange={e => setNewSupplierProducts(e.target.value)} style={inputStyle} />
          <input type="text" placeholder={language === 'mm' ? "ဖုန်း သို့မဟုတ် အီးမေးလ်" : "Contact"} value={newSupplierContact} onChange={e => setNewSupplierContact(e.target.value)} style={{...inputStyle, width: '160px'}} />
          <button onClick={handleAddSupplier} style={btnStyle}><Plus size={16} /> {language === 'mm' ? "ထည့်မည်" : "Add"}</button>
        </div>
      );
    }
    if (activeTab === 'customers') {
      return (
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
          <input type="text" placeholder={language === 'mm' ? "ဖောက်သည်အမည်" : "Customer Name"} value={newCustomerName} onChange={e => setNewCustomerName(e.target.value)} style={inputStyle} />
          <input type="text" placeholder={language === 'mm' ? "ဖုန်း သို့မဟုတ် အီးမေးလ်" : "Contact (Phone/Email)"} value={newCustomerContact} onChange={e => setNewCustomerContact(e.target.value)} style={inputStyle} />
          <button onClick={handleAddCustomer} style={btnStyle}><Plus size={16} /> {language === 'mm' ? "ထည့်မည်" : "Add"}</button>
        </div>
      );
    }
    if (activeTab === 'rivals') {
      return (
        <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-surface)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-default)', width: 'fit-content' }}>
          <input type="text" placeholder={language === 'mm' ? "ပြိုင်ဘက်အမည်" : "Competitor Name"} value={newRivalName} onChange={e => setNewRivalName(e.target.value)} style={inputStyle} />
          <select value={newRivalPricing} onChange={e => setNewRivalPricing(e.target.value)} style={{...inputStyle, width: '220px', cursor: 'pointer'}}>
            <option value="Lower">{language === 'mm' ? "ကျွန်ုပ်တို့ထက် စျေးသက်သာ" : "Lower than our product"}</option>
            <option value="Same">{language === 'mm' ? "စျေးတူ" : "Same as our product"}</option>
            <option value="Higher">{language === 'mm' ? "ကျွန်ုပ်တို့ထက် စျေးပိုကြီး" : "Higher than our product"}</option>
          </select>
          <button onClick={handleAddRival} style={btnStyle}><Plus size={16} /> {language === 'mm' ? "ထည့်မည်" : "Add"}</button>
        </div>
      );
    }
    return null;
  };

  const renderContent = () => {
    if (filteredData.length === 0) {
      return (
        <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-tertiary)', border: '1px dashed var(--border-default)', borderRadius: '12px' }}>
          {language === 'mm' ? "အချက်အလက် မရှိပါ" : "No data found. Add some above!"}
        </div>
      );
    }

    if (activeTab === 'products') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 320px)', gap: '16px' }}>
          {filteredData.map(p => (
            <div key={p.id} className="group" style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</h4>
                <p className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Product</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span className="font-number" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>{p.price}</span>
                  <span className="mono" style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginLeft: '4px' }}>MMK</span>
                </div>
                <button onClick={() => handleDelete('products', p.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px', opacity: 0.6 }}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'suppliers') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 360px)', gap: '16px' }}>
          {filteredData.map(s => (
            <div key={s.id} style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{s.name}</h4>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {language === 'mm' ? "ပေးသွင်းသောကုန်ကြမ်း: " : "Supplies: "}{s.products?.join(', ') || 'N/A'}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div className="mono" style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {s.contactMasked || 'No Contact'}
                </div>
                <button onClick={() => handleDelete('suppliers', s.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px', opacity: 0.6 }}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'customers') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 320px)', gap: '16px' }}>
          {filteredData.map(c => (
            <div key={c.id} style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <Users size={16} />
                  </div>
                  <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{c.name}</h4>
                </div>
                {c.contact && (
                  <div className="mono" style={{ fontSize: '12px', color: 'var(--text-tertiary)', paddingLeft: '44px' }}>
                    {c.contact}
                  </div>
                )}
              </div>
              <button onClick={() => handleDelete('customers', c.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px', opacity: 0.6 }}><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'rivals') {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 360px)', gap: '16px' }}>
          {filteredData.map(r => (
            <div key={r.id} style={{ padding: '20px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</h4>
                <p className="mono" style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {r.audience}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {language === 'mm' ? (r.pricing?.includes('Lower') ? 'ကျွန်ုပ်တို့ထက် စျေးသက်သာ' : r.pricing?.includes('Higher') ? 'ကျွန်ုပ်တို့ထက် စျေးပိုကြီး' : 'စျေးတူ') : r.pricing}
                  </span>
                </div>
                <button onClick={() => handleDelete('rivals', r.id)} style={{ background: 'none', border: 'none', color: 'var(--critical)', cursor: 'pointer', padding: '4px', opacity: 0.6 }}><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {language === 'mm' ? "လုပ်ငန်း အချက်အလက်များ" : "Data Directory"}
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {language === 'mm' ? "သင့်လုပ်ငန်း၏ ထုတ်ကုန်များ၊ ဖောက်သည်များနှင့် ပြိုင်ဘက်များကို စီမံပါ" : "Manage and view your full list of products, suppliers, customers, and competitors."}
          </p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Toolbar: Tabs & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSearchQuery(''); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: isActive ? 'var(--accent-soft)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: isActive ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Icon size={16} />
                  {tab.label}
                  <span style={{ 
                    background: isActive ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                    padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                    marginLeft: '4px'
                  }}>
                    {tab.data.length}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
            <input 
              type="text" 
              placeholder={language === 'mm' ? "ရှာဖွေရန်..." : "Search directory..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Add Entry Form area */}
        {renderAddForm()}

        {/* Content Area */}
        <div className="animate-fade-in">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
