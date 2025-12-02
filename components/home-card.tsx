'use client';

import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PieDataItem {
  name: string;
  value: number;
  color: string;
}

interface HomeCardProps {
  title: string;
  data: PieDataItem[];
  unit?: string;
}

const CHART_COLORS = ['#4A90E2', '#50C878', '#FFB549', '#FF6B6B', '#9B51E0', '#94A3B8'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 text-white px-4 py-2 rounded-lg shadow-lg border border-slate-600">
        <p className="font-semibold">{payload[0].name}</p>
        <p className="text-sm">{payload[0].value.toFixed(2)} kWh</p>
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
    <Card className="bg-white rounded-xl shadow-md p-6 animate-fade-in">
      <h3 className="text-xl font-bold text-slate-800 mb-4 text-center">{title}</h3>

      {processedData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-400">
          <p>No data available</p>
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={false}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                iconType="circle"
                formatter={(value, entry: any) => (
                  <span className="text-sm text-slate-700">
                    {value} ({((entry.payload.value / total) * 100).toFixed(1)}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-600">Total Energy</p>
            <p className="text-2xl font-bold text-slate-800">
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
      <Card className="bg-white rounded-xl shadow-md p-12 text-center">
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
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button
              variant="outline"
              size="icon"
              onClick={prevCard}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex gap-2">
              {cards.map((_, index) => (
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
              onClick={nextCard}
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
