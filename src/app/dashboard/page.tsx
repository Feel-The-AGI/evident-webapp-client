'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useLogsStore } from '@/store';
import { format, parseISO } from 'date-fns';
import AddLogModal from '@/components/AddLogModal';
import GenerateModal from '@/components/GenerateModal';
import LogCard from '@/components/LogCard';

export default function DashboardPage() {
  const { token, user, logout } = useAuthStore();
  const { logs, view, setView, fetchLogs, isLoading } = useLogsStore();
  const [showAddLog, setShowAddLog] = useState(false);
  const [showGenerate, setShowGenerate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push('/');
      return;
    }
    fetchLogs();
  }, [token, router, fetchLogs]);

  const getDateHeader = () => {
    if (view === 'today') {
      return format(new Date(), 'EEEE, d MMMM');
    }
    return view === 'this-week' ? 'This week' : 'Last week';
  };

  const groupLogsByDate = () => {
    const grouped: Record<string, typeof logs> = {};
    logs.forEach((log) => {
      const dateKey = format(parseISO(log.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    });
    return grouped;
  };

  if (!token) return null;

  const groupedLogs = groupLogsByDate();

  return (
    <div className="min-h-screen bg-evident-50">
      {/* Top Bar */}
      <header className="bg-white border-b border-evident-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-evident-800">Evident</h1>
          
          <nav className="flex items-center gap-6">
            <button
              onClick={() => setView('today')}
              className={`text-sm ${view === 'today' ? 'text-evident-900 font-medium' : 'text-evident-500'}`}
            >
              Today
            </button>
            <button
              onClick={() => setView('this-week')}
              className={`text-sm ${view === 'this-week' ? 'text-evident-900 font-medium' : 'text-evident-500'}`}
            >
              This week
            </button>
            <button
              onClick={() => setView('last-week')}
              className={`text-sm ${view === 'last-week' ? 'text-evident-900 font-medium' : 'text-evident-500'}`}
            >
              Last week
            </button>
            <button
              onClick={() => setShowGenerate(true)}
              className="bg-evident-800 text-white text-sm px-4 py-2 rounded-lg"
            >
              Generate
            </button>
          </nav>

          <button onClick={logout} className="text-sm text-evident-500">
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-xl font-semibold text-evident-900 mb-6">{getDateHeader()}</h2>

        {isLoading ? (
          <p className="text-evident-500">Loading...</p>
        ) : logs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-evident-500 mb-4">No logs yet.</p>
            <p className="text-evident-400 text-sm">Add a log to start building your work timeline.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedLogs)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, dayLogs]) => (
                <div key={date}>
                  {view !== 'today' && (
                    <h3 className="text-sm font-medium text-evident-600 mb-3 pb-2 border-b border-evident-200">
                      {format(parseISO(date), 'EEEE, d MMMM')}
                    </h3>
                  )}
                  <div className="space-y-3">
                    {dayLogs
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((log) => (
                        <LogCard key={log.id} log={log} />
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddLog(true)}
        className="fixed bottom-8 right-8 bg-evident-800 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-2xl hover:bg-evident-700"
      >
        +
      </button>

      {/* Modals */}
      {showAddLog && <AddLogModal onClose={() => setShowAddLog(false)} />}
      {showGenerate && <GenerateModal onClose={() => setShowGenerate(false)} />}
    </div>
  );
}
