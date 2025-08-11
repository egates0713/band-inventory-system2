'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Cloud, CloudOff, RefreshCw, Download, Upload, CheckCircle, AlertCircle, User, LogOut, LogIn } from 'lucide-react';
import { SyncStatus } from '@/services/googleDriveSync';
import { format } from 'date-fns';

interface CloudSyncStatusProps {
  syncStatus: SyncStatus;
  onSignIn: () => void;
  onSignOut: () => void;
  onManualBackup: () => Promise<boolean>;
  onManualRestore: () => Promise<boolean>;
  className?: string;
}

export function CloudSyncStatus({
  syncStatus,
  onSignIn,
  onSignOut,
  onManualBackup,
  onManualRestore,
  className = ""
}: CloudSyncStatusProps) {
  const { isSignedIn, isLoading, lastSync, error, userEmail } = syncStatus;

  const handleManualBackup = async () => {
    const success = await onManualBackup();
    // You could add toast notifications here for user feedback
    if (success) {
      console.log('Backup successful');
    } else {
      console.log('Backup failed');
    }
  };

  const handleManualRestore = async () => {
    const success = await onManualRestore();
    if (success) {
      console.log('Restore successful');
    } else {
      console.log('Restore failed');
    }
  };

  const getSyncStatusDisplay = () => {
    if (isLoading) {
      return {
        icon: <RefreshCw className="h-4 w-4 animate-spin" />,
        text: 'Syncing...',
        variant: 'secondary' as const,
        color: 'text-blue-600'
      };
    }

    if (error) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Sync Error',
        variant: 'destructive' as const,
        color: 'text-red-600'
      };
    }

    if (isSignedIn) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'Connected',
        variant: 'default' as const,
        color: 'text-green-600'
      };
    }

    return {
      icon: <CloudOff className="h-4 w-4" />,
      text: 'Not Connected',
      variant: 'outline' as const,
      color: 'text-gray-600'
    };
  };

  const statusDisplay = getSyncStatusDisplay();

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Google Drive Sync</CardTitle>
          </div>
          <Badge variant={statusDisplay.variant} className="flex items-center gap-1">
            {statusDisplay.icon}
            {statusDisplay.text}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {!isSignedIn ? (
          <div className="space-y-3">
            <CardDescription>
              {error && error === 'setup_required'
                ? "✅ Your system works perfectly! Google Drive cloud sync is optional and requires one-time setup."
                : "Sign in with Google to automatically backup your inventory data and sync across devices."
              }
            </CardDescription>

            {error && error === 'setup_required' && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <div className="text-sm text-amber-800">
                  <strong>Everything Works!</strong> Your data is safely stored on this device.
                  To enable cloud sync across multiple devices, contact your IT administrator.
                </div>
              </div>
            )}

            <Button
              onClick={onSignIn}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              {error === 'setup_required' ? 'Test Google Sign-In' : 'Sign in with Google'}
            </Button>

            {error && error !== 'setup_required' && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>{userEmail}</span>
            </div>

            {lastSync && (
              <div className="text-sm text-gray-600">
                Last sync: {format(lastSync, 'MMM d, yyyy h:mm a')}
              </div>
            )}

            {error && error !== 'setup_required' && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualBackup}
                disabled={isLoading}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Backup Now
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Restore from Google Drive</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will replace your current inventory data with the data from Google Drive.
                      Any unsaved changes will be lost. Are you sure you want to continue?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleManualRestore}>
                      Restore Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={onSignOut}
              disabled={isLoading}
              className="w-full text-gray-600 hover:text-gray-800"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}

        <div className="pt-2 border-t">
          <CardDescription className="text-xs">
            {isSignedIn
              ? "Your data is automatically backed up to your Google Drive when you make changes."
              : "Your data is currently only stored locally on this device."
            }
          </CardDescription>
        </div>
      </CardContent>
    </Card>
  );
}
