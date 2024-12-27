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
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Branch {
  _id: string;
  name: string;
  code: string;
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

interface Credit {
  _id: string;
  value: number;
  label: string;
}

interface Subject {
  _id: string;
  name: string;
  code: string;
  branchId: Branch;
  yearId: Year;
  semesterId: Semester;
  creditId: Credit;
  description?: string;
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [credits, setCredits] = useState<Credit[]>([]);

  const [newSubject, setNewSubject] = useState({
    title: "",
    code: "",
    branchId: "",
    yearId: "",
    semesterId: "",
    creditId: "",
    description: "",
  });

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteSubjectId, setDeleteSubjectId] = useState<string>("");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchSubjects();
    fetchBranches();
    fetchYears();
    fetchSemesters();
    fetchCredits();
  }, []);

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
      const response = await fetch("/api/branches");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch branches");
      }
      const data = await response.json();
      setBranches(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch branches",
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

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/admin/academic/credits");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch credits");
      }
      const data = await response.json();
      setCredits(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch credits",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setSubjects([...subjects, data]);
      setNewSubject({
        title: "",
        code: "",
        branchId: "",
        yearId: "",
        semesterId: "",
        creditId: "",
        description: "",
      });

      toast({
        title: "Success",
        description: "Subject created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setNewSubject({
      title: subject.name,
      code: subject.code,
      branchId: subject.branchId._id,
      yearId: subject.yearId._id,
      semesterId: subject.semesterId._id,
      creditId: subject.creditId._id,
      description: subject.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!editingSubject) return;

      const response = await fetch(`/api/admin/subjects?id=${editingSubject._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSubject),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const updatedSubject = await response.json();
      setSubjects(subjects.map(s => s._id === updatedSubject._id ? updatedSubject : s));
      setNewSubject({
        title: "",
        code: "",
        branchId: "",
        yearId: "",
        semesterId: "",
        creditId: "",
        description: "",
      });
      setIsEditing(false);
      setEditingSubject(null);

      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/subjects?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setSubjects(subjects.filter(subject => subject._id !== id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Subject</CardTitle>
          <CardDescription>Create a new subject</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isEditing ? handleUpdate : handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Subject Title</Label>
                <Input
                  id="title"
                  value={newSubject.title}
                  onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Subject Code</Label>
                <Input
                  id="code"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch">Branch</Label>
                <Select
                  value={newSubject.branchId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, branchId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
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
                  value={newSubject.yearId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, yearId: value })}
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
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={newSubject.semesterId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, semesterId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
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
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Select
                  value={newSubject.creditId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, creditId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credits" />
                  </SelectTrigger>
                  <SelectContent>
                    {credits.map((credit) => (
                      <SelectItem key={credit._id} value={credit._id}>
                        {credit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newSubject.description}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              />
            </div>
            <Button type="submit" onClick={isEditing ? handleUpdate : handleSubmit}>
              {isEditing ? (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Update Subject
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subject
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject._id}>
                  <TableCell>{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                  <TableCell>{subject.branchId.name}</TableCell>
                  <TableCell>{subject.yearId.label}</TableCell>
                  <TableCell>{subject.semesterId.label}</TableCell>
                  <TableCell>{subject.creditId.label}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEdit(subject)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => {
                        setDeleteSubjectId(subject._id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this subject? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteSubjectId)}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Subject</DialogTitle>
            <DialogDescription>
              Make changes to the subject details below.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Subject Title</Label>
                <Input
                  id="edit-title"
                  value={newSubject.title}
                  onChange={(e) => setNewSubject({ ...newSubject, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-code">Subject Code</Label>
                <Input
                  id="edit-code"
                  value={newSubject.code}
                  onChange={(e) => setNewSubject({ ...newSubject, code: e.target.value.toUpperCase() })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-branch">Branch</Label>
                <Select
                  value={newSubject.branchId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, branchId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
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
                <Label htmlFor="edit-year">Year</Label>
                <Select
                  value={newSubject.yearId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, yearId: value })}
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
                <Label htmlFor="edit-semester">Semester</Label>
                <Select
                  value={newSubject.semesterId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, semesterId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
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
              <div className="space-y-2">
                <Label htmlFor="edit-credits">Credits</Label>
                <Select
                  value={newSubject.creditId}
                  onValueChange={(value) => setNewSubject({ ...newSubject, creditId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select credits" />
                  </SelectTrigger>
                  <SelectContent>
                    {credits.map((credit) => (
                      <SelectItem key={credit._id} value={credit._id}>
                        {credit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={newSubject.description}
                onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
