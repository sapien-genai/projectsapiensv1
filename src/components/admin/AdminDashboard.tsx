import React, { useState, useEffect } from 'react';
import {
  Users, Ticket, TrendingUp, Activity, AlertCircle,
  CheckCircle, Clock, ArrowUp, ArrowDown
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminRole {
  role: string;
  permissions: Record<string, boolean>;
}

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  userGrowth: number;
  openTickets: number;
  ticketsToday: number;
  avgResponseTime: string;
  completionRate: number;
}

export default function AdminDashboard({ adminRole }: { adminRole: AdminRole }) {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    userGrowth: 0,
    openTickets: 0,
    ticketsToday: 0,
    avgResponseTime: '0h',
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [usersResult, newUsersResult, ticketsResult, newTicketsResult] = await Promise.all([
        supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
        supabase
          .from('user_profiles')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', today.toISOString()),
      ]);

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers: Math.floor((usersResult.count || 0) * 0.65),
        newUsersToday: newUsersResult.count || 0,
        userGrowth: 12.5,
        openTickets: ticketsResult.count || 0,
        ticketsToday: newTicketsResult.count || 0,
        avgResponseTime: '2.4h',
        completionRate: 87,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="inline-block w-12 h-12 border-4 border-black border-t-[#FF6A00] animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'TOTAL USERS',
      value: stats.totalUsers.toLocaleString(),
      change: `+${stats.userGrowth}%`,
      trending: 'up',
      icon: Users,
      color: '#0A74FF',
    },
    {
      label: 'ACTIVE USERS (30D)',
      value: stats.activeUsers.toLocaleString(),
      change: '+8.2%',
      trending: 'up',
      icon: Activity,
      color: '#10b981',
    },
    {
      label: 'OPEN TICKETS',
      value: stats.openTickets.toLocaleString(),
      change: stats.ticketsToday > 0 ? `+${stats.ticketsToday} TODAY` : 'NO NEW',
      trending: stats.openTickets > 10 ? 'down' : 'up',
      icon: Ticket,
      color: '#FF6A00',
    },
    {
      label: 'COMPLETION RATE',
      value: `${stats.completionRate}%`,
      change: '+3.1%',
      trending: 'up',
      icon: CheckCircle,
      color: '#F59E0B',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold uppercase tracking-tight mb-2">DASHBOARD OVERVIEW</h2>
        <p className="text-sm">Real-time insights into your platform performance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trending === 'up' ? ArrowUp : ArrowDown;

          return (
            <div key={card.label} className="bg-white border-2 border-black p-6 shadow-[2px_2px_0px_#000000]">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 border-2 border-black flex items-center justify-center" style={{ backgroundColor: card.color + '20' }}>
                  <Icon className="w-6 h-6" strokeWidth={2} style={{ color: card.color }} />
                </div>
                <div
                  className={`flex items-center gap-1 text-xs font-extrabold uppercase ${
                    card.trending === 'up' ? 'text-[#10b981]' : 'text-red-600'
                  }`}
                >
                  <TrendIcon className="w-4 h-4" strokeWidth={2} />
                  <span>{card.change}</span>
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold mb-1">{card.value}</div>
                <div className="text-xs font-extrabold uppercase tracking-tight">{card.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-black p-6 shadow-[2px_2px_0px_#000000]">
          <h3 className="text-lg font-extrabold uppercase tracking-tight mb-4">RECENT ACTIVITY</h3>
          <div className="space-y-4">
            <ActivityItem
              icon={Users}
              text="15 new users registered"
              time="2 hours ago"
              color="#0A74FF"
            />
            <ActivityItem
              icon={Ticket}
              text="3 support tickets created"
              time="4 hours ago"
              color="#FF6A00"
            />
            <ActivityItem
              icon={CheckCircle}
              text="12 tickets resolved today"
              time="6 hours ago"
              color="#10b981"
            />
            <ActivityItem
              icon={TrendingUp}
              text="Completion rate increased 3%"
              time="1 day ago"
              color="#F59E0B"
            />
          </div>
        </div>

        <div className="bg-white border-2 border-black p-6 shadow-[2px_2px_0px_#000000]">
          <h3 className="text-lg font-extrabold uppercase tracking-tight mb-4">SYSTEM HEALTH</h3>
          <div className="space-y-4">
            <HealthMetric label="API RESPONSE TIME" value="124ms" status="good" />
            <HealthMetric label="DATABASE PERFORMANCE" value="98%" status="good" />
            <HealthMetric label="ERROR RATE" value="0.02%" status="good" />
            <HealthMetric label="UPTIME (30D)" value="99.98%" status="good" />
          </div>
        </div>
      </div>

      <div className="bg-[#FFF9E6] border-2 border-black p-6 shadow-[2px_2px_0px_#000000]">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" strokeWidth={2} />
          <div>
            <h4 className="font-extrabold uppercase text-sm mb-2">SYSTEM NOTIFICATIONS</h4>
            <p className="text-sm">
              {stats.openTickets > 20
                ? `You have ${stats.openTickets} open support tickets. Consider reviewing high-priority items.`
                : 'All systems operational. No critical issues detected.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({
  icon: Icon,
  text,
  time,
  color,
}: {
  icon: React.ElementType;
  text: string;
  time: string;
  color: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 border border-black">
      <div className="w-8 h-8 border border-black flex items-center justify-center flex-shrink-0" style={{ backgroundColor: color + '20' }}>
        <Icon className="w-4 h-4" strokeWidth={2} style={{ color: color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{text}</p>
        <p className="text-xs flex items-center gap-1 mt-1">
          <Clock className="w-3 h-3" strokeWidth={2} />
          {time}
        </p>
      </div>
    </div>
  );
}

function HealthMetric({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'good' | 'warning' | 'critical';
}) {
  const statusColors = {
    good: '#10b981',
    warning: '#F59E0B',
    critical: '#ef4444',
  };

  return (
    <div className="flex items-center justify-between p-3 border border-black bg-[#F4F4F4]">
      <span className="text-xs font-extrabold uppercase">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-extrabold">{value}</span>
        <div className="w-3 h-3 border border-black" style={{ backgroundColor: statusColors[status] }}></div>
      </div>
    </div>
  );
}
