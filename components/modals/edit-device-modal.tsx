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
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface EditDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onSubmit: (deviceId: string, newName: string) => Promise<void>;
}

export function EditDeviceModal({ open, onOpenChange, device, onSubmit }: EditDeviceModalProps) {
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (device) {
      setDeviceName(device.name);
    }
  }, [device]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!deviceName.trim()) {
      setError('Please enter a device name');
      toast.error('Please enter a device name');
      return;
    }

    if (!device) return;

    setLoading(true);
    try {
      await onSubmit(device.id, deviceName.trim());
      onOpenChange(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update device');
      setError(error.message);
      toast.error(error.message);
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
          <DialogTitle className="text-2xl font-bold">Edit Device</DialogTitle>
          <DialogDescription>
            Update the name for {device.name}
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
                value={device.id}
                disabled
                className="font-mono bg-slate-50"
              />
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
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Device'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
