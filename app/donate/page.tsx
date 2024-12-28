"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, Copy, Heart, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import Image from 'next/image';

export default function DonatePage() {
  const { toast } = useToast();
  const upiId = "8757641329@ybl";

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    toast({
      title: "UPI ID Copied!",
      description: "The UPI ID has been copied to your clipboard.",
    });
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: 'Donate to BeyOne',
        text: `Support BeyOne by donating through UPI: ${upiId}`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <Heart className="h-16 w-16 text-rose-500 mx-auto" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Support BeuOne
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            &ldquo;When you take something from society, you have a responsibility to give back. 
            Your support helps us maintain and improve our educational resources for everyone.&rdquo;
          </p>
        </motion.div>

        {/* Donation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-2">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                
                <div className="text-center">
                  <h3 className="font-semibold text-lg">UPI Payment</h3>
                  <p className="text-sm text-gray-600">Quick and secure way to donate</p>
                </div>
              </div>

              {/* QR Code Image */}
              <div className="flex justify-center">
                <div className="relative w-48 h-48 border-4 border-blue-100 rounded-lg overflow-hidden">
                  <Image 
                    src="/donate.jpg" 
                    alt="UPI QR Code"
                    width={192}
                    height={192}
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={upiId}
                    readOnly
                    className="w-full px-4 py-3 rounded-lg border bg-gray-50 text-center font-medium"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={handleCopy}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy UPI ID
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={handleShare}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <p>Your contribution helps us:</p>
                <ul className="mt-2 space-y-1">
                  <li>• Maintain and improve our platform</li>
                  <li>• Add more educational resources</li>
                  <li>• Keep the content free for students</li>
                  <li>• Support our development team</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <blockquote className="text-lg italic text-gray-600">
            &ldquo;Education is not preparation for life; education is life itself. 
            By supporting education, you&apos;re supporting the future.&rdquo;
          </blockquote>
          <p className="mt-2 text-sm text-gray-500">
            Thank you for your generous support! ❤️
          </p>
        </motion.div>
      </div>
    </div>
  );
} 