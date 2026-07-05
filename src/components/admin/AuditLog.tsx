import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, Calendar, User, Shield,
  Edit, Trash, Plus, Eye, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { auditLog } from '../../utils/auditLog';

interface AdminRole {
  role: string;
  permissions: Record<string, boolean>;
}

interface AuditEntry {
  id: string;
  admin_user_id: string | null;
  action: string;
  target_type: string | null;
  target_id: string | null;
  changes: Record<string, any>;
  ip_address: string | null;
  created_at: string;
}

export default function AuditLog({ adminRole }: { adminRole: AdminRole }) {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchAuditLogs();
  }, [dateRange]);

  const fetchAuditLogs = async () => {
    try {
      let query = supabase
        .from('system_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (dateRange !== 'all') {
        const daysAgo = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysAgo);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = filterAction === 'all' || log.action === filterAction;

    return matchesSearch && matchesAction;
  });

  const exportLogs = () => {
    auditLog.logDataExport('audit_logs', filteredLogs.length, {
      date_range: dateRange,
      filter_action: filterAction,
    });

    const csv = [
      ['Timestamp', 'Admin', 'Action', 'Target Type', 'Target ID', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.created_at).toISOString(),
        log.admin_user_id || 'System',
        log.action,
        log.target_type || '',
        log.target_id || '',
        log.ip_address || '',
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getActionIcon = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return Plus;
    if (action.includes('update') || action.includes('edit')) return Edit;
    if (action.includes('delete') || action.includes('remove')) return Trash;
    if (action.includes('view') || action.includes('read')) return Eye;
    return FileText;
  };

  const getActionColor = (action: string) => {
    if (action.includes('create') || action.includes('insert')) return 'text-white bg-success';
    if (action.includes('update') || action.includes('edit')) return 'text-white bg-info';
    if (action.includes('delete') || action.includes('remove')) return 'text-white bg-red-600';
    if (action.includes('view') || action.includes('read')) return 'text-white bg-ink';
    return 'text-white bg-accent';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-8 h-8 border-4 border-ink border-t-accent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-ink mb-2">Audit Log</h2>
          <p className="text-sm font-semibold text-ink">Track all administrative actions and system events</p>
        </div>
        <button
          onClick={exportLogs}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white border-2 border-ink shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-extrabold uppercase text-xs"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          Export
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border-2 border-ink shadow-brutal-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ink" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search logs by action, target, or IP..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 min-h-[44px] border-2 border-ink font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-5 h-5 text-ink" strokeWidth={2} />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-3 min-h-[44px] border-2 border-ink font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="view">View</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-4 py-3 min-h-[44px] border-2 border-ink font-semibold focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-ink shadow-brutal-sm p-4">
          <div className="text-2xl font-extrabold text-ink">{logs.length}</div>
          <div className="text-xs font-extrabold uppercase tracking-tight text-ink">Total Events</div>
        </div>
        <div className="bg-white border-2 border-ink shadow-brutal-sm p-4">
          <div className="text-2xl font-extrabold text-success">
            {logs.filter((l) => l.action.includes('create')).length}
          </div>
          <div className="text-xs font-extrabold uppercase tracking-tight text-ink">Creates</div>
        </div>
        <div className="bg-white border-2 border-ink shadow-brutal-sm p-4">
          <div className="text-2xl font-extrabold text-info">
            {logs.filter((l) => l.action.includes('update')).length}
          </div>
          <div className="text-xs font-extrabold uppercase tracking-tight text-ink">Updates</div>
        </div>
        <div className="bg-white border-2 border-ink shadow-brutal-sm p-4">
          <div className="text-2xl font-extrabold text-red-600">
            {logs.filter((l) => l.action.includes('delete')).length}
          </div>
          <div className="text-xs font-extrabold uppercase tracking-tight text-ink">Deletes</div>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="md:hidden space-y-3">
        {filteredLogs.map((log) => {
          const ActionIcon = getActionIcon(log.action);
          const actionColor = getActionColor(log.action);

          return (
            <div key={log.id} className="bg-white border-2 border-ink p-4 shadow-brutal-sm">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className={`inline-flex items-center gap-2 px-2 py-1 border-2 border-ink ${actionColor}`}>
                  <ActionIcon className="w-4 h-4" strokeWidth={2} />
                  <span className="text-xs font-extrabold uppercase">{log.action}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-semibold text-ink">
                  <Calendar className="w-3 h-3" strokeWidth={2} />
                  <span className="text-right">{new Date(log.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {log.target_type && (
                  <div>
                    <div className="font-semibold mb-0.5">Target</div>
                    <div className="font-extrabold uppercase">{log.target_type}</div>
                    {log.target_id && (
                      <div className="text-xs">ID: {log.target_id.slice(0, 8)}...</div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="font-semibold mb-0.5">Admin</div>
                    <div className="flex items-center gap-1">
                      <Shield className="w-3 h-3" strokeWidth={2} />
                      {log.admin_user_id ? log.admin_user_id.slice(0, 8) + '...' : 'System'}
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold mb-0.5">IP Address</div>
                    <div>{log.ip_address || 'N/A'}</div>
                  </div>
                </div>

                <button
                  className="w-full min-h-[44px] px-4 py-2 border-2 border-ink text-accent hover:bg-ink hover:text-white font-extrabold text-xs uppercase transition-all"
                  title={JSON.stringify(log.changes, null, 2)}
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}

        {filteredLogs.length === 0 && (
          <div className="bg-white border-2 border-ink p-12 text-center">
            <FileText className="w-16 h-16 text-ink mx-auto mb-4" strokeWidth={2} />
            <p className="font-semibold text-ink">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Desktop Table Layout */}
      <div className="hidden md:block bg-white border-2 border-ink shadow-brutal-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b-2 border-ink">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight text-ink">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight text-ink">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight text-ink">
                  Target
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight text-ink">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight text-ink">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight text-ink">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                const actionColor = getActionColor(log.action);

                return (
                  <tr key={log.id} className="hover:bg-surface transition-colors border-b-2 border-ink last:border-b-0">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <Calendar className="w-4 h-4" strokeWidth={2} />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 border-2 border-ink ${actionColor}`}>
                        <ActionIcon className="w-4 h-4" strokeWidth={2} />
                        <span className="text-sm font-extrabold uppercase">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-ink">
                        {log.target_type ? (
                          <>
                            <div className="font-extrabold uppercase">{log.target_type}</div>
                            {log.target_id && (
                              <div className="text-xs font-semibold">ID: {log.target_id.slice(0, 8)}...</div>
                            )}
                          </>
                        ) : (
                          <span className="font-semibold">N/A</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                        <Shield className="w-4 h-4" strokeWidth={2} />
                        {log.admin_user_id ? log.admin_user_id.slice(0, 8) + '...' : 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-ink">
                      {log.ip_address || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        className="px-4 py-2 min-h-[44px] text-sm text-accent hover:text-ink font-extrabold uppercase"
                        title={JSON.stringify(log.changes, null, 2)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-ink mx-auto mb-4" strokeWidth={2} />
            <p className="font-semibold text-ink">No audit logs found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-info border-2 border-ink shadow-brutal-sm p-6">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-white flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <h4 className="font-extrabold uppercase tracking-tight text-white mb-1">Audit Log Information</h4>
            <p className="text-sm font-semibold text-white">
              All administrative actions are logged for security and compliance purposes. Logs are retained
              for 90 days and can be exported for external analysis or archival.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
