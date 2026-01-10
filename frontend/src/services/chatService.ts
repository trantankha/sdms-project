import { api } from '@/services/api';

export interface ChatMessage {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export interface SuggestedQuestion {
    id: number;
    text: string;
}

export const chatService = {
    async sendMessage(message: string): Promise<string> {
        const response = await api.post('/api/v1/chat/', { message });
        return response.data.response;
    },

    async getSuggestedQuestions(): Promise<SuggestedQuestion[]> {
        const response = await api.get('/api/v1/chat/suggested');
        return response.data;
    }
};
