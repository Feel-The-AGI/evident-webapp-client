'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store';
import { api } from '@/lib/api';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';

interface GenerateModalProps {
  onClose: () => void;
}

export default function GenerateModal({ onClose }: GenerateModalProps) {
  const { token } = useAuthStore();
  const [dateRange, setDateRange] = useState<'today' | 'this-week' | 'last-week'>('this-week');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return { start: now, end: now };
      case 'this-week':
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      case 'last-week':
        const lastWeek = subWeeks(now, 1);
        return { start: startOfWeek(lastWeek, { weekStartsOn: 1 }), end: endOfWeek(lastWeek, { weekStartsOn: 1 }) };
    }
  };

  const handleGenerate = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const canExport = await api.users.canExport(token);
      if (!canExport.allowed) {
        setError(canExport.reason || 'Export not allowed');
        return;
      }

      const { start, end } = getDateRange();
      const res = await api.exports.generate(
        token,
        start.toISOString(),
        end.toISOString()
      );
      setResult(res.textContent);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
    }
  };

  const handleDownloadPdf = async () => {
    if (!token) return;
    
    const { start, end } = getDateRange();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
    
    const res = await fetch(`${apiUrl}/exports/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      }),
    });
    
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `evident-summary-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-evident-200">
          <h2 className="text-lg font-semibold text-evident-900">Generate summary</h2>
        </div>

        <div className="p-6 flex-1 overflow-auto">
          {!result ? (
            <>
              <label className="block text-sm text-evident-600 mb-3">Date range</label>
              <div className="flex gap-2 mb-6">
                {(['today', 'this-week', 'last-week'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setDateRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      dateRange === range
                        ? 'bg-evident-800 text-white'
                        : 'bg-evident-100 text-evident-600'
                    }`}
                  >
                    {range === 'today' ? 'Today' : range === 'this-week' ? 'This week' : 'Last week'}
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-700">{error}</p>
                  {error.includes('subscription') && (
                    <button className="btn-primary mt-3 text-sm">
                      Subscribe for $9/month
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? 'Generating...' : 'Generate summary'}
              </button>
            </>
          ) : (
            <>
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-evident-900">Work summary</h3>
                <p className="text-sm text-evident-500">
                  {format(getDateRange().start, 'd MMMM')} – {format(getDateRange().end, 'd MMMM yyyy')}
                </p>
              </div>

              <pre className="bg-evident-50 border border-evident-200 rounded-lg p-4 text-sm font-mono whitespace-pre-wrap overflow-auto max-h-64">
                {result}
              </pre>

              <div className="flex gap-3 mt-6">
                <button onClick={handleDownloadPdf} className="btn-primary flex-1">
                  Download PDF
                </button>
                <button onClick={handleCopy} className="btn-primary flex-1 bg-evident-600">
                  Copy text
                </button>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-evident-200">
          <button onClick={onClose} className="btn-secondary w-full text-center">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
