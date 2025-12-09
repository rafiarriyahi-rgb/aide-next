'use client';

import { LogEntry } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Clock, Circle } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogTimelineItemProps {
  log: LogEntry;
  deviceId: string;
  variant: 'before' | 'current' | 'after';
}

export function LogTimelineItem({ log, deviceId, variant }: LogTimelineItemProps) {
  const isCurrent = variant === 'current';

  return (
    <div className="relative">
      {/* Timeline connector line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

      {/* Timeline item */}
      <div className="flex items-start gap-4 relative">
        {/* Timeline dot */}
        <div
          className={cn(
            'relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2',
            isCurrent
              ? 'bg-blue-500 border-blue-500'
              : 'bg-white border-slate-300'
          )}
        >
          <Circle
            className={cn(
              'h-3 w-3',
              isCurrent ? 'fill-white text-white' : 'fill-slate-400 text-slate-400'
            )}
          />
        </div>

        {/* Content */}
        <div className={cn(
          'flex-1 pb-6',
          isCurrent && 'bg-blue-50 -mx-4 px-4 py-4 rounded-lg border-2 border-blue-200'
        )}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <Badge
                variant={isCurrent ? 'default' : 'outline'}
                className="font-mono text-xs mb-2"
              >
                {log.title}
              </Badge>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3 w-3" />
                {log.timestamp.toLocaleString()}
              </div>
            </div>
            {!isCurrent && (
              <Link
                href={`/item-data/${deviceId}/logs/${log.id}`}
                className="text-xs text-blue-600 hover:underline"
              >
                View
              </Link>
            )}
          </div>
          <p className="text-sm text-slate-700 line-clamp-2">{log.content}</p>
        </div>
      </div>
    </div>
  );
}
