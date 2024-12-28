"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Bot, Send, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRouter } from 'next/navigation';

interface Video {
  videoId: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  videos?: Video[];
  isVideoResponse?: boolean;
}

export default function AIChatButton() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { 
        role: "assistant", 
        content: data.response,
        videos: data.videos,
        isVideoResponse: data.isVideoResponse
      }]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchVideo = (videoId: string) => {
    setIsOpen(false);
    router.push(`/videolecture?v=${videoId}`);
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            size="icon" 
            className="h-14 w-14 md:h-12 md:w-12 rounded-full shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            <Bot className="h-7 w-7 md:h-6 md:w-6 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent 
          side="right"
          className="w-full sm:w-[400px] p-0 border-l-blue-200 h-[100dvh] sm:h-screen"
        >
          <SheetHeader className="px-4 py-3 border-b bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-white" />
                <SheetTitle className="text-white">AI Study Assistant</SheetTitle>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100%-56px)]">
            <ScrollArea className="flex-1 p-4 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4 space-y-4 min-h-[60vh]">
                  <Bot className="h-12 w-12 text-blue-600" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">How can I help you?</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                      Ask me anything about your studies, papers, or any academic questions!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        {message.videos && message.isVideoResponse && (
                          <div className="mt-4 space-y-2">
                            {message.videos.map((video, idx) => (
                              <div key={video.videoId} className="bg-white rounded-lg p-2 shadow-sm">
                                <p className="font-medium text-sm">{video.title}</p>
                                <p className="text-xs text-gray-500 mb-2">{video.channelTitle}</p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="w-full"
                                  onClick={() => handleWatchVideo(video.videoId)}
                                >
                                  Watch Lecture
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2.5 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                          AI is thinking...
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            <form
              onSubmit={handleSubmit}
              className="border-t p-4 flex gap-2 items-center bg-gray-50 sticky bottom-0 w-full"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 border-gray-200 focus-visible:ring-blue-600 focus-visible:ring-offset-0"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
} 