'use client';

import { useState } from 'react';
import { useInventoryWithSync } from '@/hooks/useInventoryWithSync';
import { Student } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Search, Users, Mail, Phone } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';

export function StudentManager() {
  const { data, addStudent, updateStudent, deleteStudent, getActiveRentals } = useInventoryWithSync();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const form = useForm<Omit<Student, 'id' | 'createdAt'>>({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      grade: '',
      parentContact: '',
      emergencyContact: ''
    }
  });

  const activeRentals = getActiveRentals();

  const filteredStudents = data.students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStudentRentals = (studentId: string) => {
    return activeRentals.filter(rental => rental.studentId === studentId);
  };

  const handleSubmit = (formData: Omit<Student, 'id' | 'createdAt'>) => {
    if (editingStudent) {
      updateStudent(editingStudent.id, formData);
      setEditingStudent(null);
    } else {
      addStudent(formData);
      setIsAddDialogOpen(false);
    }
    form.reset();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    form.reset({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      grade: student.grade || '',
      parentContact: student.parentContact || '',
      emergencyContact: student.emergencyContact || ''
    });
  };

  const handleDelete = (id: string) => {
    deleteStudent(id);
  };

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Student Management</h2>
          <p className="text-slate-600">Manage student information and contact details</p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-slate-800 hover:bg-slate-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
              <DialogDescription>
                Add a new student to your database
              </DialogDescription>
            </DialogHeader>
            <StudentForm
              form={form}
              onSubmit={handleSubmit}
              onCancel={() => {
                setIsAddDialogOpen(false);
                form.reset();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search by name, email, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Current Rentals</TableHead>
                  <TableHead>Added</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => {
                  const studentRentals = getStudentRentals(student.id);
                  return (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.grade || '—'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {student.email && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Mail className="h-3 w-3" />
                              {student.email}
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1 text-sm text-slate-600">
                              <Phone className="h-3 w-3" />
                              {student.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {studentRentals.length > 0 ? (
                          <div className="space-y-1">
                            {studentRentals.map((rental) => (
                              <div key={rental.id} className="text-sm bg-orange-50 text-orange-800 px-2 py-1 rounded">
                                {rental.item?.name || 'Unknown Item'}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-500">No active rentals</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {format(new Date(student.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog open={editingStudent?.id === student.id} onOpenChange={(open) => {
                            if (!open) setEditingStudent(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                              <DialogHeader>
                                <DialogTitle>Edit Student</DialogTitle>
                                <DialogDescription>
                                  Update information for {student.name}
                                </DialogDescription>
                              </DialogHeader>
                              <StudentForm
                                form={form}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                  setEditingStudent(null);
                                  form.reset();
                                }}
                                isEditing
                              />
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                disabled={studentRentals.length > 0}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Student</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{student.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(student.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                No students found. {data.students.length === 0 ? 'Add your first student to get started!' : 'Try adjusting your search.'}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Form Component
function StudentForm({
  form,
  onSubmit,
  onCancel,
  isEditing = false
}: {
  form: ReturnType<typeof useForm<Omit<Student, 'id' | 'createdAt'>>>;
  onSubmit: (data: Omit<Student, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter student's full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="student@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="grade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grade/Year</FormLabel>
              <FormControl>
                <Input placeholder="e.g., 9th Grade, Sophomore, etc." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent/Guardian Contact</FormLabel>
              <FormControl>
                <Input placeholder="Parent name and contact info" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact</FormLabel>
              <FormControl>
                <Input placeholder="Emergency contact name and phone" {...field} />
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
            {isEditing ? 'Update Student' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
