'use client';

import { useInventoryWithSync } from '@/hooks/useInventoryWithSync';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Music,
  Package,
  Users,
  TrendingUp,
  AlertTriangle,
  QrCode,
  FileSpreadsheet,
  Plus,
  Cloud
} from 'lucide-react';
import { InventoryManager } from '@/components/InventoryManager';
import { StudentManager } from '@/components/StudentManager';
import { RentalManager } from '@/components/RentalManager';
import { BarcodeGenerator } from '@/components/BarcodeGenerator';
import { DataExport } from '@/components/DataExport';
import { CloudSyncStatus } from '@/components/CloudSyncStatus';
import { SampleDataLoader } from '@/components/SampleDataLoader';

export default function Dashboard() {
  const {
    data,
    loading,
    getStats,
    syncStatus,
    signInToGoogle,
    signOutFromGoogle,
    manualBackup,
    manualRestore,
    loadSampleData
  } = useInventoryWithSync();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Music className="h-12 w-12 mx-auto mb-4 text-slate-600 animate-spin" />
          <p className="text-slate-600">Loading inventory system...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const hasAnyData = data.items.length > 0 || data.students.length > 0 || data.rentals.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Music className="h-8 w-8 text-slate-700" />
            <h1 className="text-3xl font-bold text-slate-900">Band Inventory System</h1>
            {syncStatus.isSignedIn && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <Cloud className="h-3 w-3 mr-1" />
                Cloud Sync
              </Badge>
            )}
          </div>
          <p className="text-slate-600">Manage instruments, track rentals, and monitor your band's inventory</p>
        </div>

        {/* Cloud Sync Status + Stats Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Cloud Sync Status or Sample Data Loader */}
          <div className="lg:col-span-2">
            {hasAnyData ? (
              <CloudSyncStatus
                syncStatus={syncStatus}
                onSignIn={signInToGoogle}
                onSignOut={signOutFromGoogle}
                onManualBackup={manualBackup}
                onManualRestore={manualRestore}
              />
            ) : (
              <SampleDataLoader
                onLoadSampleData={loadSampleData}
                hasExistingData={hasAnyData}
              />
            )}
          </div>

          {/* Stats Cards */}
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Items</CardTitle>
              <Package className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{stats.totalItems}</div>
              <p className="text-xs text-slate-500">Instruments & Equipment</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Currently Rented</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.rentedItems}</div>
              <p className="text-xs text-slate-500">Out with students</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Available</CardTitle>
              <Package className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableItems}</div>
              <p className="text-xs text-slate-500">Ready for rental</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Need Repair</CardTitle>
              <AlertTriangle className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.itemsNeedingRepair}</div>
              <p className="text-xs text-slate-500">Requires attention</p>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Value</CardTitle>
              <TrendingUp className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                ${stats.totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-slate-500">Current inventory value</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Card className="bg-white/70 backdrop-blur-sm border-slate-200">
          <Tabs defaultValue="inventory" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 bg-slate-100">
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Inventory
              </TabsTrigger>
              <TabsTrigger value="students" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Students
              </TabsTrigger>
              <TabsTrigger value="rentals" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Rentals
              </TabsTrigger>
              <TabsTrigger value="barcodes" className="flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Barcodes
              </TabsTrigger>
              <TabsTrigger value="export" className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4" />
                Export
              </TabsTrigger>
            </TabsList>

            <TabsContent value="inventory" className="mt-6">
              <InventoryManager />
            </TabsContent>

            <TabsContent value="students" className="mt-6">
              <StudentManager />
            </TabsContent>

            <TabsContent value="rentals" className="mt-6">
              <RentalManager />
            </TabsContent>

            <TabsContent value="barcodes" className="mt-6">
              <BarcodeGenerator />
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <div className="space-y-6">
                <CloudSyncStatus
                  syncStatus={syncStatus}
                  onSignIn={signInToGoogle}
                  onSignOut={signOutFromGoogle}
                  onManualBackup={manualBackup}
                  onManualRestore={manualRestore}
                />
                <DataExport />
                {hasAnyData && (
                  <SampleDataLoader
                    onLoadSampleData={loadSampleData}
                    hasExistingData={hasAnyData}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
