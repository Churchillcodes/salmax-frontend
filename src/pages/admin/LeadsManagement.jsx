import React, { useState, useEffect } from 'react';
import { Users2, Search, Calendar, Phone, MessageSquare, RefreshCw, ShoppingCart, UserCheck } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { toast } from 'react-toastify';

export default function LeadsManagement() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('All');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/leads');
      setLeads(response.data || []);
    } catch (e) {
      console.error('Failed to load leads:', e);
      toast.error('Failed to retrieve customer leads.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Unique sources for dropdown filter options
  const sources = ['All', ...new Set(leads.map(l => {
    if (!l.source) return 'Unknown';
    // If source contains "Other:", group under "Other" or display cleanly
    if (l.source.startsWith('Other:')) return 'Other';
    return l.source;
  }))];

  // Filtering
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    const phone = lead.phone || '';
    const name = (lead.name || '').toLowerCase();
    const product = (lead.product || '').toLowerCase();
    
    const matchesSearch = 
      phone.includes(query) || 
      name.includes(query) || 
      product.includes(query);

    // Group matching for source filter
    let sourceMatch = true;
    if (selectedSource !== 'All') {
      if (selectedSource === 'Other') {
        sourceMatch = lead.source?.startsWith('Other:') || lead.source === 'Other';
      } else {
        sourceMatch = lead.source === selectedSource;
      }
    }

    return matchesSearch && sourceMatch;
  });

  return (
    <div className="space-y-6 animate-fade-in text-warm-ivory">
      
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl md:text-3xl text-white font-light tracking-wide">Leads Management</h1>
        <p className="text-xs text-warm-ivory/50 mt-1 uppercase tracking-widest">
          View customer WhatsApp inquiries, verify marketing referral channels, and contact prospects.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-dark-charcoal border border-gold/10 p-4 rounded-xl">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gold/50" size={16} />
          <input
            type="text"
            placeholder="Search by name, phone, product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-base border border-gold/10 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-gold"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 text-xs text-warm-ivory/60 uppercase tracking-widest">
          <span>Referral Source:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-dark-base border border-gold/15 focus:border-gold rounded px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
          >
            {sources.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Leads Table or Grid */}
      {loading ? (
        <div className="text-center py-16 text-gold">
          <RefreshCw size={24} className="animate-spin mx-auto mb-3" />
          <span className="text-xs uppercase tracking-widest">Loading Leads Log...</span>
        </div>
      ) : filteredLeads.length > 0 ? (
        <div className="bg-dark-charcoal border border-gold/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-dark-base/50 text-[10px] uppercase tracking-widest border-b border-gold/10 text-warm-ivory/50">
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Referral Channel</th>
                  <th className="px-6 py-4 font-semibold">Interested Product</th>
                  <th className="px-6 py-4 font-semibold">Submission Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Direct Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/5 text-xs font-light text-warm-ivory/80">
                {filteredLeads.map((lead) => {
                  const leadId = lead._id || lead.id;
                  const dateStr = lead.date || lead.createdAt 
                    ? new Date(lead.date || lead.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) 
                    : 'N/A';

                  // Direct WhatsApp chat link
                  const cleanPhone = lead.phone ? lead.phone.replace(/[^\d+]/g, '') : '';
                  // Strip '+' for wa.me redirect
                  const whatsappPhone = cleanPhone.startsWith('+') ? cleanPhone.slice(1) : cleanPhone;
                  const waLink = `https://wa.me/${whatsappPhone}`;

                  return (
                    <tr key={leadId} className="hover:bg-gold/5 transition duration-300">
                      
                      {/* Customer identity */}
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-white flex items-center gap-1.5">
                            <UserCheck size={12} className="text-gold" />
                            {lead.name}
                          </p>
                          <p className="text-[10px] text-warm-ivory/50 flex items-center gap-1.5">
                            <Phone size={10} className="text-gold/60" />
                            {lead.phone}
                          </p>
                        </div>
                      </td>

                      {/* Referral source */}
                      <td className="px-6 py-4 font-medium text-white/95">
                        <span className="bg-gold/5 border border-gold/10 px-2.5 py-1 rounded text-[10px] uppercase tracking-wider text-gold">
                          {lead.source}
                        </span>
                      </td>

                      {/* Interested Product */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 max-w-[200px] truncate text-white" title={lead.product}>
                          <ShoppingCart size={12} className="text-gold shrink-0" />
                          <span className="truncate">{lead.product}</span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 flex items-center gap-1.5 mt-2.5 text-warm-ivory/60">
                        <Calendar size={12} className="text-gold/60 shrink-0" />
                        <span>{dateStr}</span>
                      </td>

                      {/* WhatsApp trigger */}
                      <td className="px-6 py-4 text-right">
                        {cleanPhone ? (
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-dark-base font-semibold px-3 py-1.5 rounded text-[10px] uppercase tracking-widest transition duration-300"
                          >
                            <MessageSquare size={10} />
                            Chat WhatsApp
                          </a>
                        ) : (
                          <span className="text-[10px] text-warm-ivory/40 italic">No number</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 border border-dashed border-gold/10 rounded-xl bg-dark-charcoal/20">
          <Users2 size={36} className="mx-auto text-gold/30 mb-3" />
          <p className="font-serif italic text-warm-ivory/60">No inquiry leads documented</p>
          <p className="text-xs text-warm-ivory/40">WhatsApp inquiry clicks will generate database logs here.</p>
        </div>
      )}

    </div>
  );
}
