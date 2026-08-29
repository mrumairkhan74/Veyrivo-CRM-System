/* eslint-disable react-hooks/static-components */

import  { useState, useRef, useEffect } from 'react';
import {
  User,
  MoreVertical,
  Eye,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  Clock,
  Users,
//   Linkedin,
  MessageCircle,
  Award,
  Shield
} from 'lucide-react';

const ContactsTable = ({
  contacts,
  loading,
  onView,
  onEdit,
  onDelete,
  pagination,
  onPageChange,
  onSort,
  sortField,
  sortDirection
}) => {
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const menuRef = useRef(null);

  // Status config based on SRS
  const consentStatusConfig = {
    opted_in: {
      label: 'Opted In',
      icon: CheckCircle,
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    opted_out: {
      label: 'Opted Out',
      icon: XCircle,
      className: 'bg-red-50 text-red-700 border-red-200'
    },
    unknown: {
      label: 'Unknown',
      icon: Clock,
      className: 'bg-gray-50 text-gray-700 border-gray-200'
    }
  };

  const getConsentBadge = (status) => {
    const config = consentStatusConfig[status?.toLowerCase()] || consentStatusConfig.unknown;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  const getDecisionMakerBadge = (isDecisionMaker) => {
    if (isDecisionMaker) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
          <Award className="w-3 h-3" />
          Decision Maker
        </span>
      );
    }
    return null;
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

  const getInitials = (firstName, lastName) => {
    if (!firstName && !lastName) return '?';
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const getFullName = (firstName, lastName) => {
    if (!firstName && !lastName) return 'Unknown';
    return `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown';
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

  const handleMenuToggle = (e, contactId) => {
    e.stopPropagation();

    if (actionMenuOpen === contactId) {
      setActionMenuOpen(null);
      return;
    }

    const buttonRect = e.currentTarget.getBoundingClientRect();
    const menuHeight = 200;

    const right = window.innerWidth - buttonRect.right;
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    let top;
    if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
      top = buttonRect.top - menuHeight + 10;
    } else {
      top = buttonRect.bottom + 5;
    }

    top = Math.max(10, Math.min(top, window.innerHeight - menuHeight - 10));

    setMenuPosition({
      top,
      right: Math.max(10, right)
    });

    setActionMenuOpen(contactId);
  };

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
                {['Contact', 'Company', 'Job Title', 'Contact Info', 'Decision Maker', 'Consent', 'Created', 'Actions'].map((header) => (
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

  if (!contacts || contacts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="bg-cyan-50 rounded-full p-4 mb-4">
            <Users className="w-12 h-12 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No contacts found</h3>
          <p className="text-sm text-gray-500 mb-4 text-center max-w-sm">
            {Object.keys(pagination?.filters || {}).length > 0
              ? 'Try adjusting your filters to find what you\'re looking for.'
              : 'Get started by adding your first contact to the CRM.'}
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
            Showing <span className="font-medium text-gray-900">{contacts.length}</span> contacts
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
              <SortableHeader field="first_name" className="min-w-[200px]">
                <User className="w-3.5 h-3.5 mr-1" />
                Contact
              </SortableHeader>
              <SortableHeader field="company_id">
                <Building2 className="w-3.5 h-3.5 mr-1" />
                Company
              </SortableHeader>
              <SortableHeader field="job_title">Job Title</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]">
                Contact Info
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">
                Decision Maker
              </th>
              <SortableHeader field="consent_status" className="min-w-[120px]">
                <Shield className="w-3.5 h-3.5 mr-1" />
                Consent
              </SortableHeader>
              <SortableHeader field="created_at" className="min-w-[120px]">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                Created
              </SortableHeader>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[80px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                onClick={() => onView?.(contact)}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-sm shadow-sm">
                      {contact.avatar_url ? (
                        <img src={contact.avatar_url} alt={getFullName(contact.first_name, contact.last_name)} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        getInitials(contact.first_name, contact.last_name)
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {getFullName(contact.first_name, contact.last_name)}
                      </p>
                      {contact.department && (
                        <span className="text-xs text-gray-500">{contact.department}</span>
                      )}
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {contact.company?.name || '-'}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {contact.job_title || '-'}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="text-sm text-gray-700 hover:text-cyan-600 transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {contact.phone}
                      </a>
                    )}
                    {contact.whatsapp_phone && (
                      <a
                        href={`https://wa.me/${contact.whatsapp_phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        WhatsApp
                      </a>
                    )}
                    {contact.linkedin_url && (
                      <a
                        href={contact.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* <Linkedin className="w-3.5 h-3.5" /> */}
                        LinkedIn
                      </a>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4">
                  {getDecisionMakerBadge(contact.is_decision_maker)}
                  {!contact.is_decision_maker && (
                    <span className="text-sm text-gray-400">-</span>
                  )}
                </td>

                <td className="px-4 py-4">
                  {getConsentBadge(contact.consent_status)}
                  {contact.consent_at && (
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDate(contact.consent_at)}
                    </div>
                  )}
                </td>

                <td className="px-4 py-4">
                  <div className="text-sm text-gray-700">
                    {formatDate(contact.created_at)}
                  </div>
                </td>

                <td className="px-4 py-4 text-right">
                  <button
                    onClick={(e) => handleMenuToggle(e, contact.id)}
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
            {pagination.total} contacts
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

      {/* Dropdown Menu */}
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
            {contacts.find(c => c.id === actionMenuOpen) && (
              <>
                <button
                  onClick={() => {
                    const contact = contacts.find(c => c.id === actionMenuOpen);
                    setActionMenuOpen(null);
                    onView?.(contact);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => {
                    const contact = contacts.find(c => c.id === actionMenuOpen);
                    setActionMenuOpen(null);
                    onEdit?.(contact);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Contact
                </button>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={() => {
                    const contact = contacts.find(c => c.id === actionMenuOpen);
                    setActionMenuOpen(null);
                    onDelete?.(contact);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Contact
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ContactsTable;