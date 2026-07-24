"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Mail, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteMessage, markMessageRead } from "./actions";
import type { ContactMessage } from "@/lib/types";

export function MessageList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleRead(message: ContactMessage) {
    setPendingId(message.id);
    const result = await markMessageRead(message.id, !message.is_read);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    router.refresh();
  }

  async function remove(id: string) {
    setPendingId(id);
    const result = await deleteMessage(id);
    setPendingId(null);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Message deleted.");
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <p className="rounded-2xl border border-border/60 bg-card p-8 text-center text-muted-foreground">
        No messages yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => (
        <div
          key={message.id}
          className="rounded-2xl border border-border/60 bg-card p-5"
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="font-medium">{message.name}</p>
              {!message.is_read && (
                <Badge className="rounded-full bg-brand/15 text-brand hover:bg-brand/15">New</Badge>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-muted-foreground">
            <a href={`mailto:${message.email}`} className="hover:text-brand">
              {message.email}
            </a>
          </p>
          {message.subject && <p className="mt-1 text-sm font-medium">{message.subject}</p>}
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
            {message.message}
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pendingId === message.id}
              onClick={() => toggleRead(message)}
            >
              {pendingId === message.id ? (
                <Loader2 className="size-4 animate-spin" />
              ) : message.is_read ? (
                <Mail className="size-4" />
              ) : (
                <MailOpen className="size-4" />
              )}
              Mark as {message.is_read ? "Unread" : "Read"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pendingId === message.id}
              onClick={() => remove(message.id)}
            >
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
