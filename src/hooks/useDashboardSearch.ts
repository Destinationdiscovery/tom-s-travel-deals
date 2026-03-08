import { useState, useRef, useCallback } from "react";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
};

const SEARCH_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-search`;

export function useDashboardSearch() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(async (input: string) => {
    const userMsg: ChatMessage = { role: "user", content: input };
    const history = [...messages, userMsg];
    setMessages(history);
    setIsStreaming(true);

    // Only send role+content for the API
    const apiMessages = history.map(({ role, content }) => ({ role, content }));

    let assistantSoFar = "";
    let citations: string[] = [];

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch(SEARCH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.text();
        throw new Error(err || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const upsert = () => {
        const msg: ChatMessage = { role: "assistant", content: assistantSoFar, citations: citations.length ? citations : undefined };
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? msg : m));
          }
          return [...prev, msg];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.citations) {
              citations = parsed.citations;
              upsert();
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantSoFar += content;
              upsert();
            }
          } catch {
            // partial JSON, ignore
          }
        }
      }
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("Dashboard search error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${e.message || "Something went wrong. Please try again."}` },
      ]);
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [messages]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setIsStreaming(false);
  }, []);

  return { messages, isStreaming, send, stop, clear };
}
