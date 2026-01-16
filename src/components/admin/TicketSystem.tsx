import React, { useState, useEffect } from 'react';
import {
  Ticket, Search, Filter, Clock, AlertCircle, CheckCircle,
  MessageSquare, User, Calendar, Tag, Send, Paperclip
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AdminRole {
  role: string;
  permissions: Record<string, boolean>;
}

interface SupportTicket {
  id: string;
  user_id: string;
  assigned_to: string | null;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created_at: string;
  updated_at: string;
  user_profiles?: {
    display_name: string;
  };
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  user_profiles?: {
    display_name: string;
  };
}

export default function TicketSystem({ adminRole }: { adminRole: AdminRole }) {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user_profiles:user_id (display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId: string) => {
    try {
      const { data, error } = await supabase
        .from('ticket_messages')
        .select(`
          *,
          user_profiles:user_id (display_name)
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const updates: any = { status, updated_at: new Date().toISOString() };

      if (status === 'in_progress' && selectedTicket?.assigned_to === null) {
        updates.assigned_to = user?.id;
      }

      if (status === 'resolved' || status === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('support_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;

      await fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updates });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !user) return;

    try {
      const { error } = await supabase.from('ticket_messages').insert({
        ticket_id: selectedTicket.id,
        user_id: user.id,
        message: newMessage,
        is_internal: isInternal,
      });

      if (error) throw error;

      await updateTicketStatus(selectedTicket.id, 'in_progress');
      await fetchMessages(selectedTicket.id);
      setNewMessage('');
      setIsInternal(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const statusCounts = {
    open: tickets.filter((t) => t.status === 'open').length,
    in_progress: tickets.filter((t) => t.status === 'in_progress').length,
    resolved: tickets.filter((t) => t.status === 'resolved').length,
    closed: tickets.filter((t) => t.status === 'closed').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-2">Support Tickets</h2>
        <p className="text-sm font-semibold text-black">Manage customer support requests and inquiries</p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatusCard label="Open" count={statusCounts.open} color="bg-red-500" />
        <StatusCard label="In Progress" count={statusCounts.in_progress} color="bg-[#F59E0B]" />
        <StatusCard label="Resolved" count={statusCounts.resolved} color="bg-[#10b981]" />
        <StatusCard label="Closed" count={statusCounts.closed} color="bg-black" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-4">
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" strokeWidth={2} />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border-2 border-black text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border-2 border-black text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-3 py-2 border-2 border-black text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
                >
                  <option value="all">All Priority</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredTickets.map((ticket) => (
              <button
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`w-full text-left p-4 border-2 border-black transition-all ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-[#FF6A00] text-white shadow-[2px_2px_0px_#000000]'
                    : 'bg-white hover:shadow-[2px_2px_0px_#000000] hover:translate-x-[2px] hover:translate-y-[2px]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <PriorityBadge priority={ticket.priority} active={selectedTicket?.id === ticket.id} />
                    <StatusBadge status={ticket.status} active={selectedTicket?.id === ticket.id} />
                  </div>
                </div>
                <h4 className={`font-extrabold mb-1 line-clamp-1 uppercase tracking-tight ${
                  selectedTicket?.id === ticket.id ? 'text-white' : 'text-black'
                }`}>
                  {ticket.title}
                </h4>
                <p className={`text-sm mb-2 line-clamp-2 font-semibold ${
                  selectedTicket?.id === ticket.id ? 'text-white' : 'text-black'
                }`}>
                  {ticket.description}
                </p>
                <div className={`flex items-center gap-3 text-xs font-semibold ${
                  selectedTicket?.id === ticket.id ? 'text-white' : 'text-black'
                }`}>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" strokeWidth={2} />
                    {ticket.user_profiles?.display_name || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" strokeWidth={2} />
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))}

            {filteredTickets.length === 0 && (
              <div className="text-center py-8 font-semibold text-black">
                No tickets found
              </div>
            )}
          </div>
        </div>

        {/* Ticket Detail */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] overflow-hidden">
              {/* Ticket Header */}
              <div className="p-6 border-b-2 border-black">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <PriorityBadge priority={selectedTicket.priority} />
                      <StatusBadge status={selectedTicket.status} />
                      <span className="px-2 py-1 bg-[#F4F4F4] border-2 border-black text-black text-xs font-extrabold uppercase">
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold uppercase tracking-tight text-black mb-2">
                      {selectedTicket.title}
                    </h3>
                    <p className="text-black font-semibold mb-4">{selectedTicket.description}</p>
                    <div className="flex items-center gap-4 text-sm text-black font-semibold">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" strokeWidth={2} />
                        {selectedTicket.user_profiles?.display_name || 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" strokeWidth={2} />
                        {new Date(selectedTicket.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}
                    disabled={selectedTicket.status === 'in_progress'}
                    className="px-4 py-2 bg-[#F59E0B] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-extrabold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')}
                    disabled={selectedTicket.status === 'resolved'}
                    className="px-4 py-2 bg-[#10b981] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-extrabold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}
                    disabled={selectedTicket.status === 'closed'}
                    className="px-4 py-2 bg-black text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-extrabold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto bg-[#F4F4F4]">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`p-4 border-2 border-black ${
                      message.is_internal
                        ? 'bg-[#F59E0B] text-white'
                        : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`font-extrabold ${message.is_internal ? 'text-white' : 'text-black'}`}>
                          {message.user_profiles?.display_name || 'Unknown'}
                        </span>
                        {message.is_internal && (
                          <span className="px-2 py-0.5 bg-white text-black border-2 border-black text-xs font-extrabold uppercase">
                            Internal
                          </span>
                        )}
                      </div>
                      <span className={`text-xs font-semibold ${message.is_internal ? 'text-white' : 'text-black'}`}>
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className={`font-semibold ${message.is_internal ? 'text-white' : 'text-black'}`}>{message.message}</p>
                  </div>
                ))}

                {messages.length === 0 && (
                  <div className="text-center py-8 font-semibold text-black">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>

              {/* Reply Box */}
              <div className="p-6 border-t-2 border-black">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full px-4 py-3 border-2 border-black resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6A00] font-semibold"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <label className="flex items-center gap-2 text-xs font-extrabold uppercase text-black cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="w-4 h-4 border-2 border-black"
                    />
                    Internal note (not visible to user)
                  </label>
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="flex items-center gap-2 px-6 py-2 bg-[#FF6A00] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-extrabold uppercase text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" strokeWidth={2} />
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-12 text-center">
              <Ticket className="w-16 h-16 text-black mx-auto mb-4" strokeWidth={2} />
              <h3 className="text-xl font-extrabold uppercase tracking-tight text-black mb-2">Select a Ticket</h3>
              <p className="font-semibold text-black">Choose a ticket from the list to view details and respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-4">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 ${color} border-2 border-black`}></div>
        <div>
          <div className="text-2xl font-extrabold text-black">{count}</div>
          <div className="text-xs font-extrabold uppercase tracking-tight text-black">{label}</div>
        </div>
      </div>
    </div>
  );
}

function PriorityBadge({ priority, active = false }: { priority: string; active?: boolean }) {
  const colors: Record<string, string> = {
    urgent: active ? 'bg-white text-red-600 border-white' : 'bg-red-500 text-white border-black',
    high: active ? 'bg-white text-[#FF6A00] border-white' : 'bg-[#FF6A00] text-white border-black',
    medium: active ? 'bg-white text-[#F59E0B] border-white' : 'bg-[#F59E0B] text-white border-black',
    low: active ? 'bg-white text-black border-white' : 'bg-[#F4F4F4] text-black border-black',
  };

  return (
    <span className={`px-2 py-0.5 ${colors[priority]} border-2 text-xs font-extrabold uppercase`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status, active = false }: { status: string; active?: boolean }) {
  const colors: Record<string, string> = {
    open: active ? 'bg-white text-red-600 border-white' : 'bg-red-500 text-white border-black',
    in_progress: active ? 'bg-white text-[#F59E0B] border-white' : 'bg-[#F59E0B] text-white border-black',
    resolved: active ? 'bg-white text-[#10b981] border-white' : 'bg-[#10b981] text-white border-black',
    closed: active ? 'bg-white text-black border-white' : 'bg-black text-white border-black',
  };

  return (
    <span className={`px-2 py-0.5 ${colors[status]} border-2 text-xs font-extrabold uppercase`}>
      {status.replace('_', ' ')}
    </span>
  );
}
