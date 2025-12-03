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
import { Alert } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Device } from '@/types';
import { toast } from 'sonner';

interface DeleteDeviceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  device: Device | null;
  onConfirm: (deviceId: string) => Promise<void>;
}

export function DeleteDeviceModal({
  open,
  onOpenChange,
  device,
  onConfirm,
}: DeleteDeviceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!device) return;

    setError('');
    setLoading(true);
    try {
      await onConfirm(device.id);
      onOpenChange(false);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete device');
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
      <DialogContent className="sm:max-w-[500px] animate-shake">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-red-600">Delete Device</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Are you sure you want to delete this device? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert className="bg-red-50 text-red-800 border-red-200">
              {error}
            </Alert>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="space-y-2">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Device Name</p>
                <p className="text-lg font-bold text-slate-800">{device.name}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">Device ID</p>
                <p className="text-sm font-mono text-slate-600">{device.id}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-semibold text-yellow-800">Warning</p>
                <p className="text-sm text-yellow-700">
                  This will only remove the device from your account. The device data will remain
                  in the system and can be re-added later.
                </p>
              </div>
            </div>
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
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Device'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
