import React, { useState, useEffect } from 'react';
import { Card, Form, Container, Row, Col } from 'react-bootstrap';
import { Question } from '../types/Question';

interface QuestionCardProps {
  question: Question;
  onAnswerChange: (answer: string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onAnswerChange }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const options = question.options?.split(',').map(option => option.trim()) || [];

  useEffect(() => {
    setSelectedAnswer('');
  }, [question]);

  const handleAnswerChange = (answer: string) => {
    setSelectedAnswer(answer);
    onAnswerChange(answer);
  };

  const renderOptions = () => {
    switch (question.type) {
      case "Radio":
      case "Checkbox":
        return (
          <Form>
            {options.map((option, index) => (
              <Form.Check
                key={index}
                type={question.type.toLowerCase() as 'radio' | 'checkbox'}
                id={`question-${question.id}-option-${index}`}
                label={option}
                checked={question.type === "Radio" ? selectedAnswer === option : selectedAnswer.includes(option)}
                onChange={() => handleOptionChange(option)}
                className="mb-3"
              />
            ))}
          </Form>
        );
      case "Textbox":
        return (
          <Form.Group className="mb-3">
            <Form.Control
              type="text"
              value={selectedAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder="Jūsų atsakymas"
              className="text-center py-2"
            />
          </Form.Group>
        );
      default:
        return null;
    }
  };

  const handleOptionChange = (option: string) => {
    if (question.type === "Radio") {
      handleAnswerChange(option);
    } else {
      const updatedAnswer = selectedAnswer.includes(option)
        ? selectedAnswer.split(',').filter(a => a !== option).join(',')
        : [...selectedAnswer.split(',').filter(Boolean), option].join(',');
      handleAnswerChange(updatedAnswer);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col xs={12} md={8} lg={6}>
          <Card className="shadow-lg rounded-lg border-light p-4 bg-light">
            <Card.Body>
              <Card.Title className="text-primary font-weight-bold text-center mb-4">
                {question.title}
              </Card.Title>
              {renderOptions()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default QuestionCard;

