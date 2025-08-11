'use client';

import { useState, useRef } from 'react';
import { useInventoryWithSync } from '@/hooks/useInventoryWithSync';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileSpreadsheet, Trash2, Database } from 'lucide-react';
import Papa from 'papaparse';
import { format } from 'date-fns';

export function DataExport() {
  const { data, clearAllData } = useInventoryWithSync();
  const [importing, setImporting] = useState(false);
  const [importResults, setImportResults] = useState<{
    type: string;
    data?: unknown;
    errors?: unknown;
    meta?: unknown;
    message?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportInventoryCSV = () => {
    const csvData = data.items.map(item => ({
      'Item Name': item.name,
      'Category': item.category,
      'Brand': item.brand || '',
      'Model': item.model || '',
      'Serial Number': item.serialNumber || '',
      'Condition': item.condition,
      'Purchase Date': item.purchaseDate || '',
      'Purchase Price': item.purchasePrice || '',
      'Current Value': item.currentValue || '',
      'Location': item.location || '',
      'Barcode': item.barcode,
      'Is Rented': item.isRented ? 'Yes' : 'No',
      'Notes': item.notes || '',
      'Created Date': format(new Date(item.createdAt), 'yyyy-MM-dd'),
      'Last Updated': format(new Date(item.updatedAt), 'yyyy-MM-dd')
    }));

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, `inventory-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportStudentsCSV = () => {
    const csvData = data.students.map(student => ({
      'Student Name': student.name,
      'Email': student.email || '',
      'Phone': student.phone || '',
      'Grade': student.grade || '',
      'Parent Contact': student.parentContact || '',
      'Emergency Contact': student.emergencyContact || '',
      'Created Date': format(new Date(student.createdAt), 'yyyy-MM-dd')
    }));

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, `students-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportRentalsCSV = () => {
    const csvData = data.rentals.map(rental => {
      const item = data.items.find(i => i.id === rental.itemId);
      const student = data.students.find(s => s.id === rental.studentId);

      return {
        'Item Name': item?.name || 'Unknown',
        'Item Barcode': item?.barcode || '',
        'Student Name': student?.name || 'Unknown',
        'Student Grade': student?.grade || '',
        'Rented Date': format(new Date(rental.rentedDate), 'yyyy-MM-dd'),
        'Expected Return': rental.expectedReturnDate ? format(new Date(rental.expectedReturnDate), 'yyyy-MM-dd') : '',
        'Actual Return': rental.actualReturnDate ? format(new Date(rental.actualReturnDate), 'yyyy-MM-dd') : '',
        'Return Condition': rental.condition,
        'Status': rental.isActive ? 'Active' : 'Returned',
        'Notes': rental.notes || ''
      };
    });

    const csv = Papa.unparse(csvData);
    downloadCSV(csv, `rentals-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
  };

  const exportAllData = () => {
    const allData = {
      inventory: data.items,
      students: data.students,
      rentals: data.rentals,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `band-inventory-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const downloadCSV = (csvContent: string, filename: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResults(null);

    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setImportResults({
            type: 'csv',
            data: results.data,
            errors: results.errors,
            meta: results.meta
          });
          setImporting(false);
        },
        error: (error) => {
          console.error('CSV Parse Error:', error);
          setImporting(false);
        }
      });
    } else if (fileExtension === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          setImportResults({
            type: 'json',
            data: jsonData
          });
        } catch (error) {
          console.error('JSON Parse Error:', error);
          setImportResults({
            type: 'error',
            message: 'Invalid JSON format'
          });
        }
        setImporting(false);
      };
      reader.readAsText(file);
    } else {
      setImportResults({
        type: 'error',
        message: 'Unsupported file format. Please use CSV or JSON files.'
      });
      setImporting(false);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const stats = {
    totalItems: data.items.length,
    totalStudents: data.students.length,
    totalRentals: data.rentals.length,
    activeRentals: data.rentals.filter(r => r.isActive).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Data Export & Import</h2>
        <p className="text-slate-600">Export your data to spreadsheets or create backups</p>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current Data Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalItems}</div>
              <div className="text-sm text-slate-600">Inventory Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
              <div className="text-sm text-slate-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-900">{stats.totalRentals}</div>
              <div className="text-sm text-slate-600">Total Rentals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.activeRentals}</div>
              <div className="text-sm text-slate-600">Active Rentals</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download your data in various formats for backup or analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={exportInventoryCSV}
              disabled={data.items.length === 0}
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Inventory CSV</div>
                  <div className="text-sm text-slate-500">All inventory items and details</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={exportStudentsCSV}
              disabled={data.students.length === 0}
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Students CSV</div>
                  <div className="text-sm text-slate-500">Student contact information</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={exportRentalsCSV}
              disabled={data.rentals.length === 0}
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="h-6 w-6 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Rentals CSV</div>
                  <div className="text-sm text-slate-500">Rental history and status</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={exportAllData}
              disabled={data.items.length === 0 && data.students.length === 0}
            >
              <div className="flex items-center space-x-3">
                <Download className="h-6 w-6 text-slate-600" />
                <div className="text-left">
                  <div className="font-medium">Full Backup (JSON)</div>
                  <div className="text-sm text-slate-500">Complete database backup</div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Upload CSV or JSON files to import data (this will show a preview before importing)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileImport}
              disabled={importing}
              className="cursor-pointer"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
            >
              <Upload className="h-4 w-4 mr-2" />
              {importing ? 'Processing...' : 'Choose File'}
            </Button>
          </div>

          {importResults && (
            <div className="mt-4 p-4 border rounded-lg">
              {importResults.type === 'csv' && (
                <div>
                  <h4 className="font-medium mb-2">CSV Import Preview</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    Found {importResults.data.length} rows. This is a preview - actual import functionality would be implemented here.
                  </p>
                  <div className="bg-slate-50 p-2 rounded text-xs max-h-40 overflow-auto">
                    <pre>{JSON.stringify(importResults.data.slice(0, 3), null, 2)}</pre>
                  </div>
                </div>
              )}

              {importResults.type === 'json' && (
                <div>
                  <h4 className="font-medium mb-2">JSON Import Preview</h4>
                  <p className="text-sm text-slate-600 mb-2">
                    JSON backup detected. This is a preview - actual import functionality would be implemented here.
                  </p>
                  <div className="bg-slate-50 p-2 rounded text-xs max-h-40 overflow-auto">
                    <pre>{JSON.stringify(importResults.data, null, 2).slice(0, 500)}...</pre>
                  </div>
                </div>
              )}

              {importResults.type === 'error' && (
                <div className="text-red-600">
                  <h4 className="font-medium mb-2">Import Error</h4>
                  <p className="text-sm">{importResults.message}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that will permanently delete data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
                disabled={data.items.length === 0 && data.students.length === 0 && data.rentals.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear All Data</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete ALL inventory items, students, and rental records.
                  This action cannot be undone. Make sure you have exported your data first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={clearAllData}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Yes, Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Export Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-2">
          <p>• <strong>CSV files:</strong> Can be opened in Excel, Google Sheets, or any spreadsheet application</p>
          <p>• <strong>JSON backup:</strong> Contains all data and can be used to restore your complete system</p>
          <p>• <strong>Regular backups:</strong> Export your data regularly to prevent data loss</p>
          <p>• <strong>Spreadsheet analysis:</strong> Use CSV exports to analyze trends, create reports, or share data</p>
          <p>• <strong>Import (coming soon):</strong> Import functionality will allow bulk adding of items and students</p>
        </CardContent>
      </Card>
    </div>
  );
}
