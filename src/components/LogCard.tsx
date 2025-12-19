import { Log } from '@/lib/api';
import { format, parseISO } from 'date-fns';

interface LogCardProps {
  log: Log;
}

const activityLabels: Record<string, string> = {
  WORK: 'Work',
  MEETING: 'Meeting',
  FIELD: 'Field activity',
  TRAVEL: 'Travel',
  ADMIN: 'Admin',
};

export default function LogCard({ log }: LogCardProps) {
  const startTime = format(parseISO(log.startTime), 'HH:mm');
  const endTime = format(parseISO(log.endTime), 'HH:mm');

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-2">
        <span className="font-mono text-sm text-evident-700">
          {startTime} – {endTime}
        </span>
        <span className="activity-pill">
          {activityLabels[log.activityType] || log.activityType}
        </span>
      </div>
      <p className="text-evident-900">{log.description}</p>
      {log.reference && (
        <p className="text-sm text-evident-400 mt-1">Ref: {log.reference}</p>
      )}
    </div>
  );
}
