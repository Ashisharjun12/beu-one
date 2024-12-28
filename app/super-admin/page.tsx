"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Shield,
  Settings,
  Database,
  Activity,
  BarChart,
  Lock,
  Search
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SuperAdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalNotes: 0,
    totalPapers: 0
  });
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'super_admin'>('all');
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (session?.user?.role !== 'super_admin') {
      router.push('/');
      return;
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/super-admin/users'),
        fetch('/api/super-admin/stats')
      ]);

      if (!usersRes.ok || !statsRes.ok) throw new Error('Failed to fetch data');

      const [usersData, statsData] = await Promise.all([
        usersRes.json(),
        statsRes.json()
      ]);

      setUsers(usersData);
      setStats(statsData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/super-admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) throw new Error('Failed to update role');

      const updatedUser = await response.json();
      setUsers(users.map(user => 
        user._id === updatedUser._id ? updatedUser : user
      ));

      toast({
        title: "Success",
        description: `User role updated to ${newRole}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesSearch = 
      searchQuery === "" || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesRole && matchesSearch;
  });

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
          <p className="text-gray-500">Manage your entire platform</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          Super Admin
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAdmins}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Notes</CardTitle>
            <Database className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalNotes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Papers</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPapers}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4">
            <CardTitle>User Management</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-full"
                />
              </div>
              <Select
                value={roleFilter}
                onValueChange={(value: 'all' | 'user' | 'admin' | 'super_admin') => setRoleFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">Users</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                  <SelectItem value="super_admin">Super Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={
                      user.role === 'super_admin' 
                        ? 'destructive' 
                        : user.role === 'admin' 
                          ? 'default' 
                          : 'secondary'
                    }>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRoleChange(
                        user._id, 
                        user.role === 'admin' ? 'user' : 'admin'
                      )}
                      disabled={user.role === 'super_admin'}
                    >
                      {user.role === 'admin' ? (
                        <Lock className="h-4 w-4 text-red-500" />
                      ) : (
                        <Shield className="h-4 w-4 text-green-500" />
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                    No users found with selected role
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 