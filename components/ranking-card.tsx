'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Trophy, Award, Medal } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RankingItem {
  deviceId: string;
  deviceName: string;
  value: number;
}

interface RankingCardProps {
  title: string;
  items: RankingItem[];
  unit?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Award className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-orange-600" />;
    default:
      return null;
  }
};

const getRankBadgeClass = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 2:
      return 'bg-slate-100 text-slate-800 border-slate-300';
    case 3:
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export function RankingCard({ title, items, unit = 'kWh' }: RankingCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{title}</h3>

      {items.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <p>No devices to rank</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {items.map((item, index) => {
              const rank = index + 1;
              return (
                <div
                  key={item.deviceId}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-200"
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm border-2 ${getRankBadgeClass(
                      rank
                    )}`}
                  >
                    {rank <= 3 ? getRankIcon(rank) : rank}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {item.deviceName}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.deviceId}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-800">
                      {item.value.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">{unit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
}

interface RankingCarouselProps {
  rankings: Array<{
    title: string;
    items: RankingItem[];
    unit?: string;
  }>;
}

export function RankingCarousel({ rankings }: RankingCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextRanking = () => {
    setCurrentIndex((prev) => (prev + 1) % rankings.length);
  };

  const prevRanking = () => {
    setCurrentIndex((prev) => (prev - 1 + rankings.length) % rankings.length);
  };

  if (rankings.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-slate-600">No ranking data available</p>
      </Card>
    );
  }

  return (
    <div className="relative">
      <RankingCard
        title={rankings[currentIndex].title}
        items={rankings[currentIndex].items}
        unit={rankings[currentIndex].unit}
      />

      {rankings.length > 1 && (
        <>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevRanking}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {rankings.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? 'w-8 bg-[#4A90E2]'
                      : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextRanking}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
