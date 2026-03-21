import { useState, useRef, useEffect } from "react";
import { Search, Send, Square, Trash2, ExternalLink, Bot, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useDashboardSearch, type ChatMessage } from "@/hooks/useDashboardSearch";

const DashboardSearchChat = () => {
  const { messages, isStreaming, send, stop, clear } = useDashboardSearch();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const q = input.trim();
    if (!q || isStreaming) return;
    setInput("");
    send(q);
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Search className="h-4 w-4 text-primary" />
            </div>
            Travel Research
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clear} className="gap-1 text-xs text-muted-foreground">
              <Trash2 className="h-3 w-3" /> Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Messages */}
        {messages.length > 0 && (
          <ScrollArea className="h-[400px] pr-2">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} msg={msg} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Bot className="h-4 w-4 animate-pulse" />
                  <span className="animate-pulse">Searching…</span>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>
        )}

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="text-center py-6 space-y-2">
            <Search className="h-8 w-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm text-muted-foreground">
              Search for resorts, packages, flights, ask follow-ups like a conversation.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-3">
              {["Top 5 all-inclusives in Punta Cana", "Family resort Riviera Maya under $3000", "Best cruise deals Caribbean May 2026"].map((q) => (
                <button
                  key={q}
                  onClick={() => { setInput(q); }}
                  className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about resorts, pricing, packages…"
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <Button variant="destructive" size="icon" onClick={stop}>
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSend} disabled={!input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex items-start gap-2 max-w-[85%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
            {msg.content}
          </div>
          <div className="p-1 rounded-full bg-primary/10 shrink-0 mt-0.5">
            <User className="h-3.5 w-3.5 text-primary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start gap-2 max-w-[95%]">
        <div className="p-1 rounded-full bg-muted shrink-0 mt-0.5">
          <Bot className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm prose prose-sm dark:prose-invert max-w-none prose-table:text-xs prose-th:px-2 prose-td:px-2 prose-th:py-1 prose-td:py-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
          {msg.citations && msg.citations.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-1">
              {msg.citations.map((url, i) => {
                let label: string;
                try {
                  label = new URL(url).hostname.replace("www.", "");
                } catch {
                  label = `Source ${i + 1}`;
                }
                return (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                  >
                    <ExternalLink className="h-2.5 w-2.5" />
                    {label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSearchChat;
