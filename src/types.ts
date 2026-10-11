export type MeetingStatus = 'pending' | 'completed';
export type Sentiment = 'positive' | 'neutral' | 'negative' | null;
export type ActionItemStatus = 'pending' | 'in_progress' | 'done';

export interface ActionItem {
  id: string;
  text: string;
  owner: string;
  deadline: string | null;
  status: ActionItemStatus;
  priority: 'high' | 'medium' | 'low';
}

export interface KeyPoint {
  id: string;
  text: string;
  category: string;
}

export interface Decision {
  id: string;
  text: string;
  context: string;
}

export interface Question {
  id: string;
  text: string;
  raisedBy: string;
}

export interface TalkRatioEntry {
  name: string;
  percentage: number;
  wordCount: number;
}

export interface MeetingAnalysis {
  summary: string;
  keyPoints: KeyPoint[];
  actionItems: ActionItem[];
  decisions: Decision[];
  questions: Question[];
  topics: string[];
  sentiment: Sentiment;
  sentimentScore: number;
  talkRatios: TalkRatioEntry[];
  keywords: string[];
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration_minutes: number;
  participants: string[];
  transcript: string;
  status: MeetingStatus;
  summary: string | null;
  key_points: KeyPoint[];
  action_items: ActionItem[];
  decisions: Decision[];
  questions: Question[];
  topics: string[];
  sentiment: Sentiment;
  sentiment_score: number | null;
  talk_ratios: TalkRatioEntry[];
  keywords: string[];
  created_at: string;
  updated_at: string;
}

export type MeetingInput = Omit<Meeting, 'id' | 'created_at' | 'updated_at'>;

export interface DashboardStats {
  totalMeetings: number;
  completedAnalyses: number;
  pendingAnalyses: number;
  totalActionItems: number;
  completedActionItems: number;
  avgDuration: number;
  totalDuration: number;
  sentimentBreakdown: { positive: number; neutral: number; negative: number };
}
