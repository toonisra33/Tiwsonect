import React, { useState, useEffect, useRef } from 'react';
import { Message, User } from '../types';
import { ICONS, CURRENT_USER_ID } from '../constants';
import { generateAiReply } from '../services/geminiService';

interface ChatProps {
  users: User[];
  messages: Message[];
  onSendMessage: (receiverId: string, text: string, isAiReply?: boolean) => void;
}

export const Chat: React.FC<ChatProps> = ({ users, messages, onSendMessage }) => {
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter out current user from chat list
  const chatUsers = users.filter(u => u.id !== CURRENT_USER_ID);

  const getConversation = (userId: string) => {
    return messages.filter(
      m => (m.senderId === CURRENT_USER_ID && m.receiverId === userId) || 
           (m.senderId === userId && m.receiverId === CURRENT_USER_ID)
    ).sort((a, b) => a.timestamp - b.timestamp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChatUser) scrollToBottom();
  }, [messages, activeChatUser]);

  const handleSend = async () => {
    if (!inputText.trim() || !activeChatUser) return;
    
    onSendMessage(activeChatUser.id, inputText);
    const sentText = inputText;
    setInputText('');

    // Simulate AI Reply if chatting with the AI User (u3)
    if (activeChatUser.id === 'u3') {
        setTimeout(async () => {
            const reply = await generateAiReply(sentText);
            // Pass activeChatUser.id so that App.tsx treats it as the sender when isAiReply is true
            onSendMessage(activeChatUser.id, reply, true); 
        }, 1500);
    }
  };

  if (activeChatUser) {
    const conversation = getConversation(activeChatUser.id);
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] bg-white">
        {/* Header */}
        <div className="flex items-center p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <button onClick={() => setActiveChatUser(null)} className="mr-3 text-gray-600">
            &larr; กลับ
          </button>
          <div className="relative">
             <img src={activeChatUser.avatar} alt={activeChatUser.name} className="w-10 h-10 rounded-full" />
             {activeChatUser.isOnline && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
          </div>
          <div className="ml-3">
            <h3 className="font-semibold">{activeChatUser.name}</h3>
            <p className="text-xs text-green-600">{activeChatUser.isOnline ? 'ใช้งานอยู่' : 'ออฟไลน์'}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
          {conversation.map(msg => {
            const isMe = msg.senderId === CURRENT_USER_ID;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                  isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 bg-white border-t border-gray-200 flex items-center space-x-2">
          <button className="text-gray-400 p-2 rounded-full hover:bg-gray-100">{ICONS.Add}</button>
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="พิมพ์ข้อความ..."
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="text-blue-600 p-2 rounded-full hover:bg-blue-50 disabled:opacity-50"
          >
            {ICONS.Send}
          </button>
        </div>
      </div>
    );
  }

  // Chat List
  return (
    <div className="h-full bg-white pb-20">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">ข้อความ</h1>
        <div className="mt-4 relative">
            <span className="absolute left-3 top-2.5 text-gray-400">{ICONS.Search}</span>
            <input type="text" placeholder="ค้นหาเพื่อน..." className="w-full bg-gray-100 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-none" />
        </div>
      </div>
      
      <div className="overflow-y-auto">
        {chatUsers.map(user => {
            const conv = getConversation(user.id);
            const lastMsg = conv.length > 0 ? conv[conv.length - 1].text : 'เริ่มการสนทนา';
            
            return (
                <div 
                    key={user.id} 
                    onClick={() => setActiveChatUser(user)}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-50 transition-colors"
                >
                    <div className="relative">
                        <img src={user.avatar} alt={user.name} className="w-14 h-14 rounded-full object-cover" />
                        {user.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>}
                    </div>
                    <div className="ml-4 flex-1">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <span className="text-xs text-gray-400">10:30</span>
                        </div>
                        <p className="text-sm text-gray-500 truncate mt-1">{lastMsg}</p>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};