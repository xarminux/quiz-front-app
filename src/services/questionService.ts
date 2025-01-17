import api from './api';
import { Question } from '../types/Question';

const questionService = {
    getQuestionById: async (id: number): Promise<Question> => {
        try {
            const response = await api.get<Question>(`/question/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching question by ID:', error);
            throw error;
        }
    },
};

export default questionService;
