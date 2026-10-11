import { useState, useRef } from 'react';
import { ArrowLeft, Sparkles, FileText, Users, Calendar, Clock, Upload, X } from 'lucide-react';
import type { Meeting } from '@/types';

interface MeetingFormProps {
  onBack: () => void;
  onSave: (data: {
    title: string;
    date: string;
    duration_minutes: number;
    participants: string[];
    transcript: string;
  }) => Promise<void>;
  existingMeeting?: Meeting | null;
}

const SAMPLE_TRANSCRIPT = `Sarah: Thanks everyone for joining the product roadmap discussion. Let's start with Q4 priorities.

Mike: I think we should focus on the new dashboard redesign. Users have been requesting better analytics for months.

Sarah: Agreed. The dashboard is critical. We need to finalize the design by next Friday. Mike, can you lead the design effort?

Mike: Yes, I'll prepare the wireframes and share them with the team by Wednesday.

Jennifer: What about the API integration project? We committed to delivering it this quarter.

Sarah: Good point. We decided to prioritize the API integration over the mobile app feature. Jennifer, you're responsible for coordinating with the engineering team on the API timeline.

Jennifer: I'll schedule a meeting with engineering for next Monday to go over the requirements. I'm concerned about the timeline though - we might need an additional developer.

Mike: That's a valid concern. Should we consider hiring a contractor for the API work?

Sarah: Let's table the hiring discussion for now. Jennifer, please investigate the resource gap and report back by end of next week. We need to be careful about budget.

Jennifer: Understood. I'll draft a resource plan and share it with leadership.

Mike: I'm excited about the progress we're making. The dashboard redesign will be a huge win for user engagement.

Sarah: Absolutely. Let's also think about the marketing rollout. We'll need to coordinate with the marketing team for the launch.

Jennifer: I can reach out to the marketing team and set up a sync. What features should we highlight?

Sarah: Great question. Let's decide on the key messaging during our next meeting. For now, focus on the API integration and resource planning.

Mike: I'll also review the current user feedback to inform the dashboard design. There's a lot of valuable input from the last survey.

Sarah: Perfect. To summarize: Mike is working on dashboard wireframes by Wednesday, Jennifer is scheduling the engineering meeting and drafting a resource plan by end of next week. Our next meeting will be in two weeks to review progress.`;

export function MeetingForm({ onBack, onSave, existingMeeting }: MeetingFormProps) {
  const [title, setTitle] = useState(existingMeeting?.title || '');
  const [date, setDate] = useState(
    existingMeeting
      ? new Date(existingMeeting.date).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
  );
  const [duration, setDuration] = useState(existingMeeting?.duration_minutes?.toString() || '30');
  const [participants, setParticipants] = useState<string[]>(existingMeeting?.participants || []);
  const [participantInput, setParticipantInput] = useState('');
  const [transcript, setTranscript] = useState(existingMeeting?.transcript || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddParticipant = () => {
    const trimmed = participantInput.trim();
    if (trimmed && !participants.includes(trimmed)) {
      setParticipants([...participants, trimmed]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const handleLoadSample = () => {
    setTitle('Product Roadmap Q4 Planning');
    setDuration('45');
    setParticipants(['Sarah', 'Mike', 'Jennifer']);
    setTranscript(SAMPLE_TRANSCRIPT);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setTranscript(text);

      const names = new Set<string>();
      const lines = text.split('\n');
      for (const line of lines) {
        const match = line.match(/^(.+?):\s/);
        if (match) names.add(match[1].trim());
      }
      if (names.size > 0) {
        setParticipants(Array.from(names));
      }
      if (!title) {
        setTitle(file.name.replace(/\.[^.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Please enter a meeting title.');
      return;
    }
    if (!transcript.trim()) {
      setError('Please enter or upload a transcript.');
      return;
    }
    if (transcript.trim().length < 50) {
      setError('Transcript is too short for meaningful analysis (minimum 50 characters).');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        date: new Date(date).toISOString(),
        duration_minutes: parseInt(duration) || 30,
        participants,
        transcript: transcript.trim(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meeting.');
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 h-screen overflow-y-auto scrollbar-thin bg-slate-50">
      <div className="max-w-3xl mx-auto px-8 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="mb-6 animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-900">
            {existingMeeting ? 'Edit Meeting' : 'New Meeting'}
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Add a transcript and we'll analyze it for insights automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 animate-slide-up">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Meeting Title
              </span>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q4 Product Planning"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </label>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Date & Time
                </span>
                <input
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  Duration (minutes)
                </span>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  max="600"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                />
              </label>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5 mb-2">
              <Users className="w-4 h-4 text-slate-400" />
              Participants
            </span>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={participantInput}
                onChange={(e) => setParticipantInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddParticipant();
                  }
                }}
                placeholder="Add a name and press Enter"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={handleAddParticipant}
                className="px-3 py-2.5 bg-slate-100 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Add
              </button>
            </div>
            {participants.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {participants.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs font-medium rounded-full"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => handleRemoveParticipant(name)}
                      className="hover:text-brand-900 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                Meeting Transcript
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload .txt
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.text,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <span className="text-slate-200">|</span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-xs text-slate-500 hover:text-brand-600 flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Load Sample
                </button>
              </div>
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder={`Paste your transcript here. Use "Name: dialogue" format for speaker detection.\n\nExample:\nJohn: Let's discuss the project timeline.\nSarah: I think we can deliver by Friday.`}
              rows={12}
              className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all font-mono leading-relaxed scrollbar-thin"
            />
            <p className="text-xs text-slate-400 mt-2">
              {transcript.length.toLocaleString()} characters
              {transcript.length > 0 && (
                <> · {transcript.split(/\s+/).filter(Boolean).length.toLocaleString()} words</>
              )}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg px-4 py-3 text-sm text-rose-700 animate-scale-in">
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pb-8">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium text-sm hover:bg-brand-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {existingMeeting ? 'Save & Re-analyze' : 'Create & Analyze'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 text-slate-600 rounded-lg font-medium text-sm hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
