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

interface Year {
  _id: string;
  value: number;
  label: string;
}

export default function YearsPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [newYear, setNewYear] = useState({
    value: 1,
    label: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchYears();
  }, []);

  const fetchYears = async () => {
    try {
      const response = await fetch("/api/admin/academic/years");
      if (!response.ok) throw new Error("Failed to fetch years");
      const data = await response.json();
      setYears(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch years",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/academic/years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newYear),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      setYears([...years, data]);
      setNewYear({ value: 1, label: "" });
      
      toast({
        title: "Success",
        description: "Year created successfully",
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
      const response = await fetch(`/api/admin/academic/years?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      setYears(years.filter(year => year._id !== id));
      
      toast({
        title: "Success",
        description: "Year deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete year",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Academic Years</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add Academic Year</CardTitle>
          <CardDescription>Create a new academic year</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Year Value</Label>
                <Input
                  id="value"
                  type="number"
                  min={1}
                  max={4}
                  value={newYear.value}
                  onChange={(e) => setNewYear({ ...newYear, value: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  value={newYear.label}
                  onChange={(e) => setNewYear({ ...newYear, label: e.target.value })}
                  placeholder="e.g., First Year"
                  required
                />
              </div>
            </div>
            <Button type="submit">
              <Plus className="w-4 h-4 mr-2" />
              Add Year
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Years</CardTitle>
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
              {years.map((year) => (
                <TableRow key={year._id}>
                  <TableCell>{year.value}</TableCell>
                  <TableCell>{year.label}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500"
                      onClick={() => handleDelete(year._id)}
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