import { useEffect, useRef } from 'react';
import type { GameState } from '../../engine';
import { Panel } from './Panel';

interface ChatFeedProps {
  state: GameState;
}

export const ChatFeed = ({ state }: ChatFeedProps) => {
  const scroller = useRef<HTMLDivElement>(null);
  const latest = state.log[0];

  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [latest?.id]);

  return (
    <Panel id="panel-chat" title="Chat da empresa" className="chat">
      <div ref={scroller} className="chat-log" tabIndex={0} aria-label="Feed de mensagens da empresa">
        {state.log.map((entry) => (
          <article key={entry.id} className="chat-item">
            <header className="chat-meta">
              <span className="chat-author">{entry.author}</span>
              <span className="chat-channel">{entry.channel}</span>
              <time className="num" dateTime={`D${entry.day}`}>
                D{entry.day}
              </time>
            </header>
            <p>{entry.text}</p>
          </article>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {latest ? `${latest.author} em ${latest.channel}: ${latest.text}` : ''}
      </p>
    </Panel>
  );
};
