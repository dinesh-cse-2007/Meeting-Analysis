import { useMemo } from 'react';
import {
  AudioLines,
  LayoutDashboard,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import type { Meeting, DashboardStats } from '@/types';

interface SidebarProps {
  meetings: Meeting[];
  currentView: 'dashboard' | 'new' | 'detail';
  selectedMeetingId: string | null;
  onNavigate: (view: 'dashboard' | 'new') => void;
  onSelectMeeting: (id: string) => void;
}

export function Sidebar({
  meetings,
  currentView,
  selectedMeetingId,
  onNavigate,
  onSelectMeeting,
}: SidebarProps) {
  const stats = useMemo<DashboardStats>(() => {
    const completed = meetings.filter((m) => m.status === 'completed');
    const allActionItems = completed.flatMap((m) => m.action_items);
    return {
      totalMeetings: meetings.length,
      completedAnalyses: completed.length,
      pendingAnalyses: meetings.filter((m) => m.status === 'pending').length,
      totalActionItems: allActionItems.length,
      completedActionItems: allActionItems.filter((a) => a.status === 'done').length,
      avgDuration: meetings.length
        ? Math.round(meetings.reduce((s, m) => s + m.duration_minutes, 0) / meetings.length)
        : 0,
      totalDuration: meetings.reduce((s, m) => s + m.duration_minutes, 0),
      sentimentBreakdown: {
        positive: completed.filter((m) => m.sentiment === 'positive').length,
        neutral: completed.filter((m) => m.sentiment === 'neutral').length,
        negative: completed.filter((m) => m.sentiment === 'negative').length,
      },
    };
  }, [meetings]);

  const recentMeetings = useMemo(
    () =>
      [...meetings]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 8),
    [meetings],
  );

  return (
    <aside className="w-72 shrink-0 h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
            <AudioLines className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-900 leading-tight">
              Meeting Analysis
            </h1>
            <p className="text-xs text-slate-500">Transcript Intelligence</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-3 border-b border-slate-100">
        <button
          onClick={() => onNavigate('new')}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentView === 'new'
              ? 'bg-brand-50 text-brand-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Meeting
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
            currentView === 'dashboard'
              ? 'bg-brand-50 text-brand-700'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
      </div>

      <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-slate-100">
        <StatChip icon={Calendar} label="Meetings" value={stats.totalMeetings} />
        <StatChip icon={CheckCircle2} label="Analyzed" value={stats.completedAnalyses} />
        <StatChip icon={AlertCircle} label="Pending" value={stats.pendingAnalyses} />
        <StatChip icon={Clock} label="Total min" value={stats.totalDuration} />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3">
        <p className="px-2 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Recent Meetings
        </p>
        {recentMeetings.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <p className="text-sm text-slate-400">No meetings yet</p>
            <p className="text-xs text-slate-400 mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {recentMeetings.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectMeeting(m.id)}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition-all group ${
                  selectedMeetingId === m.id && currentView === 'detail'
                    ? 'bg-brand-50 text-brand-900'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      m.status === 'completed'
                        ? 'bg-emerald-500'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span className="text-sm font-medium truncate flex-1">{m.title}</span>
                </div>
                <div className="flex items-center gap-2 mt-1 ml-3.5">
                  <span className="text-xs text-slate-400">
                    {new Date(m.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                  {m.status === 'completed' && m.action_items.length > 0 && (
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      {m.action_items.length}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-soft" />
          <span>Connected to Supabase</span>
        </div>
      </div>
    </aside>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-slate-50 rounded-lg px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-slate-400 mb-0.5">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-lg font-semibold text-slate-800">{value}</p>
    </div>
  );
}
