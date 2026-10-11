import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Minus,
  ListTodo,
  CheckCircle2,
  Target,
  HelpCircle,
  Tag,
  FileText,
  BarChart3,
  Hash,
  Trash2,
  Edit3,
  AlertCircle,
  Circle,
  Clock as ClockIcon,
  ArrowRight,
} from 'lucide-react';
import type { Meeting, ActionItem } from '@/types';

interface MeetingDetailProps {
  meeting: Meeting;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdateActionItem: (meetingId: string, actionItem: ActionItem) => Promise<void>;
}

type Tab = 'overview' | 'summary' | 'actions' | 'decisions' | 'questions' | 'transcript' | 'insights';

export function MeetingDetail({
  meeting,
  onBack,
  onEdit,
  onDelete,
  onUpdateActionItem,
}: MeetingDetailProps) {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const date = new Date(meeting.date);

  const sentimentInfo = useMemo(() => {
    switch (meeting.sentiment) {
      case 'positive':
        return { label: 'Positive', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
      case 'negative':
        return { label: 'Negative', icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' };
      default:
        return { label: 'Neutral', icon: Minus, color: 'text-slate-600', bg: 'bg-slate-100', bar: 'bg-slate-400' };
    }
  }, [meeting.sentiment]);

  const tabs: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'actions', label: 'Action Items', icon: ListTodo, count: meeting.action_items.length },
    { id: 'decisions', label: 'Decisions', icon: Target, count: meeting.decisions.length },
    { id: 'questions', label: 'Questions', icon: HelpCircle, count: meeting.questions.length },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'transcript', label: 'Transcript', icon: FileText },
  ];

  return (
    <div className="flex-1 h-screen overflow-y-auto scrollbar-thin bg-slate-50">
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Delete?</span>
                <button
                  onClick={onDelete}
                  className="px-2.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-medium hover:bg-rose-700 transition-colors"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg text-sm font-medium transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{meeting.title}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {meeting.duration_minutes} minutes
            </span>
            {meeting.participants.length > 0 && (
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                {meeting.participants.join(', ')}
              </span>
            )}
          </div>
        </div>

        {meeting.status === 'pending' ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center animate-scale-in">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-base font-semibold text-amber-900">Analysis Pending</h3>
            <p className="text-sm text-amber-700 mt-1">
              This meeting hasn't been analyzed yet. Edit and re-save to run analysis.
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-1.5 mb-6 border-b border-slate-200 pb-px animate-slide-up">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors rounded-t-lg ${
                    activeTab === tab.id
                      ? 'text-brand-700'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span
                      className={`ml-0.5 px-1.5 py-0.5 text-xs font-semibold rounded-full ${
                        activeTab === tab.id
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="animate-fade-in" key={activeTab}>
              {activeTab === 'overview' && (
                <OverviewTab meeting={meeting} sentimentInfo={sentimentInfo} onJump={setActiveTab} />
              )}
              {activeTab === 'summary' && <SummaryTab meeting={meeting} />}
              {activeTab === 'actions' && (
                <ActionItemsTab
                  meeting={meeting}
                  onUpdateActionItem={onUpdateActionItem}
                />
              )}
              {activeTab === 'decisions' && <DecisionsTab meeting={meeting} />}
              {activeTab === 'questions' && <QuestionsTab meeting={meeting} />}
              {activeTab === 'insights' && (
                <InsightsTab meeting={meeting} sentimentInfo={sentimentInfo} />
              )}
              {activeTab === 'transcript' && <TranscriptTab meeting={meeting} />}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

type SentimentInfo = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  bar: string;
};

function OverviewTab({
  meeting,
  sentimentInfo,
  onJump,
}: {
  meeting: Meeting;
  sentimentInfo: SentimentInfo;
  onJump: (tab: Tab) => void;
}) {
  const { SentimentIcon } = { SentimentIcon: sentimentInfo.icon };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <OverviewCard
          icon={sentimentInfo.icon}
          label="Sentiment"
          value={sentimentInfo.label}
          subValue={meeting.sentiment_score !== null ? `Score: ${meeting.sentiment_score}` : undefined}
          colorClass={sentimentInfo.bg}
          textClass={sentimentInfo.color}
        />
        <OverviewCard
          icon={ListTodo}
          label="Action Items"
          value={meeting.action_items.length}
          subValue={`${meeting.action_items.filter((a) => a.status === 'done').length} completed`}
          colorClass="bg-amber-50"
          textClass="text-amber-600"
          onClick={() => onJump('actions')}
        />
        <OverviewCard
          icon={Target}
          label="Decisions"
          value={meeting.decisions.length}
          colorClass="bg-brand-50"
          textClass="text-brand-600"
          onClick={() => onJump('decisions')}
        />
        <OverviewCard
          icon={HelpCircle}
          label="Open Questions"
          value={meeting.questions.length}
          colorClass="bg-purple-50"
          textClass="text-purple-600"
          onClick={() => onJump('questions')}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-400" />
          Summary
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">{meeting.summary}</p>
      </div>

      {meeting.topics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            Topics Discussed
          </h3>
          <div className="flex flex-wrap gap-2">
            {meeting.topics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1.5 bg-brand-50 text-brand-700 text-sm font-medium rounded-lg"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {meeting.keywords.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />
            Keywords
          </h3>
          <div className="flex flex-wrap gap-2">
            {meeting.keywords.map((kw, i) => (
              <span
                key={kw}
                className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md"
                style={{ fontSize: `${Math.max(0.7, 1 - i * 0.02)}rem` }}
              >
                {kw}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewCard({
  icon: Icon,
  label,
  value,
  subValue,
  colorClass,
  textClass,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  subValue?: string;
  colorClass: string;
  textClass: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`bg-white rounded-xl border border-slate-200 p-4 text-left ${onClick ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''} transition-all`}
    >
      <div className={`w-9 h-9 rounded-lg ${colorClass} ${textClass} flex items-center justify-center mb-2`}>
        <Icon className="w-4.5 h-4.5" />
      </div>
      <p className="text-xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
    </button>
  );
}

function SummaryTab({ meeting }: { meeting: Meeting }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Executive Summary</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{meeting.summary}</p>
      </div>

      {meeting.key_points.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Key Points</h3>
          <div className="space-y-3">
            {meeting.key_points.map((kp, i) => (
              <div key={kp.id} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-slate-700 leading-relaxed">{kp.text}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                    {kp.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionItemsTab({
  meeting,
  onUpdateActionItem,
}: {
  meeting: Meeting;
  onUpdateActionItem: (meetingId: string, actionItem: ActionItem) => Promise<void>;
}) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleToggle = async (item: ActionItem) => {
    const newStatus = item.status === 'done' ? 'pending' : 'done';
    setUpdating(item.id);
    try {
      await onUpdateActionItem(meeting.id, { ...item, status: newStatus });
    } finally {
      setUpdating(null);
    }
  };

  if (meeting.action_items.length === 0) {
    return (
      <EmptyState icon={ListTodo} message="No action items were detected in this transcript." />
    );
  }

  const priorityColors = {
    high: 'bg-rose-50 text-rose-600 border-rose-200',
    medium: 'bg-amber-50 text-amber-600 border-amber-200',
    low: 'bg-slate-50 text-slate-500 border-slate-200',
  };

  return (
    <div className="space-y-2">
      {meeting.action_items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 group hover:shadow-sm transition-all"
        >
          <button
            onClick={() => handleToggle(item)}
            disabled={updating === item.id}
            className="mt-0.5 shrink-0 transition-all hover:scale-110"
          >
            {item.status === 'done' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300 hover:text-brand-400" />
            )}
          </button>
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm leading-relaxed ${
                item.status === 'done' ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}
            >
              {item.text}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                <Users className="w-3 h-3" />
                {item.owner}
              </span>
              {item.deadline && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">
                  <ClockIcon className="w-3 h-3" />
                  {item.deadline}
                </span>
              )}
              <span
                className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded border ${priorityColors[item.priority]}`}
              >
                {item.priority}
              </span>
              {item.status === 'in_progress' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-brand-50 text-brand-600 text-xs rounded">
                  In Progress
                </span>
              )}
            </div>
          </div>
          {updating === item.id && (
            <div className="w-4 h-4 border-2 border-brand-200 border-t-brand-600 rounded-full animate-spin shrink-0 mt-1" />
          )}
        </div>
      ))}
    </div>
  );
}

