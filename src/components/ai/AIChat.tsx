import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import { useAI } from '@/contexts/AIContext';
import { ChatMessage } from '@/types/ai';
import EventPreview from './EventPreview';
import BookingChoices from './BookingChoices';
import TicketOptions from './TicketOptions';
import { Event } from '@/types/event';

const AIChat: React.FC = () => {
  const {
    isOpen,
    isLoading,
    messages,
    error,
    context,
    sendMessage,
    toggleChat,
    clearChat,
  } = useAI();
  
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    const message = inputMessage.trim();
    setInputMessage('');
    
    try {
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const formatMessageContent = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const handleEventClick = (event: Event) => {
    // Navigate to event detail page
    window.location.href = `/events/${event.id}`;
  };

  const handleViewAll = () => {
    // Navigate to events page to show all events
    window.location.href = '/events';
  };

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user';
    const suggestions = message.metadata?.suggestions as string[] || [];
    const eventData = message.metadata?.context as Event[] || [];
    
    // Check for booking-related actions in message metadata
    const messageAction = message.metadata?.action;
    const showBookingChoices = messageAction?.type === 'show_booking_choices';
    const showTicketOptions = messageAction?.type === 'show_ticket_options';
    
    return (
      <div
        key={message.id}
        className={`flex gap-2 sm:gap-3 p-3 sm:p-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        )}
        
        <div className={`max-w-[85%] sm:max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div
            className={`rounded-lg px-3 sm:px-4 py-2 ${
              isUser
                ? 'bg-blue-500 text-white ml-auto'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}
          >
            <div className="text-xs sm:text-sm">
              {formatMessageContent(message.content)}
            </div>
          </div>
          
          {/* Show booking choices if action type is show_booking_choices */}
          {!isUser && showBookingChoices && messageAction?.payload?.events && (
            <div className="mt-3">
              <BookingChoices 
                events={messageAction.payload.events}
                onEventSelect={(event) => {
                  console.log('Event selected for booking:', event);
                }}
              />
            </div>
          )}
          
          {/* Show ticket options if action type is show_ticket_options */}
          {!isUser && showTicketOptions && messageAction?.payload && (
            <div className="mt-3">
              <TicketOptions 
                event={messageAction.payload.event}
                ticketOptions={messageAction.payload.ticketOptions}
                eventId={messageAction.payload.eventId}
              />
            </div>
          )}
          
          {/* Show event preview if there's event data (regular events display) */}
          {!isUser && eventData && eventData.length > 0 && !showBookingChoices && !showTicketOptions && (
            <EventPreview 
              events={eventData} 
              onEventClick={handleEventClick}
              onViewAll={handleViewAll}
            />
          )}
          
          {!isUser && suggestions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1 sm:gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-2 sm:px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-1">
            {message.timestamp.toLocaleTimeString('th-TH', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
        
        {isUser && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-500 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg transition-all duration-200 flex items-center justify-center z-50"
        aria-label="เปิด/ปิด AI Chat"
      >
        {isOpen ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-x-4 bottom-16 sm:bottom-24 sm:right-6 sm:left-auto sm:w-96 max-h-[calc(100vh-8rem)] sm:max-h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-40">
          {/* Header */}
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                  AI Assistant
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  ผู้ช่วยอัจฉริยะสำหรับระบบตั๋ว
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={clearChat}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs sm:text-sm px-2 py-1"
                title="ล้างการสนทนา"
              >
                ล้าง
              </button>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                aria-label="ปิด chat"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-3 sm:p-4">
                <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3 sm:mb-4" />
                <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                  สวัสดีครับ! ฉันคือ AI Assistant
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                  ฉันสามารถช่วยคุณจัดการอีเว้นท์ ตั๋ว และอื่นๆ ในระบบได้
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['ดูอีเว้นท์', 'ดูตั๋วของฉัน', 'ช่วยเหลือ'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="px-2 sm:px-3 py-1 text-xs bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex gap-2 sm:gap-3 p-3 sm:p-4">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <Bot className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      </div>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 sm:px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                          กำลังคิด...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-3 sm:px-4 py-2 bg-red-50 border-t border-red-200 dark:bg-red-900/20 dark:border-red-800">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="พิมพ์ข้อความ..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100 disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="ส่งข้อความ"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChat;