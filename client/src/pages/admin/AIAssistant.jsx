import { useState } from 'react';
import {
    Bot, Play, Square, Copy, Download, FileText, Mail, Target,
    Users, History, BarChart3, Lightbulb, Loader2, CheckCircle
} from 'lucide-react';
import { aiProviders, aiPrompts, aiLeadGenerationHistory, aiUsageStats } from '../../data/AIData';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('leadGeneration');
    const [selectedProvider, setSelectedProvider] = useState('openai');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [streamingText, setStreamingText] = useState('');
    const [history, setHistory] = useState(aiLeadGenerationHistory);
    const [showHistory, setShowHistory] = useState(false);

    const provider = aiProviders.find(p => p.id === selectedProvider);
    const promptConfig = aiPrompts[activeTab];

    // Form data - reset when activeTab changes using key
    const [formData, setFormData] = useState(() => {
        const initialData = {};
        promptConfig.parameters.forEach(param => {
            initialData[param] = '';
        });
        return initialData;
    });

    // Reset form when tab changes by using key on form
    const formKey = activeTab;

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const simulateAIResponse = async (promptType, data) => {
        setIsProcessing(true);
        setStreamingText('');
        
        // Simulate streaming response
        const mockResponses = {
            leadGeneration: `[
  {
    "company": "TechFlow Inc",
    "contact_name": "Sarah Chen",
    "title": "VP Engineering",
    "email": "sarah.chen@techflow.io",
    "phone": "+1-415-555-0142",
    "industry": "SaaS",
    "company_size": "50-200",
    "estimated_value": 25000,
    "source": "AI Generated",
    "reasoning": "Recently raised Series A, hiring engineering leads, mentioned need for custom integrations"
  },
  {
    "company": "DataScale Labs",
    "contact_name": "Marcus Johnson",
    "title": "CTO",
    "email": "marcus@datascale.ai",
    "phone": "+1-650-555-0287",
    "industry": "AI/ML",
    "company_size": "10-50",
    "estimated_value": 18000,
    "source": "AI Generated",
    "reasoning": "Building MLOps platform, needs custom dashboard development"
  }
]`,
            leadQualification: `{
  "score": 87,
  "temperature": "hot",
  "budget_fit": "strong",
  "timeline_fit": "good",
  "authority_fit": "decision_maker",
  "need_fit": "high",
  "recommended_actions": [
    "Schedule discovery call within 48 hours",
    "Prepare custom demo for their use case",
    "Send case study from similar industry"
  ],
  "risk_factors": ["Competitor evaluation in progress", "Budget approval pending board meeting"],
  "summary": "High-value prospect with immediate need. CTO is technical buyer with budget authority. Strong fit for our AI integration services."
}`,
            leadSummary: `TechNova Solutions is a mid-market SaaS company (150 employees) seeking a complete website redesign with CMS integration. James Wilson, VP Engineering, is the technical decision maker with $45K budget approved. They're evaluating 3 vendors and need delivery within 6 weeks. Previous interaction: discovery call completed, requirements documented. High urgency, strong budget fit.`,
            nextAction: `**Recommended Action:** Schedule technical deep-dive call within 24 hours.

**Timing:** Today or tomorrow morning (they're in PST)

**Approach:** 
1. Reference their specific requirements from discovery call
2. Bring technical architect to answer integration questions
3. Present phased delivery timeline matching their 6-week deadline
4. Prepare pricing options: Fixed-price vs milestone-based

**Talking Points:**
- "We've reviewed your CMS integration requirements in detail"
- "Our team has delivered 3 similar projects this quarter"
- "Can we lock in a 30-min technical session this week?"`,
            emailDraft: `Subject: Website Redesign for TechNova - 3 Ideas from Our Discovery Call

Hi James,

Following up on our conversation last Tuesday about TechNova's website redesign. I've been thinking about your CMS integration requirements and have 3 specific ideas that could save you 4-6 weeks of development time:

1. **Headless CMS Approach** - Decouple frontend from content layer, allowing your marketing team to update content without engineering support
2. **Component Library** - Build a reusable React component system so future pages launch in days, not weeks
3. **Automated Deployment** - CI/CD pipeline that deploys preview environments for every PR

We've implemented this exact stack for 2 other Series A SaaS companies this quarter (happy to share references).

Worth a 20-min technical call this week to walk through the architecture? I'm free Thu/Fri mornings PST.

Best,
[Your Name]`
        };

        const fullResponse = mockResponses[promptType] || 'AI response would appear here...';
        
        // Simulate streaming
        for (let i = 0; i < fullResponse.length; i += 10) {
            await new Promise(r => setTimeout(r, 30));
            setStreamingText(fullResponse.slice(0, i + 10));
        }
        
        setResult(fullResponse);
        setIsProcessing(false);
        
        // Add to history
        const newHistoryItem = {
            id: `ai-gen-${Date.now()}`,
            type: promptType,
            status: 'completed',
            provider: selectedProvider,
            model: selectedModel,
            input: data,
            output: fullResponse,
            tokens_used: Math.floor(fullResponse.length / 4),
            cost_usd: (fullResponse.length / 4) * 0.000015,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
        };
        setHistory(prev => [newHistoryItem, ...prev]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setResult(null);
        setStreamingText('');
        simulateAIResponse(activeTab, formData);
    };

    const handleStop = () => {
        setIsProcessing(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result || streamingText);
    };

    const handleDownload = () => {
        const blob = new Blob([result || streamingText], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-${activeTab}-${Date.now()}.json`;
        a.click();
    };

    const formatCost = (cost) => `$${cost.toFixed(4)}`;

    const tabs = [
        { id: 'leadGeneration', label: 'Generate Leads', icon: Users },
        { id: 'leadQualification', label: 'Qualify Lead', icon: Target },
        { id: 'leadSummary', label: 'Summarize', icon: FileText },
        { id: 'nextAction', label: 'Next Action', icon: Lightbulb },
        { id: 'emailDraft', label: 'Email Draft', icon: Mail },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bot className="w-7 h-7 text-cyan-600" />
                        AI Assistant
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Generate, qualify, and accelerate leads with AI</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedProvider}
                        onChange={(e) => {
                            setSelectedProvider(e.target.value);
                            setSelectedModel(aiProviders.find(p => p.id === e.target.value).models[0]);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    >
                        {aiProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none min-w-[180px]"
                    >
                        {provider?.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{aiUsageStats.totalRequests}</p>
                    <p className="mt-1 text-xs text-emerald-600">+{aiUsageStats.thisMonth.requests} this month</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Tokens Used</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{(aiUsageStats.totalTokens / 1000).toFixed(0)}K</p>
                    <p className="mt-1 text-xs text-emerald-600">+{(aiUsageStats.thisMonth.tokens / 1000).toFixed(0)}K this month</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCost(aiUsageStats.totalCost)}</p>
                    <p className="mt-1 text-xs text-emerald-600">+{formatCost(aiUsageStats.thisMonth.cost)} this month</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">98.6%</p>
                    <p className="mt-1 text-xs text-emerald-600">99% last month</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="flex gap-1 p-1 min-w-max" role="tablist">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {promptConfig.parameters.map(param => (
                                <div key={param} className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700 capitalize">
                                        {param.replace(/_/g, ' ')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData[param] || ''}
                                        onChange={(e) => handleInputChange(param, e.target.value)}
                                        placeholder={`Enter ${param.replace(/_/g, ' ')}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowHistory(!showHistory)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                            >
                                <History className="w-4 h-4 inline mr-1" />
                                History
                            </button>
                            <button
                                type="button"
                                onClick={handleStop}
                                disabled={!isProcessing}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <Square className="w-4 h-4 inline mr-1" />
                                Stop
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4" />
                                        {promptConfig.name}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Result Display */}
                    {(result || streamingText) && (
                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">AI Response</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="p-2 rounded hover:bg-gray-200 transition" title="Copy">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                    <button onClick={handleDownload} className="p-2 rounded hover:bg-gray-200 transition" title="Download">
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <pre className="bg-white p-4 rounded-lg border border-gray-200 max-h-96 overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap">
                                {streamingText || result}
                            </pre>
                        </div>
                    )}

                    {/* History Panel */}
                    {showHistory && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Generation History</h3>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Provider</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Model</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tokens</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {history.slice(0, 10).map(item => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm capitalize">{item.type.replace(/([A-Z])/g, ' $1').trim()}</td>
                                                <td className="px-4 py-3 text-sm">{aiProviders.find(p => p.id === item.provider)?.name || item.provider}</td>
                                                <td className="px-4 py-3 text-sm font-mono">{item.model}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                                        {item.status === 'completed' ? (
                                                            <>
                                                                <CheckCircle className="w-3 h-3 mr-1" /> Completed
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Loader2 className="w-3 h-3 mr-1 animate-spin" /> Processing
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm font-mono text-gray-600">{(item.tokens_used / 1000).toFixed(1)}K</td>
                                                <td className="px-4 py-3 text-sm font-mono text-gray-600">{formatCost(item.cost_usd)}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Provider Comparison */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Provider Usage This Month
                </h3>
                <div className="space-y-3">
                    {Object.entries(aiUsageStats.byProvider).map(([providerId, stats]) => {
                        const providerInfo = aiProviders.find(p => p.id === providerId);
                        const percentage = (stats.requests / aiUsageStats.thisMonth.requests * 100).toFixed(0);
                        return (
                            <div key={providerId} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium text-gray-700">{providerInfo?.name || providerId}</div>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="w-32 text-right text-sm text-gray-600">
                                    {stats.requests} req · {formatCost(stats.cost)}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;