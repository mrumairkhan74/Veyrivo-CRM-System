import { useState, useEffect } from 'react';
import {
    Bot, Play, Square, Copy, Download, FileText, Mail, Target,
    Users, History, BarChart3, Lightbulb, Loader2, CheckCircle,
} from 'lucide-react';
import { aiProviders, aiPrompts } from '../../data/AIData';
import { useAI } from '../../store/hooks';

const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('leadGeneration');
    const [selectedProvider, setSelectedProvider] = useState('openai');
    const [selectedModel, setSelectedModel] = useState('gpt-4o');
    const [formData, setFormData] = useState({});
    const [result, setResult] = useState(null);
    const [showHistory, setShowHistory] = useState(false);

    const { history, usage, loading, generate, fetchHistory, fetchUsage } = useAI();

    const provider = aiProviders.find((p) => p.id === selectedProvider) || aiProviders[0];
    const promptConfig = aiPrompts[activeTab] || Object.values(aiPrompts)[0];

    // Reset form whenever the tab changes
    useEffect(() => {
        const initial = {};
        (promptConfig?.parameters || []).forEach((p) => { initial[p] = ''; });
        setFormData(initial);
        setResult(null);
    }, [activeTab, promptConfig]);

    // Load history + usage once
    useEffect(() => {
        fetchHistory().catch(() => {});
        fetchUsage().catch(() => {});
    }, [fetchHistory, fetchUsage]);

    // Recompute usage breakdown from history (client-side)
    const usageSummary = (() => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonth = { requests: 0, tokens: 0, cost: 0 };
        const byProvider = {};

        (history || []).forEach((h) => {
            const createdAt = h.created_at ? new Date(h.created_at) : null;
            if (createdAt && createdAt >= monthStart) {
                thisMonth.requests += 1;
                thisMonth.tokens += h.tokens_used || 0;
                thisMonth.cost += parseFloat(h.cost_usd || 0);
            }
            const p = h.provider || 'unknown';
            if (!byProvider[p]) byProvider[p] = { requests: 0, cost: 0 };
            byProvider[p].requests += 1;
            byProvider[p].cost += parseFloat(h.cost_usd || 0);
        });

        return {
            totalRequests: usage?.totalRequests ?? (history?.length || 0),
            totalTokens: usage?.totalTokens ?? 0,
            totalCost: usage?.totalCost ?? 0,
            thisMonth,
            byProvider,
        };
    })();

    const handleInputChange = (field, value) =>
        setFormData((prev) => ({ ...prev, [field]: value }));

    const handleProviderChange = (e) => {
        const id = e.target.value;
        setSelectedProvider(id);
        const first = aiProviders.find((p) => p.id === id)?.models?.[0];
        if (first) setSelectedModel(first);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResult(null);
        try {
            const response = await generate(activeTab, formData, selectedProvider, selectedModel);
            // Best-effort text extraction from varying backend shapes
            const text =
                typeof response === 'string'
                    ? response
                    : response?.output_data?.text
                    || response?.output_data?.content
                    || response?.output_data
                    || JSON.stringify(response, null, 2);
            setResult(typeof text === 'string' ? text : JSON.stringify(text, null, 2));
        } catch (err) {
            setResult(`Error: ${err.message}`);
        }
    };

    const handleCopy = () => {
        const text = result || '';
        if (text) navigator.clipboard.writeText(text);
    };

    const handleDownload = () => {
        const text = result || '';
        if (!text) return;
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-${activeTab}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const formatCost = (cost) => `$${Number(cost || 0).toFixed(4)}`;

    const tabs = [
        { id: 'leadGeneration',    label: 'Generate Leads', icon: Users },
        { id: 'leadQualification', label: 'Qualify Lead',   icon: Target },
        { id: 'leadSummary',       label: 'Summarize',      icon: FileText },
        { id: 'nextAction',        label: 'Next Action',    icon: Lightbulb },
        { id: 'emailDraft',        label: 'Email Draft',    icon: Mail },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Bot className="h-7 w-7 text-cyan-600" />
                        AI Assistant
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Generate, qualify, and accelerate leads with AI
                    </p>
                </div>
                <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <select
                        value={selectedProvider}
                        onChange={handleProviderChange}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500 sm:w-auto"
                    >
                        {aiProviders.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <select
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="w-full min-w-[180px] rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500 sm:w-auto"
                    >
                        {(provider?.models || []).map((m) => (
                            <option key={m} value={m}>{m}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total Requests</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{usageSummary.totalRequests}</p>
                    <p className="mt-1 text-xs text-emerald-600">+{usageSummary.thisMonth.requests} this month</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Tokens Used</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                        {(usageSummary.totalTokens / 1000).toFixed(0)}K
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                        +{(usageSummary.thisMonth.tokens / 1000).toFixed(0)}K this month
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Total Cost</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">{formatCost(usageSummary.totalCost)}</p>
                    <p className="mt-1 text-xs text-emerald-600">
                        +{formatCost(usageSummary.thisMonth.cost)} this month
                    </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <p className="text-sm text-gray-600">Success Rate</p>
                    <p className="mt-1 text-2xl font-bold text-gray-900">
                        {history.length
                            ? `${((history.filter((h) => h.status === 'completed').length / history.length) * 100).toFixed(1)}%`
                            : '—'}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">Based on history</p>
                </div>
            </div>

            {/* Tabs + form */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto border-b border-gray-200">
                    <nav className="flex gap-1 p-1" role="tablist">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-sm'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {(promptConfig?.parameters || []).map((param) => (
                                <div key={param} className="space-y-1.5">
                                    <label className="block text-sm font-medium capitalize text-gray-700">
                                        {param.replace(/_/g, ' ')}
                                    </label>
                                    <input
                                        type="text"
                                        value={formData[param] || ''}
                                        onChange={(e) => handleInputChange(param, e.target.value)}
                                        placeholder={`Enter ${param.replace(/_/g, ' ')}`}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-cyan-500"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col items-stretch gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center sm:justify-end">
                            <button
                                type="button"
                                onClick={() => setShowHistory((v) => !v)}
                                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 sm:w-auto"
                            >
                                <History className="mr-1 inline h-4 w-4" />
                                History
                            </button>
                            <button
                                type="button"
                                onClick={() => {}}
                                disabled={!loading}
                                className="w-full rounded-lg px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 sm:w-auto"
                            >
                                <Square className="mr-1 inline h-4 w-4" />
                                Stop
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Play className="h-4 w-4" />
                                        {promptConfig?.name || 'Run'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Result */}
                    {result && (
                        <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h3 className="font-semibold text-gray-900">AI Response</h3>
                                <div className="flex items-center gap-2">
                                    <button onClick={handleCopy} className="rounded p-2 transition hover:bg-gray-200" title="Copy">
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button onClick={handleDownload} className="rounded p-2 transition hover:bg-gray-200" title="Download">
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm text-gray-800">
                                    {result}
                                </pre>
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {showHistory && (
                        <div className="mt-6">
                            <h3 className="mb-3 font-semibold text-gray-900">Generation History</h3>
                            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[800px]">
                                        <thead className="border-b border-gray-200 bg-gray-50">
                                            <tr>
                                                {['Type', 'Provider', 'Model', 'Status', 'Tokens', 'Cost', 'Time'].map((h) => (
                                                    <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                                                        {h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {history.slice(0, 10).map((item) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm capitalize">
                                                        {item.type?.replace(/([A-Z])/g, ' $1').trim() || '—'}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        {aiProviders.find((p) => p.id === item.provider)?.name || item.provider}
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-sm">{item.model}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                                            item.status === 'completed'
                                                                ? 'bg-emerald-50 text-emerald-700'
                                                                : 'bg-amber-50 text-amber-700'
                                                        }`}>
                                                            {item.status === 'completed' ? (
                                                                <>
                                                                    <CheckCircle className="mr-1 h-3 w-3" /> Completed
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Loader2 className="mr-1 h-3 w-3 animate-spin" /> Processing
                                                                </>
                                                            )}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                                        {((item.tokens_used || 0) / 1000).toFixed(1)}K
                                                    </td>
                                                    <td className="px-4 py-3 font-mono text-sm text-gray-600">
                                                        {formatCost(item.cost_usd)}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-500">
                                                        {item.created_at ? new Date(item.created_at).toLocaleString() : '—'}
                                                    </td>
                                                </tr>
                                            ))}
                                            {history.length === 0 && (
                                                <tr>
                                                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">
                                                        No generations yet
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Provider breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <BarChart3 className="h-5 w-5" />
                    Provider Usage This Month
                </h3>
                <div className="space-y-3">
                    {Object.keys(usageSummary.byProvider).length === 0 && (
                        <p className="text-sm text-gray-500">No usage recorded yet.</p>
                    )}
                    {Object.entries(usageSummary.byProvider).map(([providerId, stats]) => {
                        const info = aiProviders.find((p) => p.id === providerId);
                        const total = usageSummary.totalRequests || 1;
                        const percentage = Math.round((stats.requests / total) * 100);
                        return (
                            <div key={providerId} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="w-full text-sm font-medium text-gray-700 sm:w-24">
                                    {info?.name || providerId}
                                </div>
                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="w-full text-right text-sm text-gray-600 sm:w-32">
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