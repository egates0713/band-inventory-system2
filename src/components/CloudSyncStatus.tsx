'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, CheckCircle, Database, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface LocalStorageStatus {
  isLoaded: boolean;
  lastSaved?: Date;
  itemCount: number;
}

interface LocalStorageStatusProps {
  localStorageStatus: LocalStorageStatus;
  className?: string;
}

export function CloudSyncStatus({
  localStorageStatus,
  className = ""
}: LocalStorageStatusProps) {
  const { isLoaded, lastSaved, itemCount } = localStorageStatus;

  const getStatusDisplay = () => {
    if (!isLoaded) {
      return {
        icon: <HardDrive className="h-4 w-4" />,
        text: 'Loading...',
        variant: 'secondary' as const,
        color: 'text-blue-600'
      };
    }

    return {
      icon: <CheckCircle className="h-4 w-4" />,
      text: 'Local Storage',
      variant: 'default' as const,
      color: 'text-green-600'
    };
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-slate-600" />
            <CardTitle className="text-lg">Data Storage</CardTitle>
          </div>
          <Badge variant={statusDisplay.variant} className="flex items-center gap-1">
            {statusDisplay.icon}
            {statusDisplay.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-3">
          <CardDescription>
            Your inventory data is stored locally on this device. All changes are automatically saved to your browser's local storage.
          </CardDescription>

          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-md">
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">{itemCount}</div>
              <div className="text-xs text-slate-600">Items Stored</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-slate-900">
                {lastSaved ? 'Saved' : 'Ready'}
              </div>
              <div className="text-xs text-slate-600">
                {lastSaved ? format(lastSaved, 'h:mm a') : 'Auto-save enabled'}
              </div>
            </div>
          </div>

          {lastSaved && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="h-4 w-4" />
              <span>Last saved: {format(lastSaved, 'MMM d, yyyy h:mm a')}</span>
            </div>
          )}
        </div>

        <div className="pt-2 border-t">
          <CardDescription className="text-xs">
            Your data is automatically saved to this device whenever you make changes.
            To backup your data, use the Export feature to download your inventory as CSV files.
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}