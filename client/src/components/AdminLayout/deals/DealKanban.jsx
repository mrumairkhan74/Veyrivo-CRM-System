import { Eye, Pencil, Trash2, Users, Calendar, Clock, Target, MoreVertical } from 'lucide-react';
import { useState } from 'react';

const DealKanban = ({ deals, stages, onView, onEdit, onDelete, formatCurrency }) => {
    const getStageDeals = (stageId) => deals.filter(deal => deal.stage === stageId);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getPriorityColor = (probability) => {
        if (probability >= 80) return 'text-emerald-600 bg-emerald-50';
        if (probability >= 50) return 'text-amber-600 bg-amber-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-4">
                {stages.map((stage) => {
                    const stageDeals = getStageDeals(stage.id);
                    const totalValue = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

                    return (
                        <div key={stage.id} className="w-80 flex-shrink-0 flex flex-col">
                            {/* Stage Header */}
                            <div className="rounded-t-xl bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                                        <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                                    </div>
                                    <span className="text-xs font-bold text-gray-500 bg-white px-2 py-0.5 rounded-full">
                                        {stageDeals.length}
                                    </span>
                                </div>
                                <div className="text-sm">
                                    <span className="text-gray-500">{stageDeals.length} deals</span>
                                    <span className="text-gray-900 font-medium ml-2">{formatCurrency(totalValue)}</span>
                                </div>
                            </div>

                            {/* Deals List */}
                            <div className="flex-1 p-3 space-y-3 min-h-[400px] bg-gradient-to-b from-gray-50 to-white">
                                {stageDeals.length > 0 ? (
                                    stageDeals.map((deal) => (
                                        <DealCard
                                            key={deal.id}
                                            deal={deal}
                                            onView={() => onView(deal)}
                                            onEdit={() => onEdit(deal)}
                                            onDelete={() => onDelete(deal)}
                                            formatCurrency={formatCurrency}
                                            formatDate={formatDate}
                                            getPriorityColor={getPriorityColor}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 py-8 text-sm">
                                        Drop deals here
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const DealCard = ({ deal, onView, onEdit, onDelete, formatCurrency, formatDate, getPriorityColor }) => {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{deal.title}</h4>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{deal.company}</p>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                    className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                >
                    <MoreVertical className="w-4 h-4" />
                </button>
            </div>

            {/* Value & Probability */}
            <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getPriorityColor(deal.probability)}`}>
                    {deal.probability}%
                </span>
            </div>

            {/* Details */}
            <div className="space-y-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span className="truncate">{deal.contact}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Close: {formatDate(deal.expected_close_date)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    <span className="truncate">{deal.owner}</span>
                </div>
            </div>

            {/* Next Activity */}
            {deal.next_activity && (
                <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-2 py-1.5 rounded-lg mb-3">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Next: {formatDate(deal.next_activity)}</span>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button onClick={onView} className="flex-1 text-center py-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50 rounded-lg">
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    View
                </button>
                <button onClick={onEdit} className="flex-1 text-center py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Pencil className="w-3.5 h-3.5 inline mr-1" />
                    Edit
                </button>
            </div>

            {/* Dropdown Menu */}
            {showMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="fixed z-50 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                        <button onClick={() => { onView(deal); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Eye className="w-4 h-4" /> View
                        </button>
                        <button onClick={() => { onEdit(deal); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                            <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={() => { onDelete(deal); setShowMenu(false); }} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DealKanban;