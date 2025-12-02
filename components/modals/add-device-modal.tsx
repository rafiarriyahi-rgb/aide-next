'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert } from '@/components/ui/alert';

interface AddDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (deviceId: string, deviceName: string) => Promise<void>;
}

export function AddDeviceModal({ open, onOpenChange, onSubmit }: AddDeviceModalProps) {
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!deviceId.trim() || !deviceName.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await onSubmit(deviceId.trim(), deviceName.trim());
      setDeviceId('');
      setDeviceName('');
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to add device');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setDeviceId('');
      setDeviceName('');
      setError('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Add New Device</DialogTitle>
          <DialogDescription>
            Enter the device ID and a custom name to add it to your dashboard.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <Alert className="bg-red-50 text-red-800 border-red-200">
                {error}
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="deviceId">Device ID</Label>
              <Input
                id="deviceId"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                placeholder="e.g., device001"
                disabled={loading}
                className="font-mono"
              />
              <p className="text-xs text-slate-500">
                The unique identifier for your device
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="e.g., Living Room AC"
                disabled={loading}
              />
              <p className="text-xs text-slate-500">
                A friendly name to identify your device
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-submit"
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Device'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
