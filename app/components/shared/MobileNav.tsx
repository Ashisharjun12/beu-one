"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookOpen, FileText, GraduationCap, Home, MessageSquare, MicVocal } from "lucide-react";

const routes = [
  {
    href: "/",
    label: "Home",
    icon: Home
  },
  {
    href: "/notes",
    label: "Notes",
    icon: BookOpen
  },
  {
    href: "/papers",
    label: "Papers",
    icon: FileText
  },
  {
    href: "/studymode",
    label: "Study",
    icon: GraduationCap
  },
  {
    href: "/voices",
    label: "Voices",
    icon: MicVocal
  }
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t md:hidden">
      <div className="flex items-center justify-around h-16">
        {routes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-2 gap-1",
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
} 