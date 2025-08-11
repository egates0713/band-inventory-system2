'use client';

import { useState } from 'react';
import { useInventoryWithSync } from '@/hooks/useInventoryWithSync';
import { InventoryItem, Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search, Calendar, User, Package, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format, isAfter, parseISO } from 'date-fns';

interface RentalForm {
  itemId: string;
  studentId: string;
  expectedReturnDate?: string;
  notes?: string;
}

interface ReturnFormData {
  condition: 'Excellent' | 'Good' | 'Fair' | 'Needs Repair';
  notes?: string;
}

export function RentalManager() {
  const { data, rentItem, returnItem, getActiveRentals } = useInventoryWithSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRentDialogOpen, setIsRentDialogOpen] = useState(false);
  const [returningRental, setReturningRental] = useState<(typeof activeRentals)[0] | null>(null);

  const rentForm = useForm<RentalForm>({
    defaultValues: {
      itemId: '',
      studentId: '',
      expectedReturnDate: '',
      notes: ''
    }
  });

  const returnForm = useForm<ReturnFormData>({
    defaultValues: {
      condition: 'Good',
      notes: ''
    }
  });

  const activeRentals = getActiveRentals();
  const availableItems = data.items.filter(item => !item.isRented && item.condition !== 'Out of Service');

  const filteredRentals = activeRentals.filter(rental =>
    rental.item?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.student?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rental.item?.barcode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isOverdue = (expectedReturn?: string) => {
    if (!expectedReturn) return false;
    return isAfter(new Date(), parseISO(expectedReturn));
  };

  const handleRent = (formData: RentalForm) => {
    rentItem(
      formData.itemId,
      formData.studentId,
      formData.expectedReturnDate,
      formData.notes
    );
    setIsRentDialogOpen(false);
    rentForm.reset();
  };

  const handleReturn = (formData: ReturnFormData) => {
    if (returningRental) {
      returnItem(returningRental.id, formData.condition, formData.notes);
      setReturningRental(null);
      returnForm.reset();
    }
  };

  const startReturn = (rental: (typeof activeRentals)[0]) => {
    setReturningRental(rental);
    returnForm.reset({
      condition: 'Good',
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rental Management</h2>
          <p className="text-slate-600">Track instrument rentals and returns</p>
        </div>

        <Dialog open={isRentDialogOpen} onOpenChange={setIsRentDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-slate-800 hover:bg-slate-700"
              disabled={availableItems.length === 0 || data.students.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Rent Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Rent Out Item</DialogTitle>
              <DialogDescription>
                Assign an instrument to a student
              </DialogDescription>
            </DialogHeader>
            <RentForm
              form={rentForm}
              onSubmit={handleRent}
              onCancel={() => {
                setIsRentDialogOpen(false);
                rentForm.reset();
              }}
              availableItems={availableItems}
              students={data.students}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rentals</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRentals.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Returns</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeRentals.filter(r => isOverdue(r.expectedReturnDate)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by item name, student name, or barcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Active Rentals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Rentals ({filteredRentals.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Rented Date</TableHead>
                  <TableHead>Expected Return</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRentals.map((rental) => (
                  <TableRow key={rental.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rental.item?.name || 'Unknown Item'}</div>
                        <div className="text-sm text-slate-500 font-mono">
                          {rental.item?.barcode}
                        </div>
                        {rental.item?.brand && rental.item?.model && (
                          <div className="text-sm text-slate-500">
                            {rental.item.brand} {rental.item.model}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{rental.student?.name || 'Unknown Student'}</div>
                        {rental.student?.grade && (
                          <div className="text-sm text-slate-500">{rental.student.grade}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(rental.rentedDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {rental.expectedReturnDate ? (
                        <div className={isOverdue(rental.expectedReturnDate) ? 'text-red-600 font-medium' : ''}>
                          {format(new Date(rental.expectedReturnDate), 'MMM d, yyyy')}
                          {isOverdue(rental.expectedReturnDate) && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">Not specified</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={isOverdue(rental.expectedReturnDate) ? "destructive" : "secondary"}
                        className="bg-orange-100 text-orange-800"
                      >
                        Rented
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Dialog open={returningRental?.id === rental.id} onOpenChange={(open) => {
                        if (!open) setReturningRental(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startReturn(rental)}
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Return
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                          <DialogHeader>
                            <DialogTitle>Return Item</DialogTitle>
                            <DialogDescription>
                              Mark "{rental.item?.name}" as returned by {rental.student?.name}
                            </DialogDescription>
                          </DialogHeader>
                          <ReturnForm
                            form={returnForm}
                            onSubmit={handleReturn}
                            onCancel={() => {
                              setReturningRental(null);
                              returnForm.reset();
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredRentals.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                {activeRentals.length === 0
                  ? 'No active rentals. Start by renting out an item!'
                  : 'No rentals match your search.'
                }
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Rent Form Component
function RentForm({
  form,
  onSubmit,
  onCancel,
  availableItems,
  students
}: {
  form: ReturnType<typeof useForm<RentalForm>>;
  onSubmit: (data: RentalForm) => void;
  onCancel: () => void;
  availableItems: InventoryItem[];
  students: Student[];
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="itemId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Item *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an available item" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableItems.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        <span className="text-sm text-slate-500 font-mono">{item.barcode}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="studentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Select Student *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {students.map(student => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex flex-col">
                        <span>{student.name}</span>
                        {student.grade && (
                          <span className="text-sm text-slate-500">{student.grade}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expectedReturnDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Return Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any special notes about this rental..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
            Rent Item
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Return Form Component
function ReturnForm({
  form,
  onSubmit,
  onCancel
}: {
  form: ReturnType<typeof useForm<ReturnFormData>>;
  onSubmit: (data: ReturnFormData) => void;
  onCancel: () => void;
}) {
  const conditions = ['Excellent', 'Good', 'Fair', 'Needs Repair'];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Condition *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select item condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {conditions.map(condition => (
                    <SelectItem key={condition} value={condition}>{condition}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Return Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any notes about the condition or return..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="bg-slate-800 hover:bg-slate-700">
            Mark as Returned
          </Button>
        </div>
      </form>
    </Form>
  );
}
