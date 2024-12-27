"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUp, Eye, Download, Pencil, Trash2, BookText, Loader2, Filter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadPDF } from "@/app/lib/appwrite";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Subject {
  _id: string;
  name: string;
  code: string;
}

interface Branch {
  _id: string;
  name: string;
  code: string;
}

interface Note {
  _id: string;
  title: string;
  subject: Subject;
  branch: Branch;
  yearId: Year;
  semesterId: Semester;
  description?: string;
  fileId: string;
  fileUrl: string | null;
  createdAt: string;
}

interface Organizer {
  _id: string;
  title: string;
  branch: Branch;
  yearId: Year;
  description?: string;
  fileId: string;
  fileUrl: string | null;
  createdAt: string;
}

interface Year {
  _id: string;
  value: number;
  label: string;
}

interface Semester {
  _id: string;
  value: number;
  label: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<(Note | Organizer)[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const [newNote, setNewNote] = useState({
    title: "",
    type: "notes" as const,
    subject: "",
    branch: "",
    yearId: "",
    semesterId: "",
    description: "",
  });

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Note | Organizer | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Note | Organizer | null>(null);
  const [filter, setFilter] = useState<'all' | 'notes' | 'organizer'>('all');
  const [years, setYears] = useState<Year[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);

  const filteredItems = notes.filter(item => {
    if (filter === 'all') return true;
    return filter === 'notes' ? isNote(item) : !isNote(item);
  });

  useEffect(() => {
    fetchNotes();
    fetchSubjects();
    fetchBranches();
    fetchYears();
    fetchSemesters();
  }, []);

  const fetchNotes = async () => {
    try {
      const [notesRes, organizersRes] = await Promise.all([
        fetch("/api/admin/notes"),
        fetch("/api/admin/organizers")
      ]);

      if (!notesRes.ok || !organizersRes.ok) 
        throw new Error("Failed to fetch data");

      const [notes, organizers] = await Promise.all([
        notesRes.json(),
        organizersRes.json()
      ]);

      // Combine and sort by creation date
      const combined = [...notes, ...organizers.map((org: any) => ({
        ...org,
        type: 'organizer'
      }))].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotes(combined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive",
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch("/api/admin/subjects");
      if (!response.ok) throw new Error("Failed to fetch subjects");
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subjects",
        variant: "destructive",
      });
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await fetch("/api/admin/branches");
      if (!response.ok) throw new Error("Failed to fetch branches");
      const data = await response.json();
      setBranches(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch branches",
        variant: "destructive",
      });
    }
  };

  const fetchYears = async () => {
    try {
      const response = await fetch("/api/admin/academic/years");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch years");
      }
      const data = await response.json();
      setYears(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch years",
        variant: "destructive",
      });
    }
  };

  const fetchSemesters = async () => {
    try {
      const response = await fetch("/api/admin/academic/semesters");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch semesters");
      }
      const data = await response.json();
      setSemesters(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch semesters",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a PDF file",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Upload file first
      const fileId = await uploadPDF(selectedFile);

      // Choose API endpoint based on type
      const endpoint = newNote.type === 'notes' 
        ? "/api/admin/notes"
        : "/api/admin/organizers";

      // Prepare data based on type
      const submitData = newNote.type === 'notes' 
        ? {
            title: newNote.title,
            subject: newNote.subject,
            branch: newNote.branch,
            yearId: newNote.yearId,
            semesterId: newNote.semesterId,
            description: newNote.description,
            fileId,
          }
        : {
            title: newNote.title,
            branch: newNote.branch,
            yearId: newNote.yearId,
            description: newNote.description,
            fileId,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create note");
      }

      const data = await response.json();
      setNotes([data, ...notes]);
      
      // Reset form
      setNewNote({
        title: "",
        type: "notes",
        subject: "",
        branch: "",
        yearId: "",
        semesterId: "",
        description: "",
      });
      setSelectedFile(null);

      // Reset file input
      const fileInput = document.getElementById('file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      toast({
        title: "Success",
        description: `${newNote.type === 'notes' ? 'Note' : 'Organizer'} uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessFile = async (item: Note | Organizer) => {
    setIsLoading(true);
    try {
      const endpoint = isNote(item) 
        ? "/api/notes/access"
        : "/api/organizers/access";

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: item._id 
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate access");
      }

      const { fileUrl } = await response.json();
      
      // Update the item in the local state with the new URL
      setNotes(notes.map(n => 
        n._id === item._id ? { ...n, fileUrl } : n
      ));

      toast({
        title: "Success",
        description: "File access generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate file access",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    setNewNote({
      ...newNote,
      type: type as 'notes' | 'organizer',
      // Clear subject and semester if switching to organizer
      ...(type === 'organizer' && {
        subject: "",
        semesterId: ""
      })
    });
  };

  function isNote(item: Note | Organizer | null): item is Note {
    if (!item) return false;
    return 'subject' in item && 'semesterId' in item;
  }

  const handleDelete = async (item: Note | Organizer) => {
    try {
      const endpoint = isNote(item) 
        ? `/api/admin/notes/${item._id}`
        : `/api/admin/organizers/${item._id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete");
      }

      setNotes(notes.filter(n => n._id !== item._id));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);

      toast({
        title: "Success",
        description: `${isNote(item) ? 'Note' : 'Organizer'} deleted successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete",
        variant: "destructive",
      });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemToEdit) return;

    try {
      const endpoint = isNote(itemToEdit) 
        ? `/api/admin/notes/${itemToEdit._id}`
        : `/api/admin/organizers/${itemToEdit._id}`;

      // Prepare update data
      const updateData = isNote(itemToEdit) 
        ? {
            title: itemToEdit.title,
            description: itemToEdit.description,
            subject: itemToEdit.subject._id,
            branch: itemToEdit.branch._id,
            yearId: itemToEdit.yearId._id,
            semesterId: itemToEdit.semesterId._id,
            fileId: itemToEdit.fileId
          }
        : {
            title: itemToEdit.title,
            description: itemToEdit.description,
            branch: itemToEdit.branch._id,
            yearId: itemToEdit.yearId._id,
            fileId: itemToEdit.fileId
          };

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update");
      }

      const updatedItem = await response.json();

      // Update the local state with the populated data
      setNotes(notes.map(n => n._id === updatedItem._id ? {
        ...updatedItem,
        yearId: {
          _id: updatedItem.yearId,
          label: years.find(y => y._id === updatedItem.yearId)?.label || '',
          value: years.find(y => y._id === updatedItem.yearId)?.value || 0
        },
        ...(isNote(n) && {
          semesterId: {
            _id: updatedItem.semesterId,
            label: semesters.find(s => s._id === updatedItem.semesterId)?.label || '',
            value: semesters.find(s => s._id === updatedItem.semesterId)?.value || 0
          }
        })
      } : n));

      setIsEditDialogOpen(false);
      setItemToEdit(null);

      toast({
        title: "Success",
        description: `${isNote(updatedItem) ? 'Note' : 'Organizer'} updated successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notes Management</h1>
      </div>

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Note</CardTitle>
          <CardDescription>Upload a new note with details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Note Type</Label>
                <RadioGroup
                  defaultValue="notes"
                  value={newNote.type}
                  onValueChange={handleTypeChange}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="notes" id="notes" />
                    <Label htmlFor="notes">Notes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="organizer" id="organizer" />
                    <Label htmlFor="organizer">Organizer</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Note Title"
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Note Description"
                  value={newNote.description}
                  onChange={(e) => setNewNote({ ...newNote, description: e.target.value })}
                />
              </div>

              {newNote.type === 'notes' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select
                      value={newNote.subject}
                      onValueChange={(value) => setNewNote({ ...newNote, subject: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name} ({subject.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="semester">Semester</Label>
                    <Select
                      value={newNote.semesterId}
                      onValueChange={(value) => setNewNote({ ...newNote, semesterId: value })}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester._id} value={semester._id}>
                            {semester.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={newNote.branch}
                  onValueChange={(value) => setNewNote({ ...newNote, branch: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={newNote.yearId}
                  onValueChange={(value) => setNewNote({ ...newNote, yearId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year._id} value={year._id}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">PDF File</Label>
                <Input
                  id="file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                "Uploading..."
              ) : (
                <>
                  <FileUp className="w-4 h-4 mr-2" />
                  Upload Note
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {filter === 'all' ? 'All Documents' : 
                 filter === 'notes' ? 'Notes Only' : 'Organizers Only'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Documents
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('notes')}>
                Notes Only
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('organizer')}>
                Organizers Only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Year</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100">
                    {isNote(item) ? 'Note' : 'Organizer'}
                  </span>
                </TableCell>
                <TableCell>
                  {isNote(item) ? (
                    <>
                      {item.subject?.name} • {item.branch?.name}
                      <div className="text-sm text-muted-foreground">
                        {item.semesterId.label} • {item.yearId.label}
                      </div>
                    </>
                  ) : (
                    <>
                      {item.branch?.name} • {item.yearId.label}
                    </>
                  )}
                  {item.description && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>Year {item.yearId.label}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {item.fileUrl ? (
                      <>
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </a>
                        <a
                          href={item.fileUrl}
                          download
                        >
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </a>
                      </>
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleAccessFile(item)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileUp className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItemToEdit(item);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setItemToDelete(item);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit {itemToEdit ? (isNote(itemToEdit) ? 'Note' : 'Organizer') : ''}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={itemToEdit?.title || ''}
                  onChange={(e) => setItemToEdit(prev => prev ? { ...prev, title: e.target.value } : null)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={itemToEdit?.description || ''}
                  onChange={(e) => setItemToEdit(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>

              {itemToEdit && isNote(itemToEdit) && (
                <>
                  <div>
                    <Label htmlFor="edit-subject">Subject</Label>
                    <Select
                      value={itemToEdit.subject?._id || ''}
                      onValueChange={(value) => setItemToEdit(prev => 
                        prev && isNote(prev) ? { ...prev, subject: value } : prev
                      )}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject._id} value={subject._id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* Common fields for both types */}
              <div>
                <Label htmlFor="edit-branch">Branch</Label>
                <Select
                  value={itemToEdit?.branch?._id || ''}
                  onValueChange={(value) => setItemToEdit(prev => 
                    prev ? { ...prev, branch: value } : null
                  )}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch._id} value={branch._id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-year">Year</Label>
                <Select
                  value={itemToEdit?.yearId?._id}
                  onValueChange={(value) => {
                    const selectedYear = years.find(y => y._id === value);
                    setItemToEdit(prev => prev ? {
                      ...prev,
                      yearId: {
                        _id: value,
                        label: selectedYear?.label || '',
                        value: selectedYear?.value || 0
                      }
                    } : null);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year._id} value={year._id}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {itemToEdit && isNote(itemToEdit) && (
                <div>
                  <Label htmlFor="edit-semester">Semester</Label>
                  <Select
                    value={itemToEdit.semesterId._id}
                    onValueChange={(value) => {
                      const selectedSemester = semesters.find(s => s._id === value);
                      setItemToEdit(prev => 
                        prev && isNote(prev) ? {
                          ...prev,
                          semesterId: {
                            _id: value,
                            label: selectedSemester?.label || '',
                            value: selectedSemester?.value || 0
                          }
                        } : prev
                      );
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((semester) => (
                        <SelectItem key={semester._id} value={semester._id}>
                          {semester.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{' '}
              {itemToDelete ? (isNote(itemToDelete) ? 'note' : 'organizer') : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => itemToDelete && handleDelete(itemToDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 