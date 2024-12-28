"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import UserAccountNav from "./UserAccountNav";
import { BookOpen, FileText, GraduationCap, MessageSquare, MicVocal } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navItems = [
    {
      title: "Notes",
      href: "/notes",
      icon: BookOpen,
    },
    {
      title: "Previous Papers",
      href: "/papers",
      icon: FileText,
    },
    {
      title: "Study Mode",
      href: "/studymode",
      icon: GraduationCap,
    },
    {
      title: "Voices",
      href: "/voices",
      icon: MicVocal,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="container mx-auto px-4 h-16">
        <div className="flex h-full items-center justify-between">
          {/* Logo - Left Section */}
          <Link href="/" className="flex items-center space-x-2">
           
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              BeuOne
            </span>
          </Link>

          {/* Navigation - Middle Section */}
          <div className="hidden md:flex items-center justify-center flex-1 mx-6">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "px-4 py-2 rounded-md flex items-center space-x-2 text-sm font-medium transition-colors hover:bg-gray-100",
                      pathname === item.href 
                        ? "text-blue-600 bg-blue-50" 
                        : "text-gray-600 hover:text-gray-900"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Auth - Right Section */}
          <div className="flex items-center space-x-4">
            {session?.user ? (
              <UserAccountNav user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
                role: session.user.role
              }} />
            ) : (
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
} 