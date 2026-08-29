/* eslint-disable react-hooks/static-components */
/* eslint-disable no-unused-vars */
// src/components/AdminLayout/companies/CompanyTable.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
    Building2,
    MoreVertical,
    Eye,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    AlertCircle,
    Users,
    Globe,
    MapPin,
    ExternalLink,
    Mail,
    Phone,
    ArrowUpDown
} from 'lucide-react';

const CompanyTable = ({
    companies,
    loading,
    onView,
    onEdit,
    onDelete,
    onStatusChange,
    pagination,
    onPageChange,
    onSort,
    sortField,
    sortDirection
}) => {
    const [actionMenuOpen, setActionMenuOpen] = useState(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
    const menuRef = useRef(null);

    const statusConfig = {
        active: {
            label: 'Active',
            icon: CheckCircle,
            className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
        },
        inactive: {
            label: 'Inactive',
            icon: XCircle,
            className: 'bg-gray-50 text-gray-700 border-gray-200'
        },
        pending: {
            label: 'Pending',
            icon: Clock,
            className: 'bg-amber-50 text-amber-700 border-amber-200'
        },
        archived: {
            label: 'Archived',
            icon: AlertCircle,
            className: 'bg-red-50 text-red-700 border-red-200'
        }
    };

    const sizeConfig = {
        enterprise: { label: 'Enterprise', className: 'bg-purple-50 text-purple-700 border-purple-200' },
        large: { label: 'Large', className: 'bg-blue-50 text-blue-700 border-blue-200' },
        medium: { label: 'Medium', className: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
        small: { label: 'Small', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        startup: { label: 'Startup', className: 'bg-amber-50 text-amber-700 border-amber-200' }
    };

    const getStatusBadge = (status) => {
        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    const getSizeBadge = (size) => {
        const config = sizeConfig[size?.toLowerCase()] || sizeConfig.medium;
        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
                <Users className="w-3 h-3 mr-1" />
                {config.label}
            </span>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const handleSort = (field) => {
        if (onSort) {
            const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
            onSort(field, direction);
        }
    };

    const SortableHeader = ({ field, children, className = '' }) => {
        const isActive = sortField === field;
        return (
            <th
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors ${className}`}
                onClick={() => handleSort(field)}
            >
                <div className="flex items-center gap-1">
                    {children}
                    <ArrowUpDown className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-cyan-600' : 'text-gray-300'}`} />
                </div>
            </th>
        );
    };

    const handleMenuToggle = (e, companyId) => {
        e.stopPropagation();
        
        if (actionMenuOpen === companyId) {
            setActionMenuOpen(null);
            return;
        }

        // Calculate position for dropdown
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const menuWidth = 192; // w-48 = 12rem = 192px
        const menuHeight = 200; // Approximate height
        
        // Calculate right position
        const right = window.innerWidth - buttonRect.right;
        
        // Calculate top position (show below if space, otherwise above)
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;
        
        let top;
        if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
            // Show above
            top = buttonRect.top - menuHeight + 50;
        } else {
            // Show below
            top = buttonRect.bottom + 5;
        }

        // Ensure menu doesn't go off screen
        top = Math.max(10, Math.min(top, window.innerHeight - menuHeight - 10));
        
        setMenuPosition({
            top,
            right: Math.max(10, right)
        });
        
        setActionMenuOpen(companyId);
    };

    // Close menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (actionMenuOpen) {
                setActionMenuOpen(null);
            }
        };
        
        window.addEventListener('scroll', handleScroll, true);
        return () => window.removeEventListener('scroll', handleScroll, true);
    }, [actionMenuOpen]);

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {['Company', 'Industry', 'Size', 'Status', 'Location', 'Owner', 'Created', 'Actions'].map((header) => (
                                    <th key={header} className="px-4 py-3 text-left">
                                        <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[...Array(5)].map((_, i) => (
                                <tr key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <td key={j} className="px-4 py-4">
                                            <div className="h-4 bg-gray-100 rounded w-24 animate-pulse"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (!companies || companies.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="bg-cyan-50 rounded-full p-4 mb-4">
                        <Building2 className="w-12 h-12 text-cyan-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">No companies found</h3>
                    <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
                        {Object.keys(pagination?.filters || {}).length > 0
                            ? 'Try adjusting your filters to find what you\'re looking for.'
                            : 'Get started by adding your first company to the CRM.'}
                    </p>
                    {Object.keys(pagination?.filters || {}).length > 0 && (
                        <button
                            onClick={() => onPageChange?.(1, {})}
                            className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        Showing <span className="font-medium text-gray-900">{companies.length}</span> companies
                        {pagination?.total > 0 && (
                            <span className="text-gray-500"> of {pagination.total}</span>
                        )}
                    </span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <SortableHeader field="name" className="min-w-[200px]">
                                <Building2 className="w-3.5 h-3.5 mr-1" />
                                Company
                            </SortableHeader>
                            <SortableHeader field="industry_id">Industry</SortableHeader>
                            <SortableHeader field="company_size">Size</SortableHeader>
                            <SortableHeader field="status" className="min-w-[120px]">Status</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[150px]">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5" />
                                    Location
                                </div>
                            </th>
                            <SortableHeader field="owner_id">Owner</SortableHeader>
                            <SortableHeader field="created_at" className="min-w-[120px]">Created</SortableHeader>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {companies.map((company) => (
                            <tr
                                key={company.id}
                                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                                onClick={() => onView?.(company)}
                            >
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
                                            {company.logo_url ? (
                                                <img src={company.logo_url} alt={company.name} className="w-full h-full object-cover rounded-lg" />
                                            ) : (
                                                getInitials(company.name)
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-medium text-gray-900 truncate">
                                                    {company.name}
                                                </p>
                                                {company.website && (
                                                    <a
                                                        href={company.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-cyan-600 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <ExternalLink className="w-3.5 h-3.5" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                {company.domain && (
                                                    <span className="flex items-center gap-1">
                                                        <Globe className="w-3 h-3" />
                                                        {company.domain}
                                                    </span>
                                                )}
                                                {company.email && (
                                                    <a
                                                        href={`mailto:${company.email}`}
                                                        className="flex items-center gap-1 hover:text-cyan-600 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Mail className="w-3 h-3" />
                                                        {company.email}
                                                    </a>
                                                )}
                                                {company.phone && (
                                                    <a
                                                        href={`tel:${company.phone}`}
                                                        className="flex items-center gap-1 hover:text-cyan-600 transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Phone className="w-3 h-3" />
                                                        {company.phone}
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <span className="text-sm text-gray-700">
                                        {company.industry?.name || company.industry || '-'}
                                    </span>
                                </td>

                                <td className="px-4 py-4">
                                    {getSizeBadge(company.company_size)}
                                </td>

                                <td className="px-4 py-4">
                                    {getStatusBadge(company.status)}
                                </td>

                                <td className="px-4 py-4">
                                    <div className="text-sm text-gray-700">
                                        {company.city && company.country && (
                                            <span>{company.city}, {company.country}</span>
                                        )}
                                        {company.city && !company.country && (
                                            <span>{company.city}</span>
                                        )}
                                        {!company.city && company.country && (
                                            <span>{company.country}</span>
                                        )}
                                        {!company.city && !company.country && '-'}
                                    </div>
                                    {company.state && (
                                        <div className="text-xs text-gray-400">{company.state}</div>
                                    )}
                                </td>

                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                            {company.owner?.full_name ? getInitials(company.owner.full_name) : '?'}
                                        </div>
                                        <span className="text-sm text-gray-700">
                                            {company.owner?.full_name || 'Unassigned'}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-4 py-4">
                                    <div className="text-sm text-gray-700">
                                        {formatDate(company.created_at)}
                                    </div>
                                </td>

                                <td className="px-4 py-4 text-right">
                                    <button
                                        onClick={(e) => handleMenuToggle(e, company.id)}
                                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700 relative z-10"
                                    >
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.totalPages > 0 && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-sm text-gray-600">
                        Showing {((pagination.currentPage - 1) * (pagination.limit || 10)) + 1} to{' '}
                        {Math.min(pagination.currentPage * (pagination.limit || 10), pagination.total)} of{' '}
                        {pagination.total} companies
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <div className="flex items-center gap-1">
                            {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                                let pageNum;
                                const totalPages = pagination.totalPages;
                                const currentPage = pagination.currentPage;
                                
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => onPageChange?.(pageNum)}
                                        className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                            pagination.currentPage === pageNum
                                                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Dropdown Menu - Fixed positioning outside table */}
            {actionMenuOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setActionMenuOpen(null)}
                    />
                    <div
                        ref={menuRef}
                        className="fixed z-50 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1"
                        style={{
                            top: menuPosition.top,
                            right: menuPosition.right,
                            minWidth: '192px'
                        }}
                    >
                        {companies.find(c => c.id === actionMenuOpen) && (
                            <>
                                <button
                                    onClick={() => {
                                        const company = companies.find(c => c.id === actionMenuOpen);
                                        setActionMenuOpen(null);
                                        onView?.(company);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                    <Eye className="w-4 h-4" />
                                    View Details
                                </button>
                                <button
                                    onClick={() => {
                                        const company = companies.find(c => c.id === actionMenuOpen);
                                        setActionMenuOpen(null);
                                        onEdit?.(company);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                >
                                    <Pencil className="w-4 h-4" />
                                    Edit Company
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button
                                    onClick={() => {
                                        const company = companies.find(c => c.id === actionMenuOpen);
                                        setActionMenuOpen(null);
                                        onDelete?.(company);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Delete Company
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CompanyTable;