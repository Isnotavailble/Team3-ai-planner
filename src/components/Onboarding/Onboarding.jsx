import React, { useState, useEffect } from 'react';
import { FileUp, Link2, CheckSquare, Square, ChevronRight, Info, Lock, Clock, ShieldCheck } from 'lucide-react';

export default function Onboarding({ onImportComplete, onSkipToSandbox }) {
  const [manualText, setManualText] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null); 
  const [importStatus, setImportStatus] = useState(null); 
  const [detectedEntities, setDetectedEntities] = useState([]);
  const [approvedEntities, setApprovedEntities] = useState(new Set());

  // --- New Feature States ---
  const [rightMode, setRightMode] = useState('prompt'); // 'prompt' or 'guided'
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedInputText, setGuidedInputText] = useState('');
  const [setupStatus, setSetupStatus] = useState(null); // 'loading', null
  const [setupProgressText, setSetupProgressText] = useState('');

  const questions = [
    {
      id: 'market',
      text: "What is your primary market segment?",
      options: ["Retail Groceries", "Wholesale Distribution", "Direct to Consumer"]
    },
    {
      id: 'competitor',
      text: "Who are your main competitive pressures?",
      options: ["Competitor Platform", "Local Cash Distributors", "None / Blue Ocean"]
    },
    {
      id: 'credit',
      text: "Do you offer credit or delayed payment terms?",
      options: ["Yes, 30-day terms", "Cash on Delivery Only", "Digital Payments"]
    }
  ];

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

    const extension = file.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'csv') {
      alert('We expect a PDF transaction log or CSV inventory sheet.');
      return;
    }

    startImportProcess({ fileType: extension, fileName: file.name });
  };

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (!urlInput) return;
    startImportProcess({ url: urlInput });
  };

  const startImportProcess = async (params) => {
    setImportStatus('parsing');
    setUploadProgress({ step: 'Reading B2B supplier sheets...', value: 30 });
    
    setTimeout(() => {
      setUploadProgress({ step: 'Mapping local retailers & terms...', value: 70 });
      
      setTimeout(async () => {
        setUploadProgress(null);
        setImportStatus('review');
        
        let parsed = [
          { id: 'yangon-shops', name: 'Yangon Retail Shops', type: 'segment' },
          { id: 'mandalay-distrib', name: 'Mandalay Wholesalers', type: 'segment' },
          { id: 'competitor-a', name: 'Competitor Platform A', type: 'company' }
        ];

        setDetectedEntities(parsed);
        setApprovedEntities(new Set(parsed.map(e => e.id)));
      }, 1200);
    }, 1200);
  };

  const handleMergeApproved = () => {
    const list = detectedEntities.filter(e => approvedEntities.has(e.id));
    onImportComplete(list.map(e => e.id));
  };

  const toggleApprovedEntity = (id) => {
    setApprovedEntities(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  // --- Mock Setup Flow ---
  const handleGuidedAnswer = (answerText) => {
    setGuidedInputText('');
    if (guidedStep < questions.length - 1) {
      setGuidedStep(prev => prev + 1);
    } else {
      startMockSetupLoading();
    }
  };

  const handleManualOnboardingSubmit = () => {
    startMockSetupLoading();
  };

  const startMockSetupLoading = () => {
    setSetupStatus('loading');
    setTimeout(() => {
      onSkipToSandbox();
    }, 1500);
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
              Drop local B2B order spreadsheets or supplier invoices. Lattice extracts wholesale accounts and constructs your strategic graph.
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

                {/* Encrypted History Section */}
                <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
                    <Clock size={16} />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Recent Workspaces</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <div
                      onClick={onSkipToSandbox}
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

                  <div className="flex items-center gap-2" style={{ marginTop: '16px', fontSize: '11px', color: 'var(--entity-policy)' }}>
                    <ShieldCheck size={14} />
                    <span>Your imports are secured with end-to-end encryption to protect proprietary data.</span>
                  </div>
                </div>
              </>
            )}

            {/* Parsing and Review states ... */}
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

            {importStatus === 'review' && (
              <div style={{
                background: 'rgba(255,255,255,0.5)', border: '1px solid var(--border-default)',
                borderRadius: '8px', padding: '24px'
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
                    Confirm and Merge
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col" style={{
          padding: '64px', overflowY: 'auto', background: 'rgba(0,0,0,0.015)'
        }}>
          <div style={{ maxWidth: '540px', margin: 'auto', width: '100%' }}>
            <div className="mono" style={{ fontSize: '11px', color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: '16px' }}>
              LATTICE SETUP · INTERACTIVE PROFILE
            </div>
            <h1 style={{ fontSize: '32px', letterSpacing: '-0.04em', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12px' }}>
              Define B2B Context Manually
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px', lineHeight: 1.6 }}>
              No spreadsheets? Summarize your selling market. Type details regarding your retailers, wholesale supplier partners, and competitor apps.
            </p>

            {/* Toggle Switch */}
            <div className="flex gap-2" style={{ marginBottom: '32px', background: 'rgba(255,255,255,0.4)', padding: '6px', borderRadius: '10px', display: 'inline-flex', border: '1px solid var(--border-light)' }}>
              <button
                onClick={() => setRightMode('prompt')}
                style={{
                  background: rightMode === 'prompt' ? '#fff' : 'transparent',
                  color: rightMode === 'prompt' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: rightMode === 'prompt' ? '1px solid var(--border-light)' : '1px solid transparent',
                  boxShadow: rightMode === 'prompt' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                 Write Description
              </button>
              <button
                onClick={() => setRightMode('guided')}
                style={{
                  background: rightMode === 'guided' ? '#fff' : 'transparent',
                  color: rightMode === 'guided' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  border: rightMode === 'guided' ? '1px solid var(--border-light)' : '1px solid transparent',
                  boxShadow: rightMode === 'guided' ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                 Guided Setup (Lazy Mode)
              </button>
            </div>

            {rightMode === 'prompt' && (
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
                  Assemble Graph View <ChevronRight size={16} />
                </button>
              </div>
            )}

            {rightMode === 'guided' && (
              <div className="animate-fade-in" style={{
                background: 'rgba(255,255,255,0.6)', border: '1px solid var(--border-light)',
                borderRadius: '12px', padding: '32px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)'
              }}>
                <div className="mono" style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 600, marginBottom: '16px' }}>
                  QUESTION {guidedStep + 1} OF {questions.length}
                </div>
                <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px', lineHeight: 1.4 }}>
                  {questions[guidedStep].text}
                </h2>
                
                <div className="flex flex-col gap-3">
                  {questions[guidedStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleGuidedAnswer(opt)}
                      style={{
                        background: '#fff', border: '1px solid var(--border-light)', borderRadius: '8px',
                        padding: '16px', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)',
                        textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-light)'; e.currentTarget.style.transform = 'none'; }}
                    >
                      {opt}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--border-light)' }}>
                  <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                    Or type your own answer:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={guidedInputText}
                      onChange={e => setGuidedInputText(e.target.value)}
                      placeholder="Type custom answer..."
                      style={{
                        flex: 1, height: '42px', border: '1px solid var(--border-default)',
                        borderRadius: '6px', padding: '0 12px', fontSize: '13px',
                        background: '#fff', outline: 'none'
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && guidedInputText.trim()) handleGuidedAnswer(guidedInputText);
                      }}
                    />
                    <button
                      disabled={!guidedInputText.trim()}
                      onClick={() => handleGuidedAnswer(guidedInputText)}
                      className="btn-primary"
                      style={{ height: '42px', padding: '0 20px' }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