function DecisionsTab({ meeting }: { meeting: Meeting }) {
  if (meeting.decisions.length === 0) {
    return (
      <EmptyState icon={Target} message="No explicit decisions were detected in this transcript." />
    );
  }

  return (
    <div className="space-y-2">
      {meeting.decisions.map((decision, i) => (
        <div
          key={decision.id}
          className="bg-white rounded-xl border border-slate-200 p-4"
        >
          <div className="flex gap-3">
            <div className="shrink-0 w-7 h-7 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-700 leading-relaxed">{decision.text}</p>
              {decision.context && (
                <div className="mt-2 pl-3 border-l-2 border-slate-100">
                  <p className="text-xs text-slate-400 leading-relaxed italic">
                    Context: {decision.context}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuestionsTab({ meeting }: { meeting: Meeting }) {
  if (meeting.questions.length === 0) {
    return (
      <EmptyState icon={HelpCircle} message="No open questions were detected in this transcript." />
    );
  }

  return (
    <div className="space-y-2">
      {meeting.questions.map((question) => (
        <div
          key={question.id}
          className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3"
        >
          <div className="shrink-0 w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-700 leading-relaxed">{question.text}</p>
            <span className="inline-block mt-2 text-xs text-slate-400">
              Raised by {question.raisedBy}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function InsightsTab({
  meeting,
  sentimentInfo,
}: {
  meeting: Meeting;
  sentimentInfo: SentimentInfo;
}) {
  const maxRatio = Math.max(...meeting.talk_ratios.map((t) => t.percentage), 1);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-slate-400" />
          Sentiment Analysis
        </h3>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl ${sentimentInfo.bg} ${sentimentInfo.color} flex items-center justify-center`}>
            <sentimentInfo.icon className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-slate-900">{sentimentInfo.label}</p>
            <p className="text-sm text-slate-500">
              Sentiment Score: {meeting.sentiment_score}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex h-3 rounded-full overflow-hidden bg-slate-100">
            <div className="bg-emerald-500" style={{ width: `${meeting.sentiment === 'positive' ? 70 : meeting.sentiment === 'neutral' ? 20 : 10}%` }} />
            <div className="bg-slate-300" style={{ width: `${meeting.sentiment === 'neutral' ? 60 : 20}%` }} />
            <div className="bg-rose-500" style={{ width: `${meeting.sentiment === 'negative' ? 70 : 10}%` }} />
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>Negative</span>
            <span>Neutral</span>
            <span>Positive</span>
          </div>
        </div>
      </div>

      {meeting.talk_ratios.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Speaker Talk Distribution
          </h3>
          <div className="space-y-3">
            {meeting.talk_ratios.map((entry) => (
              <div key={entry.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-slate-700">{entry.name}</span>
                  <span className="text-xs text-slate-500">
                    {entry.percentage}% · {entry.wordCount.toLocaleString()} words
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-500"
                    style={{ width: `${(entry.percentage / maxRatio) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {meeting.topics.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-slate-400" />
            Topic Distribution
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {meeting.topics.map((topic) => {
              const pointCount = meeting.key_points.filter((k) => k.category === topic).length;
              return (
                <div
                  key={topic}
                  className="flex items-center justify-between px-3 py-2.5 bg-slate-50 rounded-lg"
                >
                  <span className="text-sm text-slate-700">{topic}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <ArrowRight className="w-3 h-3" />
                    {pointCount} points
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function TranscriptTab({ meeting }: { meeting: Meeting }) {
  const lines = meeting.transcript.split('\n').filter(Boolean);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
        <FileText className="w-4 h-4 text-slate-400" />
        Full Transcript
      </h3>
      <div className="space-y-2 max-h-[600px] overflow-y-auto scrollbar-thin">
        {lines.map((line, i) => {
          const match = line.match(/^(.+?):\s*(.+)$/);
          if (match) {
            return (
              <div key={i} className="flex gap-3 py-1.5">
                <span className="shrink-0 text-sm font-semibold text-brand-600 w-32 truncate">
                  {match[1]}
                </span>
                <span className="text-sm text-slate-600 leading-relaxed">{match[2]}</span>
              </div>
            );
          }
          return (
            <p key={i} className="text-sm text-slate-600 leading-relaxed py-1.5 pl-32">
              {line}
            </p>
          );
        })}
      </div>
    </div>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: React.ComponentType<{ className?: string }>;
  message: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-10 text-center">
      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-slate-400" />
      </div>
      <p className="text-sm text-slate-500">{message}</p>
    </div>
  );
}
