'use client';

import { useUser } from '@/contexts/user-context';
import { useDevices } from '@/lib/hooks/use-devices';
import { useAllDevicesChartData } from '@/lib/hooks/use-chart-data';
import { HomeCardsCarousel } from '@/components/home-card';
import { RankingCarousel } from '@/components/ranking-card';
import {
  calculateCurrentMonthEnergy,
  calculateLastMonthEnergy,
  calculateTotalEnergy,
  calculateAveragePowerFactor,
} from '@/lib/utils/energy-calculator';
import { useMemo } from 'react';

const CHART_COLORS = ['#4A90E2', '#50C878', '#FFB549', '#FF6B6B', '#9B51E0', '#94A3B8'];

export default function HomePage() {
  const { userProfile } = useUser();
  const { devices, loading: devicesLoading } = useDevices(userProfile?.userId || null);
  const { devicesData, loading: dataLoading } = useAllDevicesChartData(
    devices.map((d) => d.id)
  );

  const loading = devicesLoading || dataLoading;

  // Calculate energy data for pie charts
  const energyCards = useMemo(() => {
    if (!devices.length || !Object.keys(devicesData).length) return [];

    // Current Month Energy
    const currentMonthData = devices
      .map((device, index) => ({
        name: device.name,
        value: calculateCurrentMonthEnergy(devicesData[device.id] || []),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Last Month Energy
    const lastMonthData = devices
      .map((device, index) => ({
        name: device.name,
        value: calculateLastMonthEnergy(devicesData[device.id] || []),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Total Energy
    const totalEnergyData = devices
      .map((device, index) => ({
        name: device.name,
        value: calculateTotalEnergy(devicesData[device.id] || []),
        color: CHART_COLORS[index % CHART_COLORS.length],
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return [
      { title: 'Current Monthly Energy', data: currentMonthData },
      { title: 'Last Monthly Energy', data: lastMonthData },
      { title: 'Total Energy', data: totalEnergyData },
    ];
  }, [devices, devicesData]);

  // Calculate rankings
  const rankings = useMemo(() => {
    if (!devices.length || !Object.keys(devicesData).length) return [];

    // Current Month Ranking
    const currentMonthRanking = devices
      .map((device) => ({
        deviceId: device.id,
        deviceName: device.name,
        value: calculateCurrentMonthEnergy(devicesData[device.id] || []),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Last Month Ranking
    const lastMonthRanking = devices
      .map((device) => ({
        deviceId: device.id,
        deviceName: device.name,
        value: calculateLastMonthEnergy(devicesData[device.id] || []),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Total Energy Ranking
    const totalEnergyRanking = devices
      .map((device) => ({
        deviceId: device.id,
        deviceName: device.name,
        value: calculateTotalEnergy(devicesData[device.id] || []),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    // Power Factor Ranking
    const powerFactorRanking = devices
      .map((device) => ({
        deviceId: device.id,
        deviceName: device.name,
        value: calculateAveragePowerFactor(devicesData[device.id] || []),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return [
      { title: 'Current Monthly Ranking', items: currentMonthRanking, unit: 'kWh' },
      { title: 'Last Monthly Ranking', items: lastMonthRanking, unit: 'kWh' },
      { title: 'Total Energy Ranking', items: totalEnergyRanking, unit: 'kWh' },
      { title: 'Power Factor Ranking', items: powerFactorRanking, unit: 'PF' },
    ];
  }, [devices, devicesData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2]" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2 sm:mb-4">
          Welcome back, {userProfile?.username}!
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          This is your energy monitoring dashboard. View your device statistics and energy consumption here.
        </p>
      </div>

      {devices.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
          <p className="text-base sm:text-lg text-slate-600 mb-2">No devices found</p>
          <p className="text-sm text-slate-500">Add devices in the Analytics page to start monitoring</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Energy Distribution Cards */}
          <div>
            <HomeCardsCarousel cards={energyCards} />
          </div>

          {/* Device Rankings */}
          <div>
            <RankingCarousel rankings={rankings} />
          </div>
        </div>
      )}
    </div>
  );
}
