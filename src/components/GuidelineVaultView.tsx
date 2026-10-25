import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Copy, 
  Check, 
  ShieldAlert, 
} from 'lucide-react';
import { BrandFact, TerminologyRule, BrandGuideline } from '../types/governance';
import { BRAND_FACTS, TERMINOLOGY_RULES, BRAND_GUIDELINES } from '../data/initialData';

export const GuidelineVaultView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'facts' | 'terms' | 'principles' | 'confidential'>('facts');
  const [searchQuery, setSearchQuery] = useState('');
  const [facts, setFacts] = useState<BrandFact[]>(BRAND_FACTS);
  const [terms, setTerms] = useState<TerminologyRule[]>(TERMINOLOGY_RULES);
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>(BRAND_GUIDELINES);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newClaim, setNewClaim] = useState('');
  const [newVerifiedData, setNewVerifiedData] = useState('');
  const [newCitation, setNewCitation] = useState('');

  const copyCitation = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddFact = () => {
    if (!newClaim.trim() || !newVerifiedData.trim()) return;
    const item: BrandFact = {
      id: `fact-${Date.now()}`,
      claim: newClaim.trim(),
      verifiedData: newVerifiedData.trim(),
      citation: newCitation.trim() || 'Internal Verification Ledger',
      verifiedDate: new Date().toISOString().split('T')[0],
      category: 'performance',
    };
    setFacts([item, ...facts]);
    setNewClaim('');
    setNewVerifiedData('');
    setNewCitation('');
    setIsAddOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.75rem)] overflow-y-auto bg-slate-50 p-6 md:p-8">
      <div className="max-w-5xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Brand Guidelines & Fact Vault</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified claims, trademark rules, and approved terminology for pre-publication checks.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Fact</span>
          </button>
        </div>

        {/* Tab switcher & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1 overflow-x-auto text-xs bg-slate-200/70 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab('facts')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'facts'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved Claims ({facts.length})
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'terms'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terminology ({terms.length})
            </button>
            <button
              onClick={() => setActiveTab('principles')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'principles'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Principles ({guidelines.length})
            </button>
            <button
              onClick={() => setActiveTab('confidential')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeTab === 'confidential'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Confidentiality
            </button>
          </div>

          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search vault..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tab 1: Facts */}
        {activeTab === 'facts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {facts
              .filter(f => f.claim.toLowerCase().includes(searchQuery.toLowerCase()) || f.verifiedData.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((fact) => (
                <div
                  key={fact.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="capitalize text-blue-700 font-semibold">{fact.category}</span>
                      <span>Verified: {fact.verifiedDate}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900">{fact.claim}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{fact.verifiedData}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 truncate max-w-[220px]">Citation: {fact.citation}</span>
                    <button
                      onClick={() => copyCitation(fact.id, `${fact.claim} - ${fact.citation}`)}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      {copiedId === fact.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 2: Terminology */}
        {activeTab === 'terms' && (
          <div className="space-y-2.5">
            {terms
              .filter(t => t.term.toLowerCase().includes(searchQuery.toLowerCase()) || t.rationale.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((rule) => (
                <div
                  key={rule.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-start justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{rule.term}</span>
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          rule.status === 'approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : rule.status === 'deprecated'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                    {rule.replacement && (
                      <div className="text-xs text-slate-600">
                        <span>Replacement: </span>
                        <span className="text-emerald-700 font-semibold">{rule.replacement}</span>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 leading-relaxed">{rule.rationale}</p>
                  </div>
                  <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200 md:max-w-xs w-full">
                    <span className="text-[10px] text-slate-400 font-semibold block uppercase">Context</span>
                    <span className="italic">{rule.exampleContext}</span>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Tab 3: Brand Principles */}
        {activeTab === 'principles' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {guidelines.map((guide) => (
              <div
                key={guide.id}
                className="bg-white border border-slate-200 rounded-xl p-4 space-y-2.5 shadow-xs"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-blue-700 font-semibold">
                    {guide.category.replace('_', ' ')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-0.5">{guide.title}</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{guide.summary}</p>
                </div>

                <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-emerald-700 block">Do:</span>
                  <ul className="space-y-0.5 text-slate-600 list-disc list-inside">
                    {guide.dos.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <span className="text-[11px] font-semibold text-rose-700 block">Don't:</span>
                  <ul className="space-y-0.5 text-slate-600 list-disc list-inside">
                    {guide.donts.map((item, idx) => (
                      <li key={idx} className="leading-relaxed">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Confidentiality */}
        {activeTab === 'confidential' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Internal Codenames</h4>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-mono text-rose-700 font-medium">Project Titan</span>
                    <span className="block text-[11px] text-slate-500">Unannounced multi-tenant sync</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-mono text-rose-700 font-medium">Codename Bluebird</span>
                    <span className="block text-[11px] text-slate-500">Hardware enclave initiative</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Protected Financials</h4>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-mono text-rose-700 font-medium">$45M ARR Trajectory</span>
                    <span className="block text-[11px] text-slate-500">Requires executive sign-off</span>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-mono text-rose-700 font-medium">Series C Valuation</span>
                    <span className="block text-[11px] text-slate-500">Prohibited from marketing copy</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2 shadow-xs">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Embargo Schedule</h4>
                <div className="space-y-1 text-xs">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <span className="font-semibold text-amber-700">Q4 Media Reveal</span>
                    <span className="block text-[11px] text-slate-500">Under embargo until Nov 15, 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Fact Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-5 space-y-3.5 shadow-xl">
            <h3 className="text-sm font-semibold text-slate-900">Add Approved Fact</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-medium block mb-1">Claim Headline</label>
                <input
                  type="text"
                  value={newClaim}
                  onChange={(e) => setNewClaim(e.target.value)}
                  placeholder="e.g., 99.99% Availability SLA"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Details</label>
                <textarea
                  value={newVerifiedData}
                  onChange={(e) => setNewVerifiedData(e.target.value)}
                  placeholder="Benchmark metrics or specifications..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white h-20"
                />
              </div>
              <div>
                <label className="text-slate-700 font-medium block mb-1">Citation Reference</label>
                <input
                  type="text"
                  value={newCitation}
                  onChange={(e) => setNewCitation(e.target.value)}
                  placeholder="e.g., SOC 2 Type II Report 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsAddOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFact}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
