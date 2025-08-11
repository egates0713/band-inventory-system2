export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair' | 'Out of Service';
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  barcode: string;
  location?: string;
  notes?: string;
  isRented: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  grade?: string;
  parentContact?: string;
  emergencyContact?: string;
  createdAt: string;
}

export interface Rental {
  id: string;
  itemId: string;
  studentId: string;
  rentedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  notes?: string;
  isActive: boolean;
}

export interface InventoryData {
  items: InventoryItem[];
  students: Student[];
  rentals: Rental[];
}

export type CategoryType =
  | 'Brass'
  | 'Woodwind'
  | 'Percussion'
  | 'String'
  | 'Piano/Keyboard'
  | 'Equipment'
  | 'Music/Books'
  | 'Accessories'
  | 'Other';

export interface InventoryStats {
  totalItems: number;
  rentedItems: number;
  availableItems: number;
  itemsNeedingRepair: number;
  totalValue: number;
}
