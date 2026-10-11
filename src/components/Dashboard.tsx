import { useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ListTodo,
  Users,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import type { Meeting, DashboardStats } from '@/types';

interface DashboardProps {
  meetings: Meeting[];
  onSelectMeeting: (id: string) => void;
  onCreateMeeting: () => void;
  loading: boolean;
}

export function Dashboard({ meetings, onSelectMeeting, onCreateMeeting, loading }: DashboardProps) {
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

  const sortedMeetings = useMemo(
    () =>
      [...meetings].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      ),
    [meetings],
  );

  if (loading) {
    return (
      <div className="flex-1 h-screen overflow-y-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-64 bg-slate-200 rounded-lg" />
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-xl" />
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-slate-100 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="flex-1 h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md animate-slide-up">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-brand-500/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyze Your Meetings</h2>
          <p className="text-slate-500 mb-6 text-balance">
            Upload a meeting transcript and get instant insights — summaries, action items,
            decisions, sentiment analysis, and speaker talk ratios.
          </p>
          <button
            onClick={onCreateMeeting}
            className="inline-flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Create Your First Meeting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen overflow-y-auto scrollbar-thin bg-slate-50">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="mb-6 flex items-center justify-between animate-slide-up">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Overview of your meeting analyses
            </p>
          </div>
          <button
            onClick={onCreateMeeting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Meeting
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-slide-up">
          <StatCard
            icon={Calendar}
            label="Total Meetings"
            value={stats.totalMeetings}
            color="brand"
          />
          <StatCard
            icon={CheckCircle2}
            label="Analyzed"
            value={stats.completedAnalyses}
            subValue={`${stats.pendingAnalyses} pending`}
            color="emerald"
          />
          <StatCard
            icon={ListTodo}
            label="Action Items"
            value={stats.totalActionItems}
            subValue={`${stats.completedActionItems} done`}
            color="amber"
          />
          <StatCard
            icon={Clock}
            label="Avg Duration"
            value={`${stats.avgDuration}m`}
            subValue={`${stats.totalDuration}m total`}
            color="slate"
          />
        </div>

        {stats.completedAnalyses > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-slide-up">
            <SentimentCard
              label="Positive"
              count={stats.sentimentBreakdown.positive}
              total={stats.completedAnalyses}
              icon={TrendingUp}
              color="emerald"
            />
            <SentimentCard
              label="Neutral"
              count={stats.sentimentBreakdown.neutral}
              total={stats.completedAnalyses}
              icon={Minus}
              color="slate"
            />
            <SentimentCard
              label="Negative"
              count={stats.sentimentBreakdown.negative}
              total={stats.completedAnalyses}
              icon={TrendingDown}
              color="rose"
            />
          </div>
        )}

        <div className="animate-slide-up">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-brand-500 rounded-full" />
            All Meetings
          </h3>
          <div className="space-y-2">
            {sortedMeetings.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                onClick={() => onSelectMeeting(meeting.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  color: 'brand' | 'emerald' | 'amber' | 'slate';
}) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className={`w-9 h-9 rounded-lg ${colorMap[color]} flex items-center justify-center`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
    </div>
  );
}

function SentimentCard({
  label,
  count,
  total,
  icon: Icon,
  color,
}: {
  label: string;
  count: number;
  total: number;
  icon: React.ComponentType<{ className?: string }>;
  color: 'emerald' | 'slate' | 'rose';
}) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', bar: 'bg-emerald-500' },
    slate: { bg: 'bg-slate-100', text: 'text-slate-600', bar: 'bg-slate-400' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', bar: 'bg-rose-500' },
  };
  const c = colorMap[color];
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg ${c.bg} ${c.text} flex items-center justify-center`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-bold text-slate-900">{count}</span>
        <span className="text-xs text-slate-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full ${c.bar} rounded-full transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MeetingCard({ meeting, onClick }: { meeting: Meeting; onClick: () => void }) {
  const date = new Date(meeting.date);
  const isCompleted = meeting.status === 'completed';

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-slate-200 p-4 text-left hover:border-brand-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate group-hover:text-brand-700 transition-colors">
              {meeting.title}
            </h4>
            {isCompleted ? (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                <CheckCircle2 className="w-3 h-3" />
                Analyzed
              </span>
            ) : (
              <span className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                <AlertCircle className="w-3 h-3" />
                Pending
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {meeting.duration_minutes}m
            </span>
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {meeting.participants.length}
              </span>
            )}
          </div>
          {isCompleted && meeting.summary && (
            <p className="text-sm text-slate-500 mt-2 line-clamp-2">{meeting.summary}</p>
          )}
          {isCompleted && (
            <div className="flex items-center gap-3 mt-2.5">
              {meeting.action_items.length > 0 && (
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ListTodo className="w-3 h-3" />
                  {meeting.action_items.length} actions
                </span>
              )}
              {meeting.decisions.length > 0 && (
                <span className="text-xs text-slate-400">
                  {meeting.decisions.length} decisions
                </span>
              )}
              {meeting.topics.length > 0 && (
                <div className="flex items-center gap-1">
                  {meeting.topics.slice(0, 2).map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-xs rounded"
                    >
                      {t}
                    </span>
                  ))}
                  {meeting.topics.length > 2 && (
                    <span className="text-xs text-slate-400">+{meeting.topics.length - 2}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors shrink-0 mt-1" />
      </div>
    </button>
  );
}
