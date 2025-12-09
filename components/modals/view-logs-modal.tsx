'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Calendar, Clock, FileText, ArrowLeft } from 'lucide-react';
import { Device, LogEntry } from '@/types';
import { useLogs, useLogDetail } from '@/lib/hooks/use-logs';
import { LogsFilterBar } from '@/components/logs/logs-filter-bar';
import { LogsFilterOptions } from '@/types';
import { LogTimelineItem } from '@/components/logs/log-timeline-item';
import Image from 'next/image';

interface ViewLogsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
}

export function ViewLogsModal({ open, onOpenChange, device }: ViewLogsModalProps) {
  const [filterOptions, setFilterOptions] = useState<LogsFilterOptions>({});
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const { logs, loading, error } = useLogs(device?.id || null, filterOptions);
  const { logDetail, loading: detailLoading } = useLogDetail(
    device?.id || null,
    selectedLogId
  );

  const handleLogClick = (log: LogEntry) => {
    setSelectedLogId(log.id);
  };

  const handleBackToList = () => {
    setSelectedLogId(null);
  };

  const handleClose = () => {
    setSelectedLogId(null);
    setFilterOptions({});
    onOpenChange(false);
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-[calc(100vw-2rem)] sm:w-full h-[95vh] sm:h-[85vh] p-0 gap-0 flex flex-col" showCloseButton={false}>
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-slate-800 truncate">
                {selectedLogId ? 'Log Details' : 'Device Logs'}
              </DialogTitle>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono truncate">
                {device.name} ({device.id})
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8 shrink-0">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        {!selectedLogId ? (
          // Logs List View
          <div className="flex flex-col flex-1 min-h-0">
            {/* Filter Bar */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <LogsFilterBar
                filterOptions={filterOptions}
                onFilterChange={setFilterOptions}
              />
            </div>

            {/* Logs List */}
            <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
              <div className="py-3 sm:py-4">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="relative flex flex-col items-center gap-3">
                      <Image
                        src="/Group 4.svg"
                        alt="AIDE Logo"
                        width={48}
                        height={48}
                        className="opacity-70"
                      />
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#00E0FF]" />
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                    Error loading logs: {error}
                  </div>
                ) : logs.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p className="text-base sm:text-lg font-semibold">No logs found</p>
                    <p className="text-xs sm:text-sm mt-2">
                      No events have been recorded for this device yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 sm:space-y-3">
                    {logs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => handleLogClick(log)}
                        className="w-full text-left p-3 sm:p-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-lg sm:rounded-xl transition-all shadow-sm hover:shadow-md"
                      >
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <Badge variant="outline" className="font-mono text-xs bg-blue-50 text-blue-700 border-blue-200 truncate max-w-[calc(100%-4rem)]">
                            {log.title}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono shrink-0 ml-auto">
                            {log.id.slice(-8)}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 mb-2.5 line-clamp-2 leading-relaxed">
                          {log.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 shrink-0" />
                            <span>{log.timestamp.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            <span>{log.timestamp.toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        ) : (
          // Log Detail View
          <div className="flex flex-col flex-1 min-h-0">
            <div className="px-4 sm:px-6 py-3 border-b border-slate-200 bg-slate-50 shrink-0">
              <Button variant="ghost" size="sm" onClick={handleBackToList} className="h-8 sm:h-9">
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="text-xs sm:text-sm">Back to Logs</span>
              </Button>
            </div>

            <ScrollArea className="flex-1 min-h-0 px-4 sm:px-6">
              <div className="py-4 sm:py-6">
                {detailLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="relative flex flex-col items-center gap-3">
                      <Image
                        src="/Group 4.svg"
                        alt="AIDE Logo"
                        width={48}
                        height={48}
                        className="opacity-70"
                      />
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-[#00E0FF]" />
                    </div>
                  </div>
                ) : logDetail?.target ? (
                  <div className="space-y-4 sm:space-y-6">
                    {/* Main Log Card */}
                    <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                      <div className="flex items-start justify-between mb-4 gap-3">
                        <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="p-2 sm:p-3 bg-blue-100 rounded-lg shrink-0">
                            <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm sm:text-lg font-semibold text-slate-800 break-words">
                              {logDetail.target.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1.5 text-xs sm:text-sm text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span>{logDetail.target.timestamp.toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                                <span>{logDetail.target.timestamp.toLocaleTimeString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs font-mono bg-slate-50 shrink-0 hidden sm:inline-flex">
                          {logDetail.target.id}
                        </Badge>
                        <Badge variant="outline" className="text-xs font-mono bg-slate-50 shrink-0 sm:hidden">
                          {logDetail.target.id.slice(-8)}
                        </Badge>
                      </div>

                      <Separator className="my-3 sm:my-4" />

                      <div>
                        <p className="text-xs font-semibold text-slate-600 uppercase mb-2 tracking-wide">
                          Log Content
                        </p>
                        <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                          {logDetail.target.content}
                        </p>
                      </div>
                    </div>

                    {/* Context Timeline */}
                    <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm">
                      <h4 className="text-base sm:text-lg font-semibold text-slate-800 mb-3 sm:mb-4">
                        Event Timeline
                      </h4>

                      <div className="space-y-3 sm:space-y-4">
                        {/* Before logs */}
                        {logDetail.before.map((log) => (
                          <LogTimelineItem
                            key={log.id}
                            log={log}
                            deviceId={device.id}
                            variant="before"
                          />
                        ))}

                        {/* Current log */}
                        <LogTimelineItem
                          log={logDetail.target}
                          deviceId={device.id}
                          variant="current"
                        />

                        {/* After logs */}
                        {logDetail.after.map((log) => (
                          <LogTimelineItem
                            key={log.id}
                            log={log}
                            deviceId={device.id}
                            variant="after"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
                    <p className="text-base sm:text-lg font-semibold">Log not found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
