import React from 'react';
import { Message, MessageRole } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isModel = message.role === MessageRole.MODEL;

  const wrapperClasses = `flex items-start gap-3 ${isModel ? 'justify-start' : 'justify-end'}`;
  const bubbleClasses = `max-w-xl p-4 rounded-2xl shadow-md ${
    isModel
      ? 'bg-gray-700 text-gray-200 rounded-tl-none'
      : 'bg-blue-700 text-white rounded-br-none'
  }`;

  const Icon = () => {
    if (isModel) {
      return (
        <div className="w-10 h-10 bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-blue-600">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M12 11v9" /><path d="M18 11a4 4 0 1 1-8 0" /><path d="M6 11a4 4 0 1 0 8 0" /></svg>
        </div>
      );
    }
    return (
       <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
       </div>
    );
  };
  
  return (
    <div className={wrapperClasses}>
      {isModel && <Icon />}
      <div className={bubbleClasses}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {!isModel && <Icon />}
    </div>
  );
};

export default ChatMessage;
