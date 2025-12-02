'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PieDataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface HomeCardProps {
  title: string;
  data: PieDataItem[];
  unit?: string;
}

const CHART_COLORS = ['#4A90E2', '#50C878', '#FFB549', '#FF6B6B', '#9B51E0', '#94A3B8'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-slate-700">
        <p className="font-bold text-sm mb-1">{data.name}</p>
        <p className="text-xs text-slate-300">
          <span className="font-semibold text-white">{data.value.toFixed(2)} kWh</span>
        </p>
      </div>
    );
  }
  return null;
};

export function HomeCard({ title, data, unit = 'kWh' }: HomeCardProps) {
  // Limit to top 5 devices, group rest as "Others"
  const processedData = data.length > 5
    ? [
        ...data.slice(0, 5),
        {
          name: 'Others',
          value: data.slice(5).reduce((sum, item) => sum + item.value, 0),
          color: CHART_COLORS[5],
        },
      ]
    : data;

  const total = processedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white rounded-xl shadow-md p-4 sm:p-6 animate-fade-in">
      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-4 text-center">{title}</h3>

      {processedData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <p>No data available</p>
        </div>
      ) : (
        <>
          {/* Pie Chart - Responsive Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4">
            {/* Chart Container */}
            <div className="w-full lg:w-auto flex justify-center">
              <ResponsiveContainer width={280} height={280}>
                <PieChart>
                  <Pie
                    data={processedData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    fill="#8884d8"
                    dataKey="value"
                    label={false}
                    paddingAngle={2}
                  >
                    {processedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="w-full lg:w-auto flex flex-col gap-2 lg:gap-3">
              {processedData.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: entry.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {entry.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {entry.value.toFixed(2)} {unit} ({((entry.value / total) * 100).toFixed(1)}%)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Energy */}
          <div className="mt-6 pt-4 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-600 mb-1">Total Energy</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">
              {total.toFixed(2)} {unit}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}

interface HomeCardsCarouselProps {
  cards: Array<{
    title: string;
    data: PieDataItem[];
  }>;
}

export function HomeCardsCarousel({ cards }: HomeCardsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextCard = () => {
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  if (cards.length === 0) {
    return (
      <Card className="bg-white rounded-xl shadow-md p-8 sm:p-12 text-center">
        <p className="text-slate-600">No energy data available</p>
      </Card>
    );
  }

  return (
    <div className="relative">
      <HomeCard
        title={cards[currentIndex].title}
        data={cards[currentIndex].data}
      />

      {cards.length > 1 && (
        <>
          <div className="flex items-center justify-center gap-3 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevCard}
              className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-slate-100 transition-colors"
              aria-label="Previous card"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>

            <div className="flex gap-2 px-2">
              {cards.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
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
              onClick={nextCard}
              className="h-9 w-9 sm:h-10 sm:w-10 hover:bg-slate-100 transition-colors"
              aria-label="Next card"
            >
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Card Counter */}
          <div className="text-center mt-3">
            <p className="text-xs text-slate-500">
              {currentIndex + 1} of {cards.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
