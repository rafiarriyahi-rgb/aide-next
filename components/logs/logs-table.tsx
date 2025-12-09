'use client';

import { useState, useMemo } from 'react';
import { LogEntry } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Eye } from 'lucide-react';
import Link from 'next/link';

interface LogsTableProps {
  logs: LogEntry[];
  deviceId: string;
}

type SortField = 'timestamp' | 'title';
type SortOrder = 'asc' | 'desc';

export function LogsTable({ logs, deviceId }: LogsTableProps) {
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const sortedLogs = useMemo(() => {
    const sorted = [...logs].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'timestamp') {
        comparison = a.timestamp.getTime() - b.timestamp.getTime();
      } else if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [logs, sortField, sortOrder]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLogs, currentPage]);

  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p className="text-lg">No logs found</p>
        <p className="text-sm mt-2">No events have been recorded for this device yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('timestamp')}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  Timestamp
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="text-left py-3 px-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  Event
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </th>
              <th className="text-left py-3 px-4 font-semibold text-slate-700">
                Preview
              </th>
              <th className="text-right py-3 px-4 font-semibold text-slate-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="text-sm">
                    <p className="font-medium text-slate-800">
                      {log.timestamp.toLocaleDateString()}
                    </p>
                    <p className="text-slate-500">
                      {log.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <Badge variant="outline" className="font-mono text-xs">
                    {log.title}
                  </Badge>
                </td>
                <td className="py-4 px-4">
                  <p className="text-sm text-slate-600 truncate max-w-md">
                    {log.content}
                  </p>
                </td>
                <td className="py-4 px-4 text-right">
                  <Link href={`/item-data/${deviceId}/logs/${log.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, sortedLogs.length)} of{' '}
            {sortedLogs.length} logs
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
