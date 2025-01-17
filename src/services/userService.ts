import api from './api';

interface UserAnswerDTO {
    QuestionId: number;
    Answer: string;
    QuestionType: string;
}

interface QuizResultDTO {
    Email: string | null;
    Answers: UserAnswerDTO[];
}

const userService = {
    postScore: async (quiz: QuizResultDTO): Promise<any> => {
        try {
            const response = await api.post('/user', quiz); // Adjust endpoint as needed
            return response.data;
        } catch (error) {
            console.error('Error posting quiz score:', error);
            throw error;
        }
    },
    getAllScores: async (): Promise<any> => {
        try {
            const response = await api.get('/user'); // Endpoint for fetching all scores
            return response.data;
        } catch (error) {
            console.error('Error fetching all scores:', error);
            throw error;
        }
    },

};

export default userService;