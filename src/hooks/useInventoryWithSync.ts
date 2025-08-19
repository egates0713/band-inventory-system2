'use client';

import { useState, useEffect, useCallback } from 'react';
import { InventoryItem, Student, Rental, InventoryData, InventoryStats } from '@/types';

const STORAGE_KEY = 'band-inventory-data';

// Generate unique ID
const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Generate barcode
const generateBarcode = () => {
  return `BI${Date.now().toString().slice(-8)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
};

interface LocalStorageStatus {
  isLoaded: boolean;
  lastSaved?: Date;
  itemCount: number;
}

export const useInventoryWithSync = () => {
  const [data, setData] = useState<InventoryData>({
    items: [],
    students: [],
    rentals: []
  });

  const [loading, setLoading] = useState(true);
  const [localStorageStatus, setLocalStorageStatus] = useState<LocalStorageStatus>({
    isLoaded: false,
    itemCount: 0
  });

  // Initialize and load data
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    loadLocalData();
  }, []);

  // Load data from localStorage
  const loadLocalData = () => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsedData = JSON.parse(stored);
          setData(parsedData);
          setLocalStorageStatus({
            isLoaded: true,
            lastSaved: new Date(localStorage.getItem(STORAGE_KEY + '_timestamp') || Date.now()),
            itemCount: parsedData.items?.length || 0
          });
        } else {
          setLocalStorageStatus({
            isLoaded: true,
            itemCount: 0
          });
        }
      }
    } catch (error) {
      console.error('Error loading local data:', error);
      setLocalStorageStatus({
        isLoaded: true,
        itemCount: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Save data to localStorage
  const saveData = useCallback(async (newData: InventoryData) => {
    try {
      // Save locally
      saveToLocal(newData);
      setData(newData);

      // Update status
      setLocalStorageStatus({
        isLoaded: true,
        lastSaved: new Date(),
        itemCount: newData.items?.length || 0
      });
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }, []);

  // Save to localStorage only
  const saveToLocal = (data: InventoryData) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(STORAGE_KEY + '_timestamp', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error saving to local storage:', error);
    }
  };

  // Inventory Items
  const addItem = useCallback((item: Omit<InventoryItem, 'id' | 'barcode' | 'createdAt' | 'updatedAt' | 'isRented'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      barcode: generateBarcode(),
      isRented: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      items: [...data.items, newItem]
    };
    saveData(newData);
    return newItem;
  }, [data, saveData]);

  const updateItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    const newData = {
      ...data,
      items: data.items.map(item =>
        item.id === id
          ? { ...item, ...updates, updatedAt: new Date().toISOString() }
          : item
      )
    };
    saveData(newData);
  }, [data, saveData]);

  const deleteItem = useCallback((id: string) => {
    const newData = {
      ...data,
      items: data.items.filter(item => item.id !== id),
      rentals: data.rentals.filter(rental => rental.itemId !== id)
    };
    saveData(newData);
  }, [data, saveData]);

  // Students
  const addStudent = useCallback((student: Omit<Student, 'id' | 'createdAt'>) => {
    const newStudent: Student = {
      ...student,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    const newData = {
      ...data,
      students: [...data.students, newStudent]
    };
    saveData(newData);
    return newStudent;
  }, [data, saveData]);

  const updateStudent = useCallback((id: string, updates: Partial<Student>) => {
    const newData = {
      ...data,
      students: data.students.map(student =>
        student.id === id ? { ...student, ...updates } : student
      )
    };
    saveData(newData);
  }, [data, saveData]);

  const deleteStudent = useCallback((id: string) => {
    const newData = {
      ...data,
      students: data.students.filter(student => student.id !== id),
      rentals: data.rentals.filter(rental => rental.studentId !== id)
    };
    saveData(newData);
  }, [data, saveData]);

  // Rentals
  const rentItem = useCallback((itemId: string, studentId: string, expectedReturnDate?: string, notes?: string) => {
    const rental: Rental = {
      id: generateId(),
      itemId,
      studentId,
      rentedDate: new Date().toISOString(),
      expectedReturnDate,
      condition: 'Good',
      notes,
      isActive: true
    };

    const newData = {
      ...data,
      items: data.items.map(item =>
        item.id === itemId ? { ...item, isRented: true, updatedAt: new Date().toISOString() } : item
      ),
      rentals: [...data.rentals, rental]
    };
    saveData(newData);
    return rental;
  }, [data, saveData]);

  const returnItem = useCallback((rentalId: string, condition: Rental['condition'], notes?: string) => {
    const rental = data.rentals.find(r => r.id === rentalId);
    if (!rental) return;

    const newData = {
      ...data,
      items: data.items.map(item =>
        item.id === rental.itemId
          ? { ...item, isRented: false, condition, updatedAt: new Date().toISOString() }
          : item
      ),
      rentals: data.rentals.map(r =>
        r.id === rentalId
          ? {
              ...r,
              actualReturnDate: new Date().toISOString(),
              condition,
              notes: notes || r.notes,
              isActive: false
            }
          : r
      )
    };
    saveData(newData);
  }, [data, saveData]);

  // Statistics
  const getStats = useCallback((): InventoryStats => {
    const totalItems = data.items.length;
    const rentedItems = data.items.filter(item => item.isRented).length;
    const availableItems = totalItems - rentedItems;
    const itemsNeedingRepair = data.items.filter(item =>
      item.condition === 'Needs Repair' || item.condition === 'Out of Service'
    ).length;
    const totalValue = data.items.reduce((sum, item) => sum + (item.currentValue || item.purchasePrice || 0), 0);

    return {
      totalItems,
      rentedItems,
      availableItems,
      itemsNeedingRepair,
      totalValue
    };
  }, [data]);

  // Get enriched rental data (with item and student info)
  const getActiveRentals = useCallback(() => {
    return data.rentals
      .filter(rental => rental.isActive)
      .map(rental => {
        const item = data.items.find(i => i.id === rental.itemId);
        const student = data.students.find(s => s.id === rental.studentId);
        return {
          ...rental,
          item,
          student
        };
      });
  }, [data]);

  const clearAllData = useCallback(() => {
    const emptyData: InventoryData = {
      items: [],
      students: [],
      rentals: []
    };
    saveData(emptyData);
  }, [saveData]);

  const loadSampleData = useCallback((sampleData: { items: InventoryItem[]; students: Student[]; rentals: Rental[] }) => {
    const newData: InventoryData = {
      items: sampleData.items,
      students: sampleData.students,
      rentals: sampleData.rentals
    };
    saveData(newData);
  }, [saveData]);

  return {
    data,
    loading,
    localStorageStatus,
    // Items
    addItem,
    updateItem,
    deleteItem,
    // Students
    addStudent,
    updateStudent,
    deleteStudent,
    // Rentals
    rentItem,
    returnItem,
    getActiveRentals,
    // Utilities
    getStats,
    clearAllData,
    loadSampleData,
  };
};