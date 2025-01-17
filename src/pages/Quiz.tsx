import React, { useState, useEffect } from 'react';
import { Button, Container, Row, Col, ProgressBar, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Question } from '../types/Question';
import QuestionCard from '../components/QuestionCard';
import questionService from '../services/questionService';
import userService from '../services/userService';

interface UserAnswer {
  QuestionId: number;
  Answer: string;
  QuestionType: string;
}

interface QuizResult {
  Email: string | null;
  Answers: UserAnswer[];
}

const TOTAL_QUESTIONS = 10;

const Quiz: React.FC = () => {
  const [questionId, setQuestionId] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult>({
    Email: localStorage.getItem('quizEmail'),
    Answers: [],
  });
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizResult.Email) {
      navigate('/'); // Perkeliam į pagrindinį puslapį
    }
  }, [quizResult.Email, navigate]);

  // Fetch a question by its ID
  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const question = await questionService.getQuestionById(questionId);
        setCurrentQuestion(question);
        setTimeLeft(30); // Reset timer for new question
        setTimerActive(true);
      } catch (error) {
        console.error('Klaida gaunant klausimus', error);
      }
    };

    if (questionId <= TOTAL_QUESTIONS) {
      fetchQuestion();
    } else {
      setQuizCompleted(true);
      setCurrentQuestion(null);
    }
  }, [questionId]);

  // Handle answer changes
  const handleAnswerChange = (answer: string) => {
    if (currentQuestion) {
      setQuizResult((prevResult) => ({
        ...prevResult,
        Answers: [
          ...prevResult.Answers.filter((a) => a.QuestionId !== currentQuestion.id),
          {
            QuestionId: currentQuestion.id,
            Answer: answer,
            QuestionType: currentQuestion.type,
          },
        ],
      }));
    }
  };

  // Handle moving to the next question or completing the quiz
  const handleNextQuestion = () => {
    if (currentQuestion) {
      const currentAnswer = quizResult.Answers.find((a) => a.QuestionId === currentQuestion.id);
      if (!currentAnswer) {
        setQuizResult((prevResult) => ({
          ...prevResult,
          Answers: [
            ...prevResult.Answers,
            {
              QuestionId: currentQuestion.id,
              Answer: '',
              QuestionType: currentQuestion.type,
            },
          ],
        }));
      }
    }

    if (questionId < TOTAL_QUESTIONS) {
      setQuestionId((prevId) => prevId + 1);
      setTimerActive(true);
    } else {
      setQuizCompleted(true);
    }
  };

  // Countdown timer logic
  useEffect(() => {
    let timerInterval: number;

    if (timerActive && timeLeft > 0) {
      timerInterval = window.setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    }

    if (timeLeft === 0) {
      handleNextQuestion();
    }

    return () => clearInterval(timerInterval);
  }, [timeLeft, timerActive]);

  // Handle quiz completion
  useEffect(() => {
    const submitResults = async () => {
      try {
        const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        existingResults.push(quizResult);
        localStorage.setItem('quizResults', JSON.stringify(existingResults));

        await userService.postScore(quizResult); // Wait for the server to save results
        navigate('/results'); // Navigate to results page
      } catch (error) {
        console.error('Klaida įkeliant rezultatus:', error);
      }
    };

    if (quizCompleted) {
      submitResults();
    }
  }, [quizCompleted, quizResult, navigate]);

  // Show loading message if the question is not yet loaded
  if (!currentQuestion) {
    return <div>Loading question...</div>;
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card className="shadow-lg quiz">
            <Card.Body>
              <h3 className="text-center mb-4">
                {questionId} iš {TOTAL_QUESTIONS}
              </h3>
              <ProgressBar
                now={timeLeft * 3.33}
                max={100}
                variant={timeLeft <= 10 ? 'danger' : 'success'}
                className="mt-2 mb-4"
                style={{ height: '30px' }}
              />

              <QuestionCard question={currentQuestion} onAnswerChange={handleAnswerChange} />

              <div className="text-center mt-4">
                <Button
                  onClick={handleNextQuestion}
                  variant="primary"
                  size="lg"
                  disabled={timeLeft === 0}
                >
                  {questionId < TOTAL_QUESTIONS ? 'Sekantis klausimas' : 'Pateikti atsakymus'}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Quiz;
