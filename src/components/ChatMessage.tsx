import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: string;
}

export const ChatMessage = ({ message, isUser, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "flex animate-message-in opacity-0",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-2 rounded-2xl",
          isUser
            ? "bg-chatPrimary text-white rounded-br-sm"
            : "bg-chatSecondary text-chatText rounded-bl-sm"
        )}
      >
        <p className="text-sm md:text-base break-words">{message}</p>
        <p
          className={cn(
            "text-[10px] md:text-xs mt-1",
            isUser ? "text-white/70" : "text-gray-500"
          )}
        >
          {timestamp}
        </p>
      </div>
    </div>
  );
};