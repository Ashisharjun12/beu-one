"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, FileText, GraduationCap, Users, Bot, Video } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Branch {
  _id: string;
  name: string;
  code: string;
}

// Add this array of gradient classes for random branch colors
const gradientClasses = [
  "bg-gradient-to-r from-pink-500 to-rose-500",
  "bg-gradient-to-r from-orange-400 to-pink-500",
  "bg-gradient-to-r from-green-400 to-cyan-500",
  "bg-gradient-to-r from-blue-500 to-indigo-500",
  "bg-gradient-to-r from-purple-500 to-pink-500",
  "bg-gradient-to-r from-yellow-400 to-orange-500",
  "bg-gradient-to-r from-teal-400 to-blue-500",
  "bg-gradient-to-r from-fuchsia-500 to-purple-600",
];

export default function Home() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBranches() {
      try {
        const response = await fetch('/api/branches');
        if (!response.ok) throw new Error('Failed to fetch branches');
        const data = await response.json();
        setBranches(data);
      } catch (error) {
        console.error('Error fetching branches:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBranches();
  }, []);

  // Function to get random gradient
  const getRandomGradient = () => {
    return gradientClasses[Math.floor(Math.random() * gradientClasses.length)];
  };

  return (
    <main className="flex-1">
      {/* Hero Section - Updated gradient */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600">
        <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Your Path to Academic Excellence
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Access quality study materials, previous year papers, and comprehensive notes to excel in your studies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/notes">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
                  Explore Notes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/papers">
                <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                  Previous Papers
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Updated cards */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Why Choose BeyOne?
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-white to-blue-50 border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">AI Assistant</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Get instant help with your studies from our AI chatbot.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-purple-50 border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">Video Lectures</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Learn through curated video content and tutorials.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-green-50 border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="bg-gradient-to-br from-green-500 to-teal-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">Study Mode</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Create personalized study sessions with notes and videos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-orange-50 border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">Quality Notes</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Access comprehensive study materials curated by experts.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-rose-50 border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="bg-gradient-to-br from-rose-500 to-pink-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">Previous Papers</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Practice with previous year question papers.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-white to-cyan-50 border-none shadow-lg hover:shadow-xl transition-all">
              <CardContent className="p-4 md:p-6">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-500 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-base md:text-xl font-semibold mb-2">Community</h3>
                <p className="text-sm md:text-base text-gray-600">
                  Join a community of learners and share knowledge.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Branches Section - Random gradients */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Available Branches
          </h2>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-8 w-8 bg-gray-200 rounded mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-1" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {branches.map((branch) => (
                
                  <Card className="group hover:shadow-xl transition-all cursor-pointer overflow-hidden">
                    <CardContent className={cn(
                      "p-4 md:p-6 relative",
                      getRandomGradient()
                    )}>
                      <div className="absolute inset-0 bg-black/5" />
                      <div className="relative">
                        <GraduationCap className="h-6 w-6 md:h-8 md:w-8 text-white mb-3 md:mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-base md:text-lg font-semibold mb-1 text-white">{branch.name}</h3>
                        <p className="text-xs md:text-sm text-white/80">{branch.code}</p>
                      </div>
                    </CardContent>
                  </Card>
               
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Updated gradient */}
      <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Ready to Excel in Your Studies?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join BeyOne today and get access to all study materials you need to succeed.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Get Started Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
    </div>
      </section>
    </main>
  );
}
