import { useState, useEffect } from 'react';
import {
    Bot, Play, Square, Copy, Download, FileText, Mail, Target,
    Users, History, BarChart3, Lightbulb, Loader2, CheckCircle
} from 'lucide-react';
import { aiProviders, aiPrompts } from '../../data/AIData';
import { useAI } from '../../store/hooks';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('leadGeneration');
    const [selectedProvider, setSelectedProvider] = useState('openai');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState(null);
    const [streamingText, setStreamingText] = useState('');
    const [showHistory, setShowHistory] = useState(false);
    const { history, usage, loading, generate, fetchHistory, fetchUsage } = useAI();

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

    const handleSubmit = (e) => {
        e.preventDefault();
        setResult(null);
        setStreamingText('');
        generate(activeTab, formData, selectedProvider, selectedModel);
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

    // Load history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Load usage stats on mount
    useEffect(() => {
        fetchUsage();
    }, []);

    // Listen for AI generation completion
    useEffect(() => {
        if (loading === false && isProcessing) {
            setIsProcessing(false);
        }
    }, [loading]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Bot className="w-7 h-7 text-cyan-600" />
                        AI Assistant
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Generate, qualify, and accelerate leads with AI</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <select
                        value={selectedProvider}
                        onChange={(e) => {
                            setSelectedProvider(e.target.value);
                            setSelectedModel(aiProviders.find(p => p.id === e.target.value).models[0]);
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none w-full sm:w-auto"
                    >
                        {aiProviders.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none w-full sm:w-auto min-w-[180px]"
                    >
                        {provider?.models.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{usage?.totalRequests || 0}</p>
                    <p className="mt-1 text-xs text-emerald-600">+{usage?.thisMonth?.requests || 0} this month</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Tokens Used</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{(usage?.totalTokens / 1000).toFixed(0) || 0}K</p>
                    <p className="mt-1 text-xs text-emerald-600">+{(usage?.thisMonth?.tokens / 1000).toFixed(0) || 0}K this month</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCost(usage?.totalCost || 0)}</p>
                    <p className="mt-1 text-xs text-emerald-600">+{formatCost(usage?.thisMonth?.cost || 0)} this month</p>
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
                    <nav className="flex flex-wrap gap-1 p-1" role="tablist">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowHistory(!showHistory)}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium w-full sm:w-auto"
                            >
                                <History className="w-4 h-4 inline mr-1" />
                                History
                            </button>
                            <button
                                type="button"
                                onClick={handleStop}
                                disabled={!isProcessing}
                                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 w-full sm:w-auto"
                            >
                                <Square className="w-4 h-4 inline mr-1" />
                                Stop
                            </button>
                            <button
                                type="submit"
                                disabled={isProcessing || loading}
                                className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {isProcessing || loading ? (
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
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
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
                            <div className="overflow-x-auto">
                                <pre className="bg-white p-4 rounded-lg border border-gray-200 max-h-[60vh] overflow-auto text-sm font-mono text-gray-800 whitespace-pre-wrap break-words">
                                    {streamingText || result}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* History Panel */}
                    {showHistory && (
                        <div className="mt-6">
                            <h3 className="font-semibold text-gray-900 mb-3">Generation History</h3>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
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
                    {usage?.byProvider && Object.entries(usage.byProvider).map(([providerId, stats]) => {
                        const providerInfo = aiProviders.find(p => p.id === providerId);
                        const totalRequests = usage.thisMonth?.requests || 1;
                        const percentage = ((stats.requests / totalRequests) * 100).toFixed(0);
                        return (
                            <div key={providerId} className="flex flex-col sm:flex-row sm:items-center gap-3">
                                <div className="w-full sm:w-24 text-sm font-medium text-gray-700">{providerInfo?.name || providerId}</div>
                                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all" style={{ width: `${percentage}%` }} />
                                </div>
                                <div className="w-full sm:w-32 text-right text-sm text-gray-600">
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