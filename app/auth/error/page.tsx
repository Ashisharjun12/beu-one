"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Suspense } from "react";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center px-4">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Authentication Error
      </h1>
      <p className="text-gray-600 mb-6">
        {error === "OAuthAccountNotLinked"
          ? "This email is already associated with another account. Please sign in with the correct provider."
          : "An error occurred during authentication. Please try again."}
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/login">Try Again</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  );
}

export default function AuthError() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
} 