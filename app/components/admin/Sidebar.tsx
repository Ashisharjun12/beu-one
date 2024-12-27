"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  Bell,
  Settings,
  BookOpen,
  GraduationCap,
  BarChart,
  MessageSquare,
  FolderTree,
  BookOpenCheck,
  Building,
  BookText,
  Video,
  Wrench,
  Calendar,
  Award,
  Clock,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isAcademicOpen, setIsAcademicOpen] = useState(false);

  return (
    <div className="w-64 bg-white border-r h-full">
      <div className="flex flex-col h-full">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Admin Dashboard
          </h2>
          <p className="text-sm text-gray-500">
            Manage your platform
          </p>
        </div>
        
        <nav className="flex-1 px-3 space-y-1">
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </Link>

          <Link
            href="/admin/branches"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/branches" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <FolderTree className="w-5 h-5" />
            Branch Management
          </Link>

          <Link
            href="/admin/users"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/users" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Users className="w-5 h-5" />
            Users
          </Link>

          <Link
            href="/admin/papers"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/papers" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <FileText className="w-5 h-5" />
            Papers
          </Link>

          <Link
            href="/admin/video-lectures"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/video-lectures" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Video className="w-5 h-5" />
            Video Lectures
          </Link>

          <Link
            href="/admin/colleges"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/colleges" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Building className="w-5 h-5" />
            Colleges
          </Link>

          <Link
            href="/admin/notes"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/notes" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <BookText className="w-5 h-5" />
            Notes
          </Link>

          <Link
            href="/admin/subjects"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === "/admin/subjects" 
                ? "bg-blue-50 text-blue-600" 
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <BookOpenCheck className="w-5 h-5" />
            Subject Management
          </Link>

          <div className="space-y-1">
            <button
              onClick={() => setIsAcademicOpen(!isAcademicOpen)}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors"
            >
              <Wrench className="w-5 h-5" />
              <span>Academic Tools</span>
              <ChevronDown 
                className={cn(
                  "w-4 h-4 ml-auto transition-transform duration-200",
                  isAcademicOpen ? "rotate-180" : ""
                )}
              />
            </button>
            <div className={cn(
              "pl-8 space-y-1 overflow-hidden transition-all duration-200",
              isAcademicOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
            )}>
              <Link
                href="/admin/academic/years"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/admin/academic/years" 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Calendar className="w-4 h-4" />
                Years
              </Link>
              <Link
                href="/admin/academic/semesters"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/admin/academic/semesters" 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Clock className="w-4 h-4" />
                Semesters
              </Link>
              <Link
                href="/admin/academic/credits"
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === "/admin/academic/credits" 
                    ? "bg-blue-50 text-blue-600" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Award className="w-4 h-4" />
                Credits
              </Link>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t">
          <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-sm">
            <p className="font-medium">Need Help?</p>
            <p className="text-xs mt-1">Check the admin documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
} 