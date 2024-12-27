"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Branch {
  _id: string;
  name: string;
  description: string;
  code: string;
}

export default function BranchManagement() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [newBranch, setNewBranch] = useState({
    name: "",
    description: "",
    code: "",
  });
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBranches();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/branches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newBranch),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create branch");
      }

      const data = await response.json();
      setBranches([...branches, data]);
      setNewBranch({ name: "", description: "", code: "" });
      
      toast({
        title: "Success",
        description: "Branch created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBranch) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/branches?id=${editingBranch._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editingBranch),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update branch");
      }

      const updatedBranch = await response.json();
      setBranches(branches.map(b => b._id === updatedBranch._id ? updatedBranch : b));
      setIsEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Branch updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update branch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/branches?id=${branchToDelete._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete branch");
      }

      setBranches(branches.filter(b => b._id !== branchToDelete._id));
      setIsDeleteDialogOpen(false);
      setBranchToDelete(null);
      
      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete branch",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Branch Management</h1>
      </div>

      {/* Add Branch Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Branch</CardTitle>
          <CardDescription>
            Add a new branch to the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Branch Name</Label>
                <Input
                  id="name"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                  placeholder="e.g., Computer Science"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Branch Code</Label>
                <Input
                  id="code"
                  value={newBranch.code}
                  onChange={(e) => setNewBranch({ ...newBranch, code: e.target.value })}
                  placeholder="e.g., CSE"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={newBranch.description}
                onChange={(e) => setNewBranch({ ...newBranch, description: e.target.value })}
                placeholder="Brief description of the branch"
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Branch"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Branches List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch._id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                {branch.name}
                <div className="space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setEditingBranch(branch);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500"
                    onClick={() => {
                      setBranchToDelete(branch);
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>{branch.code}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{branch.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
            <DialogDescription>
              Make changes to the branch details
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Branch Name</Label>
              <Input
                id="edit-name"
                value={editingBranch?.name || ""}
                onChange={(e) => setEditingBranch(prev => prev ? {...prev, name: e.target.value} : null)}
                placeholder="e.g., Computer Science"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-code">Branch Code</Label>
              <Input
                id="edit-code"
                value={editingBranch?.code || ""}
                onChange={(e) => setEditingBranch(prev => prev ? {...prev, code: e.target.value} : null)}
                placeholder="e.g., CSE"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editingBranch?.description || ""}
                onChange={(e) => setEditingBranch(prev => prev ? {...prev, description: e.target.value} : null)}
                placeholder="Brief description of the branch"
                required
                disabled={isLoading}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Branch</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this branch? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 