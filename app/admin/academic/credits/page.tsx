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
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Credit {
  _id: string;
  value: number;
  label: string;
}

export default function CreditsPage() {
  const [credits, setCredits] = useState<Credit[]>([]);
  const [newCredit, setNewCredit] = useState({
    value: 1,
    label: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchCredits();
  }, []);

  const fetchCredits = async () => {
    try {
      const response = await fetch("/api/admin/academic/credits");
      if (!response.ok) throw new Error("Failed to fetch credits");
      const data = await response.json();
      setCredits(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch credits",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const roundedValue = Math.round(newCredit.value * 10) / 10;

      const response = await fetch("/api/admin/academic/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCredit,
          value: roundedValue
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setCredits([...credits, data]);
      setNewCredit({ value: 1, label: "" });
      
      toast({
        title: "Success",
        description: "Credit created successfully",
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
      const response = await fetch(`/api/admin/academic/credits?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      // Remove the deleted credit from state
      setCredits(credits.filter(credit => credit._id !== id));
      
      toast({
        title: "Success",
        description: "Credit deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete credit",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Academic Credits</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Academic Credit</CardTitle>
          <CardDescription>Create a new credit value</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Credit Value</Label>
                <Input
                  id="value"
                  type="number"
                  min="0.5"
                  step="0.1"
                  value={newCredit.value}
                  onChange={(e) => setNewCredit({ 
                    ...newCredit, 
                    value: parseFloat(e.target.value) 
                  })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={newCredit.label}
                  onChange={(e) => setNewCredit({ ...newCredit, label: e.target.value })}
                  placeholder="e.g., Half Credit"
                  required
                />
              </div>
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Credit
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Credits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Value</TableHead>
                <TableHead>Label</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {credits.map((credit) => (
                <TableRow key={credit._id}>
                  <TableCell>{credit.value}</TableCell>
                  <TableCell>{credit.label}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => handleDelete(credit._id)}
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
    </div>
  );
} 