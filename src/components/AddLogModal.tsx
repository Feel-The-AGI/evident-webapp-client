'use client';

import { useState } from 'react';
import { useLogsStore } from '@/store';
import { ActivityType } from '@/lib/api';
import { format, addMinutes } from 'date-fns';

interface AddLogModalProps {
  onClose: () => void;
}

const activityTypes: { value: ActivityType; label: string }[] = [
  { value: 'WORK', label: 'Work' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'FIELD', label: 'Field' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'ADMIN', label: 'Admin' },
];

export default function AddLogModal({ onClose }: AddLogModalProps) {
  const now = new Date();
  const [startTime, setStartTime] = useState(format(now, "yyyy-MM-dd'T'HH:mm"));
  const [endTime, setEndTime] = useState(format(addMinutes(now, 30), "yyyy-MM-dd'T'HH:mm"));
  const [activityType, setActivityType] = useState<ActivityType>('WORK');
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  const [showReference, setShowReference] = useState(false);
  const { createLog } = useLogsStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const startDate = new Date(startTime);
    const endDate = new Date(endTime);
    
    await createLog({
      date: format(startDate, 'yyyy-MM-dd'),
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      activityType,
      description,
      reference: reference || undefined,
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-evident-900 mb-6">Add log</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Time */}
          <div>
            <label className="block text-sm text-evident-600 mb-2">Time</label>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-xs text-evident-400 mb-1">Start</label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-evident-400 mb-1">End</label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="input-field text-sm"
                  required
                />
              </div>
            </div>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm text-evident-600 mb-2">Activity</label>
            <div className="flex flex-wrap gap-2">
              {activityTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setActivityType(type.value)}
                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                    activityType === type.value
                      ? 'bg-evident-800 text-white'
                      : 'bg-evident-100 text-evident-600 hover:bg-evident-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-evident-600 mb-2">What was done</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value.slice(0, 120))}
              className="input-field"
              placeholder="Short, factual description"
              maxLength={120}
              required
            />
            <p className="text-xs text-evident-400 mt-1">{description.length}/120 characters</p>
          </div>

          {/* Reference */}
          {showReference ? (
            <div>
              <label className="block text-sm text-evident-600 mb-2">Reference (optional)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value.slice(0, 100))}
                className="input-field"
                placeholder="Ticket, client, location, or identifier"
                maxLength={100}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowReference(true)}
              className="text-sm text-evident-500 hover:text-evident-700"
            >
              + Add reference
            </button>
          )}

          {/* Submit */}
          <button type="submit" className="btn-primary w-full mt-4">
            Save log
          </button>
        </form>
      </div>
    </div>
  );
}
