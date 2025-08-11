'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Database, Trash2 } from 'lucide-react';
import { InventoryItem, Student, Rental } from '@/types';

interface SampleDataLoaderProps {
  onLoadSampleData: (data: { items: InventoryItem[]; students: Student[]; rentals: Rental[] }) => void;
  hasExistingData: boolean;
}

export function SampleDataLoader({ onLoadSampleData, hasExistingData }: SampleDataLoaderProps) {

  const generateSampleData = () => {
    const now = new Date().toISOString();
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Sample Students
    const students: Student[] = [
      {
        id: 'student-1',
        name: 'Emma Johnson',
        email: 'emma.johnson@school.edu',
        phone: '(555) 123-4567',
        grade: '9th Grade',
        parentContact: 'Sarah Johnson - (555) 123-4568',
        emergencyContact: 'Mike Johnson - (555) 123-4569',
        createdAt: oneMonthAgo
      },
      {
        id: 'student-2',
        name: 'Alex Chen',
        email: 'alex.chen@school.edu',
        phone: '(555) 234-5678',
        grade: '10th Grade',
        parentContact: 'Linda Chen - (555) 234-5679',
        emergencyContact: 'David Chen - (555) 234-5680',
        createdAt: oneMonthAgo
      },
      {
        id: 'student-3',
        name: 'Marcus Williams',
        email: 'marcus.williams@school.edu',
        phone: '(555) 345-6789',
        grade: '11th Grade',
        parentContact: 'Janet Williams - (555) 345-6790',
        emergencyContact: 'Robert Williams - (555) 345-6791',
        createdAt: oneMonthAgo
      },
      {
        id: 'student-4',
        name: 'Sophia Martinez',
        email: 'sophia.martinez@school.edu',
        grade: '12th Grade',
        parentContact: 'Maria Martinez - (555) 456-7890',
        createdAt: oneMonthAgo
      },
      {
        id: 'student-5',
        name: 'Tyler Brown',
        email: 'tyler.brown@school.edu',
        phone: '(555) 567-8901',
        grade: '9th Grade',
        parentContact: 'Lisa Brown - (555) 567-8902',
        createdAt: oneMonthAgo
      }
    ];

    // Sample Instruments
    const items: InventoryItem[] = [
      {
        id: 'item-1',
        name: 'Student Trumpet',
        category: 'Brass',
        brand: 'Yamaha',
        model: 'YTR-2330',
        serialNumber: 'Y2023-001',
        condition: 'Good',
        purchaseDate: '2023-08-15',
        purchasePrice: 450,
        currentValue: 400,
        location: 'Brass Cabinet A',
        barcode: 'BI17350923ABCD',
        isRented: true,
        notes: 'Excellent student instrument',
        createdAt: oneMonthAgo,
        updatedAt: now
      },
      {
        id: 'item-2',
        name: 'Alto Saxophone',
        category: 'Woodwind',
        brand: 'Selmer',
        model: 'AS42',
        serialNumber: 'S2022-045',
        condition: 'Excellent',
        purchaseDate: '2022-09-01',
        purchasePrice: 1200,
        currentValue: 1000,
        location: 'Woodwind Cabinet B',
        barcode: 'BI17350924EFGH',
        isRented: false,
        notes: 'Professional quality instrument',
        createdAt: oneMonthAgo,
        updatedAt: oneMonthAgo
      },
      {
        id: 'item-3',
        name: 'Snare Drum',
        category: 'Percussion',
        brand: 'Ludwig',
        model: 'LC662',
        serialNumber: 'L2023-012',
        condition: 'Good',
        purchaseDate: '2023-06-10',
        purchasePrice: 300,
        currentValue: 275,
        location: 'Percussion Room',
        barcode: 'BI17350925IJKL',
        isRented: true,
        notes: 'Includes mallets and stand',
        createdAt: oneMonthAgo,
        updatedAt: now
      },
      {
        id: 'item-4',
        name: 'Flute',
        category: 'Woodwind',
        brand: 'Gemeinhardt',
        model: '3OB',
        serialNumber: 'G2023-078',
        condition: 'Fair',
        purchaseDate: '2023-01-20',
        purchasePrice: 250,
        currentValue: 200,
        location: 'Woodwind Cabinet A',
        barcode: 'BI17350926MNOP',
        isRented: false,
        notes: 'Needs cleaning and minor adjustments',
        createdAt: oneMonthAgo,
        updatedAt: oneMonthAgo
      },
      {
        id: 'item-5',
        name: 'French Horn',
        category: 'Brass',
        brand: 'Jupiter',
        model: 'JHR1100',
        serialNumber: 'J2022-156',
        condition: 'Excellent',
        purchaseDate: '2022-11-15',
        purchasePrice: 800,
        currentValue: 700,
        location: 'Brass Cabinet B',
        barcode: 'BI17350927QRST',
        isRented: true,
        notes: 'Double horn with case',
        createdAt: oneMonthAgo,
        updatedAt: now
      },
      {
        id: 'item-6',
        name: 'Clarinet',
        category: 'Woodwind',
        brand: 'Buffet',
        model: 'E11',
        serialNumber: 'B2023-089',
        condition: 'Good',
        purchaseDate: '2023-03-05',
        purchasePrice: 550,
        currentValue: 500,
        location: 'Woodwind Cabinet A',
        barcode: 'BI17350928UVWX',
        isRented: false,
        notes: 'Professional student model',
        createdAt: oneMonthAgo,
        updatedAt: oneMonthAgo
      },
      {
        id: 'item-7',
        name: 'Trombone',
        category: 'Brass',
        brand: 'Bach',
        model: 'TB301',
        serialNumber: 'B2022-203',
        condition: 'Needs Repair',
        purchaseDate: '2022-08-30',
        purchasePrice: 650,
        currentValue: 450,
        location: 'Repair Shop',
        barcode: 'BI17350929YZAB',
        isRented: false,
        notes: 'Slide needs alignment, valve repair needed',
        createdAt: oneMonthAgo,
        updatedAt: oneMonthAgo
      },
      {
        id: 'item-8',
        name: 'Violin',
        category: 'String',
        brand: 'Stentor',
        model: 'Student II',
        serialNumber: 'ST2023-034',
        condition: 'Good',
        purchaseDate: '2023-09-12',
        purchasePrice: 180,
        currentValue: 160,
        location: 'String Cabinet',
        barcode: 'BI17350930CDEF',
        isRented: false,
        notes: '4/4 size with bow and case',
        createdAt: oneMonthAgo,
        updatedAt: oneMonthAgo
      }
    ];

    // Sample Rentals
    const rentals: Rental[] = [
      {
        id: 'rental-1',
        itemId: 'item-1', // Trumpet
        studentId: 'student-1', // Emma Johnson
        rentedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturnDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        condition: 'Good',
        notes: 'For fall concert preparation',
        isActive: true
      },
      {
        id: 'rental-2',
        itemId: 'item-3', // Snare Drum
        studentId: 'student-2', // Alex Chen
        rentedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturnDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        condition: 'Good',
        notes: 'Percussion ensemble practice',
        isActive: true
      },
      {
        id: 'rental-3',
        itemId: 'item-5', // French Horn
        studentId: 'student-3', // Marcus Williams
        rentedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturnDate: new Date(Date.now() + 55 * 24 * 60 * 60 * 1000).toISOString(),
        condition: 'Excellent',
        notes: 'Advanced student, long-term rental',
        isActive: true
      },
      {
        id: 'rental-4',
        itemId: 'item-2', // Alto Sax (returned)
        studentId: 'student-4', // Sophia Martinez
        rentedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        expectedReturnDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        actualReturnDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        condition: 'Excellent',
        notes: 'Returned in perfect condition',
        isActive: false
      }
    ];

    return { items, students, rentals };
  };

  const handleLoadSampleData = () => {
    const sampleData = generateSampleData();
    onLoadSampleData(sampleData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Demo Data
        </CardTitle>
        <CardDescription>
          Load sample data to explore the system features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-slate-600">
            <strong>Sample data includes:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>8 musical instruments (brass, woodwind, percussion, string)</li>
              <li>5 students with contact information</li>
              <li>3 active rentals and 1 completed rental</li>
              <li>Professional barcodes for all items</li>
            </ul>
          </div>

          {hasExistingData ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Load Sample Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Replace Existing Data?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will replace your current inventory with sample data.
                    This action cannot be undone. Consider exporting your current data first.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleLoadSampleData}>
                    Load Sample Data
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <Button onClick={handleLoadSampleData} className="w-full">
              <Database className="h-4 w-4 mr-2" />
              Load Sample Data
            </Button>
          )}

          <div className="text-xs text-slate-500">
            Perfect for testing barcode generation, rental tracking, and export features
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
