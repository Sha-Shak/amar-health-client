"use client";

import { ChatThread } from "@/components/chat/chat-thread";
import { History } from "lucide-react";
import Link from "next/link";

export default function ChatPage() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-5 pt-8">
        <h1 className="text-2xl font-bold">AI Assistant</h1>
        <Link
          href="/chat/history"
          aria-label="Chat history"
          className="tap-target rounded-full bg-primary-50 text-primary-700"
        >
          <History size={20} aria-hidden="true" />
        </Link>
      </div>

      <ChatThread />
    </div>
  );
}
