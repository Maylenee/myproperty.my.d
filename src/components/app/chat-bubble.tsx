"use client";

import { MessageCircle, X, Bot, Loader2 } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useChat } from "@/lib/chat-store";

export function ChatBubble() {
  const { state, toggleChat, openChat } = useChat();

  return (
    <>
      <Button
        variant="default"
        size="icon"
        className="fixed bottom-6 right-6 z-50 lg:hidden rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        onClick={toggleChat}
        aria-label={state.isOpen ? "Tutup chat" : "Buka chat AI"}
        aria-expanded={state.isOpen}
      >
        {state.isOpen ? <X className="size-5" /> : <MessageCircle className="size-5" />}
      </Button>

      <Button
        variant="default"
        size="icon"
        className="hidden fixed bottom-6 right-6 z-50 lg:flex rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all duration-200 hover:scale-105"
        onClick={openChat}
        aria-label="Buka chat AI"
      >
        <Bot className="size-5" />
      </Button>

      {state.isOpen && <ChatDialog />}
    </>
  );
}

function ChatDialog() {
  const { state, sendMessage, closeChat, clearHistory } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !state.isLoading) {
      sendMessage(inputValue);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-full max-w-sm lg:max-w-md animate-slide-up"
      role="dialog"
      aria-label="Chat AI MyProperty"
      aria-modal="true"
    >
      <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
              <Bot className="size-4" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Asisten AI MyProperty</p>
              <p className="text-xs text-muted-foreground">Siap bantu seputar properti</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setShowClearConfirm(true)}
              aria-label="Hapus riwayat chat"
            >
              <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={closeChat}
              aria-label="Tutup chat"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <ScrollArea
          className="h-[calc(100vh-200px)] max-h-[500px] min-h-[300px] p-4"
          ref={scrollAreaRef}
        >
          <div className="flex flex-col gap-3">
            {state.messages.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex gap-2", msg.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5",
                    msg.role === "user"
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-secondary text-secondary-foreground",
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  <p
                    className={cn(
                      "mt-1 text-[10px] text-right opacity-70",
                      msg.role === "user"
                        ? "text-primary-foreground/70"
                        : "text-secondary-foreground/70",
                    )}
                  >
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
                {msg.role === "assistant" && (
                  <div className="grid size-6 place-items-center shrink-0 rounded-full bg-primary text-primary-foreground">
                    <Bot className="size-3" />
                  </div>
                )}
                {msg.role === "user" && (
                  <div className="grid size-6 place-items-center shrink-0 rounded-full bg-secondary text-secondary-foreground">
                    <svg className="size-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {state.isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="grid size-6 place-items-center shrink-0 rounded-full bg-primary text-primary-foreground">
                  <Bot className="size-3" />
                </div>
                <div className="rounded-2xl rounded-bl-md bg-secondary p-4">
                  <div className="flex gap-1">
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="border-t border-border bg-background p-3">
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan soal properti, listing, fitur..."
              className="flex-1 min-h-[44px] text-sm"
              disabled={state.isLoading}
              aria-label="Pesan ke AI"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-full"
              disabled={!inputValue.trim() || state.isLoading}
              aria-label="Kirim pesan"
            >
              {state.isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            AI hanya menjawab seputar MyProperty • Data tersimpan lokal di browser
          </p>
        </form>
      </div>

      {showClearConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold">Hapus riwayat chat?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Semua percakapan akan dihapus dan tidak bisa dikembalikan.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowClearConfirm(false)}
              >
                Batal
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  clearHistory();
                  setShowClearConfirm(false);
                }}
              >
                Hapus
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatBubbleDesktop() {
  const { state, openChat } = useChat();

  return (
    <Button
      variant="default"
      size="icon"
      className="hidden lg:flex rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/90 transition-all duration-200 hover:scale-105"
      onClick={openChat}
      aria-label="Buka chat AI"
    >
      <Bot className="size-5" />
    </Button>
  );
}
