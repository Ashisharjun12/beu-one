"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu, BookOpen, FileText, LifeBuoy, MessageCircle, LogIn } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

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
      title: "Support",
      href: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Contact",
      href: "/contact",
      icon: MessageCircle,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600">
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-100">
            BeyOne
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-white/90",
                  pathname === item.href ? "text-white" : "text-white/70"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
          {session ? (
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Dashboard
              </Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="secondary" size="sm">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="text-white">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-white">
            <div className="flex flex-col space-y-4 mt-6">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "flex items-center space-x-2 text-sm font-medium transition-colors hover:text-blue-600",
                      pathname === item.href ? "text-blue-600" : "text-gray-600"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
              {session ? (
                <Link 
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full">Dashboard</Button>
                </Link>
              ) : (
                <Link 
                  href="/login"
                  onClick={() => setIsOpen(false)}
                >
                  <Button className="w-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
} 