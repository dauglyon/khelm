import { useState, useCallback, Component, type ReactNode, type ErrorInfo } from 'react';
import { Card as DesignSystemCard } from '@/common/components/Card';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';
import { ChatPanel } from './ChatPanel';
import { useCardData, useCardStreamingContent, useCardStore, useChatState } from './store';
import { cardTypeToInputType } from './types';
import {
  cardBody,
  shimmerOverlay,
  cardWithChat,
  cardMainContent,
  errorBoundaryFallback,
} from './Card.css';

// ---------------------------------------------------------------------------
// Error boundary for card body
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class CardErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Card body error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Card component
// ---------------------------------------------------------------------------

export interface CardComponentProps {
  cardId: string;
}

export function CardComponent({ cardId }: CardComponentProps) {
  const card = useCardData(cardId);
  const streamingContent = useCardStreamingContent(cardId);
  const chatState = useChatState(cardId);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const store = useCardStore;

  const handleShortnameChange = useCallback(
    (newName: string) => {
      store.getState().updateCard(cardId, { shortname: newName });
    },
    [cardId, store]
  );

  const handleOpenChat = useCallback(() => {
    setIsChatOpen(true);
    store.getState().initChat(cardId);
  }, [cardId, store]);

  const handleCloseChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (!card) return;
    const newId = crypto.randomUUID();
    store.getState().setCard({
      ...card,
      id: newId,
      shortname: `${card.shortname} (copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }, [card, store]);

  const handlePin = useCallback(() => {
    // Pin is a no-op for now; feature handled by workspace
  }, []);

  const handleDelete = useCallback(() => {
    store.getState().removeCard(cardId);
  }, [cardId, store]);

  if (!card) return null;

  const inputType = cardTypeToInputType(card.type);

  return (
    <DesignSystemCard inputType={inputType} data-card-id={cardId}>
      <div className={isChatOpen ? cardWithChat : undefined}>
        <div className={cardMainContent}>
          <CardHeader
            cardId={card.id}
            shortname={card.shortname}
            type={card.type}
            status={card.status}
            onShortnameChange={handleShortnameChange}
            onOpenChat={handleOpenChat}
            onCopy={handleCopy}
            onPin={handlePin}
            onDelete={handleDelete}
          />
          <div className={cardBody}>
            {card.status === 'thinking' && (
              <div className={shimmerOverlay} data-testid="shimmer-overlay" />
            )}
            <CardErrorBoundary
              fallback={
                <div className={errorBoundaryFallback}>
                  Something went wrong rendering this card.
                </div>
              }
            >
              <CardBody
                type={card.type}
                content={card.content}
                result={card.result}
                status={card.status}
                streamingContent={streamingContent}
                cardId={card.id}
              />
            </CardErrorBoundary>
          </div>
        </div>
        {isChatOpen && chatState && (
          <ChatPanel
            cardId={card.id}
            messages={chatState.messages}
            isStreaming={chatState.isStreaming}
            streamingContent={chatState.streamingContent}
            error={chatState.error}
            onSendMessage={() => {}}
            onAbort={() => {}}
            onRetry={() => {}}
            onClose={handleCloseChat}
          />
        )}
      </div>
    </DesignSystemCard>
  );
}
