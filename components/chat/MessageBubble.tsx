import { Message } from '@/types';
import { formatRelativeTime, getAvatarFallback } from '@/lib/utils';

interface MessageBubbleProps {
  message: Message;
  isSelf: boolean;
}

export default function MessageBubble({ message, isSelf }: MessageBubbleProps) {
  return (
    <div
      className="flex gap-3 items-end animate-fade-in"
      style={{ flexDirection: isSelf ? 'row-reverse' : 'row' }}
    >
      {!isSelf && (
        <div
          className="avatar flex-shrink-0"
          style={{ width: '2rem', height: '2rem', fontSize: '0.75rem' }}
        >
          {getAvatarFallback(message.sender?.display_name || message.sender?.username)}
        </div>
      )}
      <div
        className="flex flex-col"
        style={{ alignItems: isSelf ? 'flex-end' : 'flex-start' }}
      >
        {!isSelf && (
          <span className="text-xs text-slate-500 mb-1 ml-1">
            {message.sender?.display_name || message.sender?.username}
          </span>
        )}
        <div className={isSelf ? 'message-bubble-self' : 'message-bubble-other'}>
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        <span className="text-xs text-slate-600 mt-1 mx-1">
          {formatRelativeTime(message.created_at)}
        </span>
      </div>
    </div>
  );
}
