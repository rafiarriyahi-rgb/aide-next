'use client';

import { useState } from 'react';
import { LogsFilterOptions } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';

interface LogsFilterBarProps {
  filterOptions: LogsFilterOptions;
  onFilterChange: (options: LogsFilterOptions) => void;
}

export function LogsFilterBar({ filterOptions, onFilterChange }: LogsFilterBarProps) {
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleApplyDateFilter = () => {
    const updates: LogsFilterOptions = { ...filterOptions };

    if (startDateStr) {
      updates.startDate = new Date(startDateStr);
    } else {
      delete updates.startDate;
    }

    if (endDateStr) {
      updates.endDate = new Date(endDateStr);
    } else {
      delete updates.endDate;
    }

    onFilterChange(updates);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onFilterChange({ ...filterOptions, searchQuery: value });
  };

  const handleClearFilters = () => {
    setStartDateStr('');
    setEndDateStr('');
    setSearchQuery('');
    onFilterChange({});
  };

  const hasActiveFilters =
    filterOptions.startDate ||
    filterOptions.endDate ||
    (filterOptions.searchQuery && filterOptions.searchQuery.length > 0);

  return (
    <div className="space-y-2">
      {/* Search */}
      <div className="space-y-1">
        <Label htmlFor="search" className="text-xs font-medium text-slate-600">
          Search Logs
        </Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="search"
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 h-8 text-sm"
          />
        </div>
      </div>

      {/* Date Range - Super Compact */}
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="startDate" className="text-xs font-medium text-slate-600">
            Start
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDateStr}
            onChange={(e) => setStartDateStr(e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="endDate" className="text-xs font-medium text-slate-600">
            End
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDateStr}
            onChange={(e) => setEndDateStr(e.target.value)}
            className="h-8 text-xs"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="default"
          size="sm"
          onClick={handleApplyDateFilter}
          className="h-8 flex-1 text-xs"
        >
          Apply Filter
        </Button>

        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearFilters}
            className="h-8 px-3"
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">Clear filters</span>
          </Button>
        )}
      </div>
    </div>
  );
}
