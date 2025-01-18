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
const QUESTION_TIME = 30;

const Quiz: React.FC = () => {
  const [questionId, setQuestionId] = useState<number>(1);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult>({
    Email: localStorage.getItem('quizEmail'),
    Answers: [],
  });
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME);
  const [timerActive, setTimerActive] = useState<boolean>(true);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizResult.Email) {
      navigate('/');
    }
  }, [quizResult.Email, navigate]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const question = await questionService.getQuestionById(questionId);
        setCurrentQuestion(question);
        setTimeLeft(QUESTION_TIME);
        setTimerActive(true);
      } catch (error) {
        console.error('Error fetching question:', error);
      }
    };

    if (questionId <= TOTAL_QUESTIONS) {
      fetchQuestion();
    } else {
      setQuizCompleted(true);
      setCurrentQuestion(null);
    }
  }, [questionId]);

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

  useEffect(() => {
    const submitResults = async () => {
      try {
        const existingResults = JSON.parse(localStorage.getItem('quizResults') || '[]');
        existingResults.push(quizResult);
        localStorage.setItem('quizResults', JSON.stringify(existingResults));

        await userService.postScore(quizResult);
        navigate('/results');
      } catch (error) {
        console.error('Error submitting results:', error);
      }
    };

    if (quizCompleted) {
      submitResults();
    }
  }, [quizCompleted, quizResult, navigate]);

  if (!currentQuestion) {
    return (
      <Container className="mt-5">
        <Row className="justify-content-center">
          <Col xs={12} md={8} lg={6}>
            <Card className="text-center p-4">
              <Card.Body>
                <h3>Loading question...</h3>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
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
                now={timeLeft * (100 / QUESTION_TIME)}
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
                  {questionId < TOTAL_QUESTIONS ? 'Sekantis Klausimas' : 'Pateikti atsakymus'}
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

