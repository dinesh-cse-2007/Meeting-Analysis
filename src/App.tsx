import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { analyzeMeeting } from '@/lib/analysis';
import type { Meeting, ActionItem } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { MeetingForm } from '@/components/MeetingForm';
import { MeetingDetail } from '@/components/MeetingDetail';

type View = 'dashboard' | 'new' | 'detail';

function App() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(null);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const loadMeetings = useCallback(async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Failed to load meetings:', error);
      return;
    }

    setMeetings((data || []) as Meeting[]);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadMeetings();
      setLoading(false);
    })();
  }, [loadMeetings]);

  const selectedMeeting = meetings.find((m) => m.id === selectedMeetingId) || null;

  const handleNavigate = (view: 'dashboard' | 'new') => {
    if (view === 'new') {
      setEditingMeeting(null);
    }
    setCurrentView(view);
  };

  const handleSelectMeeting = (id: string) => {
    setSelectedMeetingId(id);
    setEditingMeeting(null);
    setCurrentView('detail');
  };

  const handleSaveMeeting = async (data: {
    title: string;
    date: string;
    duration_minutes: number;
    participants: string[];
    transcript: string;
  }) => {
    const analysis = analyzeMeeting(data.transcript, data.duration_minutes, data.participants);

    if (editingMeeting) {
      const { error } = await supabase
        .from('meetings')
        .update({
          title: data.title,
          date: data.date,
          duration_minutes: data.duration_minutes,
          participants: data.participants,
          transcript: data.transcript,
          status: 'completed',
          summary: analysis.summary,
          key_points: analysis.keyPoints,
          action_items: analysis.actionItems,
          decisions: analysis.decisions,
          questions: analysis.questions,
          topics: analysis.topics,
          sentiment: analysis.sentiment,
          sentiment_score: analysis.sentimentScore,
          talk_ratios: analysis.talkRatios,
          keywords: analysis.keywords,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingMeeting.id);

      if (error) throw error;

      await loadMeetings();
      setSelectedMeetingId(editingMeeting.id);
      setEditingMeeting(null);
      setCurrentView('detail');
    } else {
      const { data: inserted, error } = await supabase
        .from('meetings')
        .insert({
          title: data.title,
          date: data.date,
          duration_minutes: data.duration_minutes,
          participants: data.participants,
          transcript: data.transcript,
          status: 'completed',
          summary: analysis.summary,
          key_points: analysis.keyPoints,
          action_items: analysis.actionItems,
          decisions: analysis.decisions,
          questions: analysis.questions,
          topics: analysis.topics,
          sentiment: analysis.sentiment,
          sentiment_score: analysis.sentimentScore,
          talk_ratios: analysis.talkRatios,
          keywords: analysis.keywords,
        })
        .select()
        .single();

      if (error) throw error;

      await loadMeetings();
      setSelectedMeetingId(inserted.id);
      setCurrentView('detail');
    }
  };

  const handleEdit = () => {
    if (selectedMeeting) {
      setEditingMeeting(selectedMeeting);
      setCurrentView('new');
    }
  };

  const handleDelete = async () => {
    if (!selectedMeetingId) return;
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', selectedMeetingId);

    if (error) {
      console.error('Failed to delete meeting:', error);
      return;
    }

    setSelectedMeetingId(null);
    setCurrentView('dashboard');
    await loadMeetings();
  };

  const handleUpdateActionItem = async (meetingId: string, actionItem: ActionItem) => {
    const meeting = meetings.find((m) => m.id === meetingId);
    if (!meeting) return;

    const updatedItems = meeting.action_items.map((a) =>
      a.id === actionItem.id ? actionItem : a,
    );

    const { error } = await supabase
      .from('meetings')
      .update({
        action_items: updatedItems,
        updated_at: new Date().toISOString(),
      })
      .eq('id', meetingId);

    if (error) throw error;

    await loadMeetings();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        meetings={meetings}
        currentView={currentView}
        selectedMeetingId={selectedMeetingId}
        onNavigate={handleNavigate}
        onSelectMeeting={handleSelectMeeting}
      />
      {currentView === 'dashboard' && (
        <Dashboard
          meetings={meetings}
          onSelectMeeting={handleSelectMeeting}
          onCreateMeeting={() => handleNavigate('new')}
          loading={loading}
        />
      )}
      {currentView === 'new' && (
        <MeetingForm
          onBack={() => {
            setEditingMeeting(null);
            setCurrentView(editingMeeting ? 'detail' : 'dashboard');
          }}
          onSave={handleSaveMeeting}
          existingMeeting={editingMeeting}
        />
      )}
      {currentView === 'detail' && selectedMeeting && (
        <MeetingDetail
          meeting={selectedMeeting}
          onBack={() => {
            setSelectedMeetingId(null);
            setCurrentView('dashboard');
          }}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onUpdateActionItem={handleUpdateActionItem}
        />
      )}
      {currentView === 'detail' && !selectedMeeting && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Meeting not found.</p>
        </div>
      )}
    </div>
  );
}

export default App;
