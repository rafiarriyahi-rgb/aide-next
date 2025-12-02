'use client';

import { useState, useEffect } from 'react';
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
import { Device } from '@/types';

interface SetLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onSubmit: (deviceId: string, limit: number) => Promise<void>;
}

export function SetLimitModal({ open, onOpenChange, device, onSubmit }: SetLimitModalProps) {
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (device) {
      setLimit(device.energyLimit > 0 ? device.energyLimit.toString() : '');
    }
  }, [device]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const limitValue = parseFloat(limit);

    if (isNaN(limitValue) || limitValue < 0) {
      setError('Please enter a valid positive number');
      return;
    }

    if (!device) return;

    setLoading(true);
    try {
      await onSubmit(device.id, limitValue);
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to set energy limit');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onOpenChange(false);
    }
  };

  if (!device) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Set Energy Limit</DialogTitle>
          <DialogDescription>
            Set an energy consumption limit for {device.name}
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
              <Label htmlFor="deviceName">Device</Label>
              <Input
                id="deviceName"
                value={device.name}
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Energy Limit (kWh)</Label>
              <div className="flex gap-2">
                <Input
                  id="limit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                  placeholder="e.g., 100"
                  disabled={loading}
                  className="flex-1"
                />
                <div className="flex items-center justify-center px-4 bg-slate-100 rounded-md border">
                  <span className="text-sm font-medium text-slate-600">kWh</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                You'll be notified when this device exceeds this limit. Enter 0 to remove the limit.
              </p>
            </div>

            {device.energyLimit > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Current limit: <span className="font-semibold">{device.energyLimit} kWh</span>
                </p>
              </div>
            )}
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
              {loading ? 'Setting...' : 'Set Limit'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
