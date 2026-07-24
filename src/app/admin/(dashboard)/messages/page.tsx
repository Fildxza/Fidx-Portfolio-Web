import { createClient } from "@/lib/supabase/server";
import { MessageList } from "./message-list";
import type { ContactMessage } from "@/lib/types";

export default async function AdminMessagesPage() {
  const supabase = await createClient();

  let messages: ContactMessage[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    messages = (data as ContactMessage[]) ?? [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Submissions from your contact form.
        </p>
      </div>
      <MessageList messages={messages} />
    </div>
  );
}
