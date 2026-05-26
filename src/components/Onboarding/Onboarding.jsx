import React, { useState, useEffect, useRef } from 'react';
import { FileUp, Link2, CheckSquare, Square, ChevronRight, Info, Lock, Clock, ShieldCheck, Send, User } from 'lucide-react';

const REQUIRED_FIELDS = [
  { id: 'businessType', label: 'Business Type', prompt: 'What type of business do you run? (e.g. Retailer, Tech Platform)' },
  { id: 'productService', label: 'Product/Service', prompt: 'What specific products or services do you offer?' },
  { id: 'businessChallenges', label: 'Business Challenges', prompt: 'What are your primary business challenges or bottlenecks right now?' },
  { id: 'dailySales', label: 'Daily Sales', prompt: 'What are your average daily sales (or volume)?' },
  { id: 'monthlyRevenue', label: 'Monthly Revenue', prompt: 'What is your average monthly revenue?' },
  { id: 'budget', label: 'Budget', prompt: 'What is your current budget for marketing and operations?' },
  { id: 'customerInfo', label: 'Customer Information', prompt: 'Tell me about your target customers or audience.' },
  { id: 'marketingActivities', label: 'Marketing Activities', prompt: 'What marketing activities or channels do you currently use?' }
];

export default function Onboarding({ onImportComplete, onSkipToSandbox }) {
  const [manualText, setManualText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); 
  const [importStatus, setImportStatus] = useState(null); // null, 'parsing', 'chatbot', 'review'
  
  const [detectedEntities, setDetectedEntities] = useState([]);
  const [approvedEntities, setApprovedEntities] = useState(new Set());

  const [businessProfile, setBusinessProfile] = useState({});
  const [missingFields, setMissingFields] = useState([]);
  const [currentMissingIdx, setCurrentMissingIdx] = useState(0);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef(null);

  const [setupStatus, setSetupStatus] = useState(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, importStatus]);

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

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput) return;
    startImportProcess('url');
  };

  const handleManualOnboardingSubmit = () => {
    if (!manualText.trim()) return;
    startImportProcess('text');
  };

  const startImportProcess = (method) => {
    setImportStatus('parsing');
    setUploadProgress({ step: 'AI parsing business context...', value: 30 });
    
    setTimeout(() => {
      setUploadProgress({ step: 'Verifying required data points...', value: 70 });
      
      setTimeout(() => {
        setUploadProgress(null);
        
        // Mock AI parsing: some fields found, some missing.
        let parsedProfile = {};
        let missing = [];

        if (method === 'text') {
          parsedProfile = {
            businessType: 'B2B Platform',
            productService: 'Software',
          };
          missing = REQUIRED_FIELDS.filter(f => !parsedProfile[f.id]);
        } else if (method === 'url') {
          parsedProfile = {
            businessType: 'Retail/E-commerce',
            productService: 'Consumer Goods',
            marketingActivities: 'SEO, Ads',
            customerInfo: 'General public'
          };
          missing = REQUIRED_FIELDS.filter(f => !parsedProfile[f.id]);
        } else {
          // File upload gives random fields
          parsedProfile = {
            dailySales: '150 orders',
            monthlyRevenue: '$45,000',
            businessType: 'Wholesale'
          };
          missing = REQUIRED_FIELDS.filter(f => !parsedProfile[f.id]);
        }

        setBusinessProfile(parsedProfile);

        if (missing.length > 0) {
          setMissingFields(missing);
          setCurrentMissingIdx(0);
          setChatMessages([
            { sender: 'AI', text: `I parsed your input, but to run a full probability simulation, I still need a few more details.` },
            { sender: 'AI', text: missing[0].prompt }
          ]);
          setImportStatus('chatbot');
        } else {
          // All fields found
          setImportStatus('review');
        }

      }, 1500);
    }, 1200);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const currentField = missingFields[currentMissingIdx];
    
    setChatMessages(prev => [...prev, { sender: 'YOU', text: chatInput }]);
    
    setBusinessProfile(prev => ({
      ...prev,
      [currentField.id]: chatInput
    }));
    
    setChatInput('');

    // Move to next question or finish
    setTimeout(() => {
      if (currentMissingIdx + 1 < missingFields.length) {
        const nextField = missingFields[currentMissingIdx + 1];
        setChatMessages(prev => [...prev, { sender: 'AI', text: nextField.prompt }]);
        setCurrentMissingIdx(prev => prev + 1);
      } else {
        setChatMessages(prev => [...prev, { sender: 'AI', text: 'Great! I have all the information needed to construct your workspace.' }]);
        setTimeout(() => {
          setSetupStatus('loading');
          setTimeout(() => {
            onImportComplete(businessProfile);
          }, 1000);
        }, 1500);
      }
    }, 600);
  };

  const handleMergeApproved = () => {
    const list = detectedEntities.filter(e => approvedEntities.has(e.id));
    setSetupStatus('loading');
    setTimeout(() => {
      onImportComplete(businessProfile);
    }, 1000);
  };

  const toggleApprovedEntity = (id) => {
    setApprovedEntities(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  if (setupStatus === 'loading') {
    return (
      <div className="animate-fade-in light-mesh-bg" style={{
        width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div className="breathing-logo" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '64px', height: '64px', borderRadius: '16px', background: 'var(--text-primary)'
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '24px' }}>L</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in light-mesh-bg" style={{
      width: '100%', height: '100%', position: 'absolute', inset: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px'
    }}>
      <div className="glass-card flex" style={{
        width: '100%', maxWidth: '1200px', flex: 1, maxHeight: '720px',
        overflow: 'hidden'
      }}>
        {/* LEFT PANEL */}
        <div className="flex-1 flex flex-col" style={{
          padding: '64px', borderRight: '1px solid rgba(0,0,0,0.06)',
          overflowY: 'auto'
        }}>
          <div style={{ maxWidth: '440px', margin: 'auto', width: '100%' }}>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: '16px' }}>
              LATTICE SETUP · INVOICES / REPORTS
            </div>
            <h1 style={{ fontSize: '32px', letterSpacing: '-0.04em', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Import SME Data
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '40px', fontSize: '14px', lineHeight: 1.6 }}>
              Drop local B2B order spreadsheets or supplier invoices. AI will extract your market profile and ask you for any missing strategic details.
            </p>

            {importStatus === null && (
              <>
                <div className="flex flex-col gap-5">
                  <div
                    className={`drop-zone ${isDragging ? 'active' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                      height: '180px', display: 'flex', flexDirection: 'column', 
                      alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                    }}
                  >
                    <FileUp size={36} color={isDragging ? 'var(--accent)' : 'var(--text-tertiary)'} style={{ marginBottom: '12px' }} />
                    <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '13px' }}>
                      Drag & drop invoice PDF or supplier CSV
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                      Restocking lists, catalogs, ledgers
                    </span>
                  </div>

                  <form onSubmit={handleUrlSubmit} className="flex flex-col gap-2" style={{ marginTop: '4px' }}>
                    <label className="mono" style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                      OR ENTER COMPETITOR PRICING / CATALOG URL
                    </label>
                    <div className="flex gap-2">
                      <div className="flex-1 flex items-center" style={{
                        background: 'var(--surface-card)', border: '1px solid var(--border-default)',
                        borderRadius: '6px', padding: '0 12px', height: '38px'
                      }}>
                        <Link2 size={16} color="var(--text-tertiary)" style={{ marginRight: '8px' }} />
                        <input
                          type="url"
                          placeholder="https://competitor-platform.com/merchant-deals"
                          value={urlInput}
                          onChange={(e) => setUrlInput(e.target.value)}
                          style={{
                            border: 'none', outline: 'none', background: 'transparent',
                            fontSize: '13px', width: '100%', color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <button type="submit" className="btn-primary" style={{ padding: '0 20px', height: '38px' }}>
                        Fetch
                      </button>
                    </div>
                  </form>
                </div>

                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Recent Workspaces</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div
                      onClick={() => onSkipToSandbox(null)}
                      style={{
                        background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-light)',
                        borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'none'; }}
                    >
                       <div>
                         <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Yangon Retail Market Analysis</div>
                         <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '4px' }}>Saved yesterday</div>
                       </div>
                       <ChevronRight size={18} color="var(--text-tertiary)" />
                    </div>
                  </div>
                </div>
              </>
            )}

            {importStatus === 'parsing' && (
              <div style={{
                background: 'rgba(255,255,255,0.5)', borderRadius: '6px', border: '1px solid var(--border-default)',
                padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <div className="flex items-center gap-2" style={{ marginBottom: '16px' }}>
                  <span className="dot"></span>
                  <span className="dot" style={{ animationDelay: '0.2s' }}></span>
                  <span className="dot" style={{ animationDelay: '0.4s' }}></span>
                </div>
                <div style={{ fontWeight: 500, fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {uploadProgress?.step}
                </div>
                <div style={{
                  width: '100%', height: '4px', background: 'var(--border-light)',
                  borderRadius: '2px', overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${uploadProgress?.value}%`, height: '100%',
                    background: 'var(--accent)', transition: 'width 0.2s ease-out'
                  }} />
                </div>
              </div>
            )}

            {(importStatus === 'chatbot' || importStatus === 'review') && (
              <div style={{
                background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '24px'
              }}>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '16px', color: 'var(--text-primary)' }}>
                  Extracted Profile Data
                </div>
                <div className="grid grid-cols-2 gap-3" style={{ fontSize: '12px' }}>
                  {Object.entries(businessProfile).map(([k, v]) => (
                    <div key={k} style={{ background: 'var(--surface-card)', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-light)' }}>
                      <div className="mono" style={{ color: 'var(--text-tertiary)', fontSize: '9px', marginBottom: '4px', textTransform: 'uppercase' }}>{k}</div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }} className="truncate">{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {importStatus === 'review' && (
              <div style={{
                background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '24px', marginTop: '24px'
              }}>
                <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Extracted B2B Accounts
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                  Select the accounts or market parameters you want to add to your workspace graph.
                </p>

                <div className="flex flex-col gap-3" style={{ marginBottom: '24px' }}>
                  {detectedEntities.map(entity => (
                    <div
                      key={entity.id}
                      onClick={() => toggleApprovedEntity(entity.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: '6px', background: 'var(--surface-card)',
                        border: '1px solid var(--border-light)', cursor: 'pointer'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {approvedEntities.has(entity.id) ? (
                          <CheckSquare size={18} color="var(--accent)" />
                        ) : (
                          <Square size={18} color="var(--text-tertiary)" />
                        )}
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px' }}>{entity.name}</span>
                      </div>
                      <span className="mono" style={{
                        fontSize: '9px', padding: '4px 8px', borderRadius: '4px',
                        background: 'var(--surface-active)', color: 'var(--text-secondary)'
                      }}>
                        {entity.type.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setImportStatus(null)}
                    style={{
                      flex: 1, background: 'transparent', border: '1px solid var(--border-default)',
                      borderRadius: '6px', padding: '10px 0', fontSize: '14px', cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleMergeApproved}
                    className="btn-primary"
                    style={{ flex: 2, height: '42px', fontSize: '14px' }}
                  >
                    Confirm and Build Workspace
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col" style={{
          background: 'var(--surface-card)', borderLeft: '1px solid rgba(0,0,0,0.06)'
        }}>
          {importStatus === 'chatbot' ? (
            <div className="flex flex-col h-full">
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border-light)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Lattice Assistant</h2>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Collecting remaining context for probability simulation.</p>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} style={{ alignSelf: msg.sender === 'YOU' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
                    <div style={{
                      background: msg.sender === 'YOU' ? 'var(--text-primary)' : 'var(--surface-active)',
                      color: msg.sender === 'YOU' ? '#fff' : 'var(--text-primary)',
                      padding: '12px 16px', borderRadius: '8px', fontSize: '14px', lineHeight: 1.5,
                      border: msg.sender === 'YOU' ? 'none' : '1px solid var(--border-default)'
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatBottomRef} />
              </div>

              <div style={{ padding: '20px', borderTop: '1px solid var(--border-light)', background: 'var(--surface-page)' }}>
                <form onSubmit={handleChatSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Type your answer..."
                    autoFocus
                    style={{
                      flex: 1, height: '44px', padding: '0 16px', borderRadius: '8px',
                      border: '1px solid var(--border-default)', fontSize: '14px', outline: 'none'
                    }}
                  />
                  <button type="submit" disabled={!chatInput.trim()} style={{
                    width: '44px', height: '44px', background: 'var(--accent)', color: '#fff',
                    borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: chatInput.trim() ? 'pointer' : 'not-allowed', opacity: chatInput.trim() ? 1 : 0.5
                  }}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div style={{ padding: '64px', overflowY: 'auto' }}>
              <div style={{ maxWidth: '540px', margin: 'auto', width: '100%' }}>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: '16px' }}>
                  LATTICE SETUP · INTERACTIVE PROFILE
                </div>
                <h1 style={{ fontSize: '32px', letterSpacing: '-0.04em', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Define Context Manually
                </h1>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px', lineHeight: 1.6 }}>
                  No spreadsheets? Summarize your selling market. Type details regarding your retailers, wholesale supplier partners, and competitor apps. Our AI will ask for any missing fields needed for the simulation.
                </p>

                <div className="animate-fade-in flex flex-col gap-3">
                  <textarea
                    placeholder="Type your retail segment profile... (e.g., We are a B2B ordering platform for grocers. We compete with a competitor app. Retailers pay wholesale cash but need supplier credit terms.)"
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    style={{
                      width: '100%', height: '200px', border: '1px solid var(--border-default)',
                      borderRadius: '8px', padding: '16px', resize: 'none', outline: 'none',
                      fontSize: '14px', background: 'rgba(255,255,255,0.8)', lineHeight: '1.6',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.01)'
                    }}
                  />
                  <button
                    disabled={!manualText.trim()}
                    onClick={handleManualOnboardingSubmit}
                    className="btn-primary"
                    style={{ height: '46px', marginTop: '8px', fontSize: '14px' }}
                  >
                    Generate with AI <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
