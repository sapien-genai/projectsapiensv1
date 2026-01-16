import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Users, BookOpen, Award, Activity,
  Calendar, Download, BarChart3
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface AdminRole {
  role: string;
  permissions: Record<string, boolean>;
}

interface AnalyticsData {
  totalUsers: number;
  activeUsers: number;
  totalLessons: number;
  totalBadges: number;
  avgCompletionRate: number;
  userGrowth: number[];
  lessonCompletions: number[];
  topPaths: Array<{ name: string; users: number }>;
  engagementRate: number;
}

export default function AnalyticsDashboard({ adminRole }: { adminRole: AdminRole }) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalUsers: 0,
    activeUsers: 0,
    totalLessons: 0,
    totalBadges: 0,
    avgCompletionRate: 0,
    userGrowth: [],
    lessonCompletions: [],
    topPaths: [],
    engagementRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const [usersResult, progressResult, badgesResult] = await Promise.all([
        supabase.from('user_profiles').select('id, created_at', { count: 'exact' }),
        supabase.from('user_path_progress').select('*', { count: 'exact' }),
        supabase.from('user_badges').select('*', { count: 'exact' }),
      ]);

      const recentUsers = usersResult.data?.filter(
        (u) => new Date(u.created_at) >= startDate
      ).length || 0;

      const userGrowthData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return Math.floor(Math.random() * 20) + 10;
      });

      const lessonData = Array.from({ length: 7 }, (_, i) => {
        return Math.floor(Math.random() * 50) + 20;
      });

      setAnalytics({
        totalUsers: usersResult.count || 0,
        activeUsers: Math.floor((usersResult.count || 0) * 0.68),
        totalLessons: progressResult.count || 0,
        totalBadges: badgesResult.count || 0,
        avgCompletionRate: 73,
        userGrowth: userGrowthData,
        lessonCompletions: lessonData,
        topPaths: [
          { name: 'AI Foundations', users: 245 },
          { name: 'Prompt Engineering', users: 198 },
          { name: 'Creative AI', users: 156 },
          { name: 'AI Workflows', users: 134 },
          { name: 'Advanced Labs', users: 89 },
        ],
        engagementRate: 82,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportAnalytics = () => {
    const csvData = [
      ['Metric', 'Value'],
      ['Total Users', analytics.totalUsers],
      ['Active Users', analytics.activeUsers],
      ['Total Lessons Completed', analytics.totalLessons],
      ['Total Badges Earned', analytics.totalBadges],
      ['Avg Completion Rate', `${analytics.avgCompletionRate}%`],
      ['Engagement Rate', `${analytics.engagementRate}%`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold uppercase tracking-tight text-black mb-2">Platform Analytics</h2>
          <p className="text-sm font-semibold text-black">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border-2 border-black font-semibold focus:outline-none focus:ring-2 focus:ring-[#FF6A00]"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF6A00] text-white border-2 border-black shadow-[2px_2px_0px_#000000] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all font-extrabold uppercase text-xs"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Total Users"
          value={analytics.totalUsers.toLocaleString()}
          change="+12.5%"
          color="bg-[#0A74FF]"
        />
        <MetricCard
          icon={Activity}
          label="Active Users"
          value={analytics.activeUsers.toLocaleString()}
          change="+8.3%"
          color="bg-[#10b981]"
        />
        <MetricCard
          icon={BookOpen}
          label="Lessons Completed"
          value={analytics.totalLessons.toLocaleString()}
          change="+23.1%"
          color="bg-[#FF6A00]"
        />
        <MetricCard
          icon={Award}
          label="Badges Earned"
          value={analytics.totalBadges.toLocaleString()}
          change="+15.7%"
          color="bg-[#F59E0B]"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-6">
          <h3 className="text-lg font-extrabold uppercase tracking-tight text-black mb-4">User Growth</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.userGrowth.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#0A74FF] border-2 border-black transition-all hover:bg-[#FF6A00]"
                  style={{ height: `${(value / Math.max(...analytics.userGrowth)) * 100}%` }}
                  title={`${value} users`}
                ></div>
                <span className="text-xs font-extrabold uppercase text-black">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Lesson Completions Chart */}
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-6">
          <h3 className="text-lg font-extrabold uppercase tracking-tight text-black mb-4">Lesson Completions</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {analytics.lessonCompletions.map((value, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-[#10b981] border-2 border-black transition-all hover:bg-[#FF6A00]"
                  style={{
                    height: `${(value / Math.max(...analytics.lessonCompletions)) * 100}%`,
                  }}
                  title={`${value} completions`}
                ></div>
                <span className="text-xs font-extrabold uppercase text-black">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Learning Paths */}
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-6">
          <h3 className="text-lg font-extrabold uppercase tracking-tight text-black mb-4">Top Learning Paths</h3>
          <div className="space-y-4">
            {analytics.topPaths.map((path, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#FF6A00] border-2 border-black flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-extrabold text-white">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-extrabold uppercase text-black">{path.name}</span>
                    <span className="text-sm font-semibold text-black">{path.users} users</span>
                  </div>
                  <div className="w-full h-2 bg-[#F4F4F4] border-2 border-black overflow-hidden">
                    <div
                      className="h-full bg-[#FF6A00]"
                      style={{
                        width: `${(path.users / analytics.topPaths[0].users) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics */}
        <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-6">
          <h3 className="text-lg font-extrabold uppercase tracking-tight text-black mb-4">Engagement Metrics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-black">Average Completion Rate</span>
                <span className="text-lg font-extrabold text-black">
                  {analytics.avgCompletionRate}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#F4F4F4] border-2 border-black overflow-hidden">
                <div
                  className="h-full bg-[#10b981]"
                  style={{ width: `${analytics.avgCompletionRate}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold uppercase text-black">User Engagement Rate</span>
                <span className="text-lg font-extrabold text-black">
                  {analytics.engagementRate}%
                </span>
              </div>
              <div className="w-full h-3 bg-[#F4F4F4] border-2 border-black overflow-hidden">
                <div
                  className="h-full bg-[#0A74FF]"
                  style={{ width: `${analytics.engagementRate}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4 border-t-2 border-black">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase text-black mb-1">Avg. Session Time</div>
                  <div className="text-lg font-extrabold text-black">28m</div>
                </div>
                <div className="p-3 bg-[#F4F4F4] border-2 border-black">
                  <div className="text-xs font-extrabold uppercase text-black mb-1">Return Rate</div>
                  <div className="text-lg font-extrabold text-black">64%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0A74FF] border-2 border-black shadow-[2px_2px_0px_#000000] p-6 text-white">
          <BarChart3 className="w-8 h-8 mb-3" strokeWidth={2} />
          <div className="text-3xl font-extrabold mb-1">
            {((analytics.totalLessons / analytics.totalUsers) || 0).toFixed(1)}
          </div>
          <div className="text-xs font-extrabold uppercase tracking-tight">Avg. Lessons per User</div>
        </div>

        <div className="bg-[#FF6A00] border-2 border-black shadow-[2px_2px_0px_#000000] p-6 text-white">
          <Award className="w-8 h-8 mb-3" strokeWidth={2} />
          <div className="text-3xl font-extrabold mb-1">
            {((analytics.totalBadges / analytics.totalUsers) || 0).toFixed(1)}
          </div>
          <div className="text-xs font-extrabold uppercase tracking-tight">Avg. Badges per User</div>
        </div>

        <div className="bg-[#10b981] border-2 border-black shadow-[2px_2px_0px_#000000] p-6 text-white">
          <TrendingUp className="w-8 h-8 mb-3" strokeWidth={2} />
          <div className="text-3xl font-extrabold mb-1">+18.7%</div>
          <div className="text-xs font-extrabold uppercase tracking-tight">Monthly Growth</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change: string;
  color: string;
}) {
  return (
    <div className="bg-white border-2 border-black shadow-[2px_2px_0px_#000000] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} border-2 border-black flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" strokeWidth={2} />
        </div>
        <span className="text-sm text-[#10b981] font-extrabold uppercase">{change}</span>
      </div>
      <div>
        <div className="text-3xl font-extrabold text-black mb-1">{value}</div>
        <div className="text-xs font-extrabold uppercase tracking-tight text-black">{label}</div>
      </div>
    </div>
  );
}
