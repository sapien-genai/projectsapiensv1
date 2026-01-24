import React, { useState, useEffect } from 'react';
import {
  Search, Filter, Mail, Calendar, Award, TrendingUp,
  MoreVertical, Eye, Ban, UserCheck, Download
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { auditLog } from '../../utils/auditLog';

interface AdminRole {
  role: string;
  permissions: Record<string, boolean>;
}

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  last_active: string | null;
  total_lessons?: number;
  total_badges?: number;
}

export default function UserManagement({ adminRole }: { adminRole: AdminRole }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_badges (count),
          user_path_progress (count)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const enrichedUsers = data?.map((user: any) => ({
        ...user,
        total_badges: user.user_badges?.[0]?.count || 0,
        total_lessons: user.user_path_progress?.[0]?.count || 0,
      })) || [];

      setUsers(enrichedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_id.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === 'all') return matchesSearch;

    const isActive = user.last_active
      ? new Date(user.last_active) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      : false;

    if (filterStatus === 'active') return matchesSearch && isActive;
    if (filterStatus === 'inactive') return matchesSearch && !isActive;

    return matchesSearch;
  });

  const exportUsers = () => {
    auditLog.logDataExport('users', filteredUsers.length, {
      search_term: searchTerm,
      filter_status: filterStatus,
    });

    const csv = [
      ['ID', 'Name', 'Created', 'Last Active', 'Badges', 'Lessons'].join(','),
      ...filteredUsers.map(user => [
        user.user_id,
        user.display_name || 'Unknown',
        new Date(user.created_at).toLocaleDateString(),
        user.last_active ? new Date(user.last_active).toLocaleDateString() : 'Never',
        user.total_badges || 0,
        user.total_lessons || 0,
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold uppercase tracking-tight mb-2">USER MANAGEMENT</h2>
          <p className="text-sm">Manage and monitor all platform users</p>
        </div>
        <button
          onClick={exportUsers}
          className="flex items-center gap-2 px-6 py-3 bg-[#FF6A00] text-black border-2 border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <Download className="w-4 h-4" strokeWidth={2} />
          EXPORT
        </button>
      </div>

      <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_#000000]">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search users by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-black focus:outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" strokeWidth={2} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border-2 border-black focus:outline-none font-semibold"
            >
              <option value="all">All Users</option>
              <option value="active">Active (30d)</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_#000000]">
          <div className="text-2xl font-extrabold">{users.length}</div>
          <div className="text-xs font-extrabold uppercase tracking-tight">TOTAL USERS</div>
        </div>
        <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_#000000]">
          <div className="text-2xl font-extrabold text-[#10b981]">{filteredUsers.length}</div>
          <div className="text-xs font-extrabold uppercase tracking-tight">FILTERED RESULTS</div>
        </div>
        <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_#000000]">
          <div className="text-2xl font-extrabold text-[#FF6A00]">
            {Math.round((users.filter(u => u.last_active).length / users.length) * 100)}%
          </div>
          <div className="text-xs font-extrabold uppercase tracking-tight">ACTIVE RATE</div>
        </div>
      </div>

      <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F4F4F4] border-b-2 border-black">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight">
                  USER
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight">
                  JOINED
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight">
                  LAST ACTIVE
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight">
                  PROGRESS
                </th>
                <th className="px-6 py-3 text-left text-xs font-extrabold uppercase tracking-tight">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-[#F4F4F4] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 border-2 border-black bg-[#FF6A00] bg-opacity-20 flex items-center justify-center">
                        <span className="text-[#FF6A00] font-extrabold">
                          {(user.display_name || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-extrabold">
                          {user.display_name || 'Unknown User'}
                        </div>
                        <div className="text-xs">
                          ID: {user.user_id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" strokeWidth={2} />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold">
                    {user.last_active ? (
                      <span className="text-[#10b981]">
                        {new Date(user.last_active).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="opacity-50">Never</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <Award className="w-4 h-4" strokeWidth={2} />
                        {user.total_badges || 0}
                      </div>
                      <div className="flex items-center gap-1 text-sm font-semibold">
                        <TrendingUp className="w-4 h-4" strokeWidth={2} />
                        {user.total_lessons || 0}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          auditLog.logUserAction('view', user.user_id, {
                            display_name: user.display_name,
                          });
                        }}
                        className="p-2 border border-black hover:bg-black hover:text-white transition-all"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" strokeWidth={2} />
                      </button>
                      <button
                        className="p-2 border border-black hover:bg-black hover:text-white transition-all"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4" strokeWidth={2} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 border-t-2 border-black">
            <p className="font-semibold">No users found matching your criteria.</p>
          </div>
        )}
      </div>

      {selectedUser && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="bg-white border-4 border-black p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-[4px_4px_0px_#000000]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-2xl font-extrabold uppercase tracking-tight mb-2">
                  {selectedUser.display_name || 'Unknown User'}
                </h3>
                <p className="text-sm">User ID: {selectedUser.user_id}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-3xl font-extrabold hover:text-[#FF6A00] transition-colors"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase mb-1">JOINED</div>
                  <div className="font-bold">
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="p-4 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase mb-1">LAST ACTIVE</div>
                  <div className="font-bold">
                    {selectedUser.last_active
                      ? new Date(selectedUser.last_active).toLocaleDateString()
                      : 'Never'}
                  </div>
                </div>
                <div className="p-4 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase mb-1">BADGES EARNED</div>
                  <div className="font-bold">{selectedUser.total_badges || 0}</div>
                </div>
                <div className="p-4 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase mb-1">LESSONS COMPLETED</div>
                  <div className="font-bold">{selectedUser.total_lessons || 0}</div>
                </div>
              </div>

              {selectedUser.bio && (
                <div className="p-4 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase mb-2">BIO</div>
                  <div>{selectedUser.bio}</div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  <Mail className="w-4 h-4" strokeWidth={2} />
                  MESSAGE
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-black font-extrabold text-sm uppercase tracking-tight shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                  <UserCheck className="w-4 h-4" strokeWidth={2} />
                  ACTIVITY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
