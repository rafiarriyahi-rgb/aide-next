'use client';

import { useState } from 'react';
import { useUser } from '@/contexts/user-context';
import { useDevices } from '@/lib/hooks/use-devices';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AnalyticCard } from '@/components/analytic-card';
import { AddDeviceModal } from '@/components/modals/add-device-modal';
import { EditDeviceModal } from '@/components/modals/edit-device-modal';
import { SetLimitModal } from '@/components/modals/set-limit-modal';
import { DeleteDeviceModal } from '@/components/modals/delete-device-modal';
import { Device } from '@/types';
import { Alert } from '@/components/ui/alert';

export default function AnalyticPage() {
  const { userProfile } = useUser();
  const {
    devices,
    loading,
    error,
    addDevice,
    updateDevice,
    deleteDevice,
    setEnergyLimit,
    toggleDevice,
  } = useDevices(userProfile?.userId || null);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const handleAddDevice = async (deviceId: string, deviceName: string) => {
    try {
      await addDevice(deviceId, deviceName);
      setActionSuccess(`Device "${deviceName}" added successfully!`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDevice(device);
    setEditModalOpen(true);
  };

  const handleUpdateDevice = async (deviceId: string, newName: string) => {
    try {
      await updateDevice(deviceId, newName);
      setActionSuccess(`Device renamed to "${newName}"!`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleSetLimit = (device: Device) => {
    setSelectedDevice(device);
    setLimitModalOpen(true);
  };

  const handleSetLimitSubmit = async (deviceId: string, limit: number) => {
    try {
      await setEnergyLimit(deviceId, limit);
      setActionSuccess(
        limit > 0
          ? `Energy limit set to ${limit} kWh!`
          : 'Energy limit removed!'
      );
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleDeleteDevice = (device: Device) => {
    setSelectedDevice(device);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async (deviceId: string) => {
    try {
      await deleteDevice(deviceId);
      setActionSuccess('Device deleted successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      throw err;
    }
  };

  const handleToggleDevice = async (deviceId: string, newState: boolean) => {
    try {
      await toggleDevice(deviceId, newState);
      setActionSuccess(`Device turned ${newState ? 'on' : 'off'}!`);
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err: any) {
      setActionError(err.message || 'Failed to toggle device');
      setTimeout(() => setActionError(''), 3000);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4A90E2]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error loading devices: {error}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Your Devices</h2>
          <Button
            className="bg-gradient-submit gap-2"
            onClick={() => setAddModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Device
          </Button>
        </div>

        {actionSuccess && (
          <Alert className="bg-green-50 text-green-800 border-green-200">
            {actionSuccess}
          </Alert>
        )}

        {actionError && (
          <Alert className="bg-red-50 text-red-800 border-red-200">
            {actionError}
          </Alert>
        )}

        {devices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-slate-600 text-lg mb-4">No devices found</p>
            <p className="text-slate-500 mb-6">
              Add your first device to start monitoring energy consumption
            </p>
            <Button
              className="bg-gradient-submit gap-2"
              onClick={() => setAddModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Device
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {devices.map((device) => (
              <AnalyticCard
                key={device.id}
                device={device}
                onToggle={handleToggleDevice}
                onEdit={handleEditDevice}
                onDelete={handleDeleteDevice}
                onSetLimit={handleSetLimit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddDeviceModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSubmit={handleAddDevice}
      />

      <EditDeviceModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        device={selectedDevice}
        onSubmit={handleUpdateDevice}
      />

      <SetLimitModal
        open={limitModalOpen}
        onOpenChange={setLimitModalOpen}
        device={selectedDevice}
        onSubmit={handleSetLimitSubmit}
      />

      <DeleteDeviceModal
        open={deleteModalOpen}
        onOpenChange={setDeleteModalOpen}
        device={selectedDevice}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
