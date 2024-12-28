"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Plus, Send, MessageSquare, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Voice {
  _id: string;
  content: string;
  user: {
    name: string;
    image: string;
  };
  createdAt: string;
}

export default function VoicesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchVoices();
  }, []);

  const fetchVoices = async () => {
    try {
      const response = await fetch("/api/voices");
      if (!response.ok) throw new Error("Failed to fetch voices");
      const data = await response.json();
      setVoices(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch voices",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/voices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to post voice");

      const newVoice = await response.json();
      setVoices([newVoice, ...voices]);
      setContent("");
      setIsDialogOpen(false);
      toast({
        title: "Success",
        description: "Your voice has been posted",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post voice",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Join the Conversation</h2>
            <p className="text-gray-600 mb-4">
              Sign in to share your voice and connect with others
            </p>
            <Button onClick={() => router.push('/login')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl min-h-[calc(100vh-4rem)] relative">
      {/* Page Header */}
      <div className="mb-6 sticky top-0 z-10 bg-white/80 backdrop-blur-sm py-4 -mx-4 px-4">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          Voices
        </h1>
        <p className="text-gray-600">Join the conversation with your peers</p>
      </div>

      {/* Voices Feed */}
      <ScrollArea className="h-[calc(100vh-12rem)] pr-4">
        <div className="space-y-4 pb-20">
          {voices.map((voice) => (
            <Card 
              key={voice._id} 
              className="border border-gray-100 shadow-sm hover:shadow-md transition-all bg-gradient-to-br from-white to-blue-50/30"
            >
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="border-2 border-blue-100">
                    <AvatarImage src={voice.user.image} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white">
                      {voice.user.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-blue-900">{voice.user.name}</h3>
                      <span className="text-sm text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">
                        {formatDistanceToNow(new Date(voice.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700 whitespace-pre-wrap">{voice.content}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Floating Create Button - Adjusted for mobile */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed md:bottom-8 bottom-20 left-1/2 -translate-x-1/2 md:left-8 md:translate-x-0 rounded-full w-14 h-14 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
            size="icon"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-gradient-to-br from-white to-blue-50">
          <DialogHeader>
            <DialogTitle className="text-xl bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Share Your Voice
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="min-h-[100px] resize-none border-blue-200 focus-visible:ring-blue-400"
              maxLength={500}
            />
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="border-blue-200 hover:bg-blue-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !content.trim()}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-105"
              >
                {isLoading ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 