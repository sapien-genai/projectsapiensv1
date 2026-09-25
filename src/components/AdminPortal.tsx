import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, Ticket, BarChart3, FileText,
  Settings, Shield, ChevronLeft, Menu, X, Home
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import UserManagement from './admin/UserManagement';
import TicketSystem from './admin/TicketSystem';
import AnalyticsDashboard from './admin/AnalyticsDashboard';
import AuditLog from './admin/AuditLog';

type AdminView = 'dashboard' | 'users' | 'tickets' | 'analytics' | 'audit' | 'settings';

interface AdminRole {
  role: string;
  permissions: Record<string, boolean>;
}

interface AdminPortalProps {
  onBackToPlatform?: () => void;
}

export default function AdminPortal({ onBackToPlatform }: AdminPortalProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<AdminView>('dashboard');
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select('role, permissions')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setAdminRole(data);
    } catch (error) {
      console.error('Error checking admin access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-ink border-t-accent animate-spin mb-4"></div>
          <p className="font-extrabold uppercase tracking-tight">VERIFYING ADMIN ACCESS...</p>
        </div>
      </div>
    );
  }

  if (!adminRole) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white border-4 border-ink p-8 max-w-md w-full text-center shadow-brutal-md">
          <div className="w-16 h-16 bg-red-600 border-2 border-ink flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight mb-2">NOT AUTHORIZED</h2>
          <p className="text-sm mb-6">
            You don't have permission to access the admin portal.
          </p>
          <button
            onClick={() => (onBackToPlatform ? onBackToPlatform() : window.history.back())}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-ink font-extrabold text-sm uppercase tracking-tight shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
            BACK TO HOME
          </button>
        </div>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard' as AdminView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users' as AdminView, label: 'Users', icon: Users },
    { id: 'tickets' as AdminView, label: 'Support Tickets', icon: Ticket },
    { id: 'analytics' as AdminView, label: 'Analytics', icon: BarChart3 },
    { id: 'audit' as AdminView, label: 'Audit Log', icon: FileText },
    { id: 'settings' as AdminView, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-surface border-b-2 border-ink sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6" strokeWidth={2} />
              <h1 className="text-xl font-extrabold uppercase tracking-tight">ADMIN PORTAL</h1>
              <span className="px-3 py-1 bg-accent border border-ink text-ink text-xs font-extrabold uppercase">
                {adminRole.role.replace('_', ' ')}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onBackToPlatform}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-ink font-extrabold text-sm uppercase tracking-tight shadow-brutal-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Home className="w-4 h-4" strokeWidth={2} />
                PLATFORM
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 border border-ink bg-white shadow-brutal-sm"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" strokeWidth={2} />
                ) : (
                  <Menu className="w-6 h-6" strokeWidth={2} />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="bg-white border-2 border-ink p-4 shadow-brutal-sm sticky top-24">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 border border-ink mb-2 font-extrabold text-sm uppercase tracking-tight transition-all ${
                      isActive
                        ? 'bg-accent text-ink shadow-brutal-sm'
                        : 'bg-white hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 bg-ink bg-opacity-50 z-50" onClick={() => setMobileMenuOpen(false)}>
              <div className="bg-white border-r-4 border-ink w-64 h-full p-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => {
                    onBackToPlatform?.();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-info text-white border border-ink mb-4 font-extrabold text-sm uppercase tracking-tight shadow-brutal-sm"
                >
                  <Home className="w-5 h-5" strokeWidth={2} />
                  <span>Back to Platform</span>
                </button>

                <nav>
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setCurrentView(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 border border-ink mb-2 font-extrabold text-sm uppercase tracking-tight transition-all ${
                          isActive
                            ? 'bg-accent text-ink shadow-brutal-sm'
                            : 'bg-white hover:translate-x-[2px] hover:translate-y-[2px]'
                        }`}
                      >
                        <Icon className="w-5 h-5" strokeWidth={2} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          <main className="flex-1 min-w-0">
            {currentView === 'dashboard' && <AdminDashboard adminRole={adminRole} />}
            {currentView === 'users' && <UserManagement adminRole={adminRole} />}
            {currentView === 'tickets' && <TicketSystem adminRole={adminRole} />}
            {currentView === 'analytics' && <AnalyticsDashboard adminRole={adminRole} />}
            {currentView === 'audit' && <AuditLog adminRole={adminRole} />}
            {currentView === 'settings' && (
              <div className="bg-white border-2 border-ink p-8 shadow-brutal-sm">
                <h2 className="text-2xl font-extrabold uppercase tracking-tight mb-4">SETTINGS</h2>
                <p className="text-sm">Admin settings coming soon...</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
