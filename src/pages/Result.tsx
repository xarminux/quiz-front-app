import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import userService from '../services/userService';

interface UserScore {
  email: string;
  score: number;
  date: string;
}

const Results: React.FC = () => {
  const navigate = useNavigate();
  const [scores, setScores] = useState<UserScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const data = await userService.getAllScores();
        setScores(data);
      } catch (err) {
        setError('Klaida gaunant rezultatus');
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const getMedalStyle = (index: number) => {
    switch (index) {
      case 0:
        return { backgroundColor: 'gold', color: 'black' }; // Auksinė
      case 1:
        return { backgroundColor: 'silver', color: 'black' }; // Sidabrinė
      case 2:
        return { backgroundColor: '#cd7f32', color: 'white' }; // Bronzos spalva
      default:
        return {};
    }
  };

  if (loading) {
    return (
      <Container className="mt-5 text-center">
        <p>Loading...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5 text-center">
        <p>{error}</p>
        <Button variant="primary" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Container>
    );
  }

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg">
            <Card.Body>
              <h1 className="text-center mb-4">Rezultatai</h1>
              {scores.length === 0 ? (
                <p className="text-center">Nėra Rezultatų</p>
              ) : (
                scores.map((score, index) => (
                  <Card key={index} className="mb-3" style={getMedalStyle(index)}>
                    <Card.Body>
                      <Card.Title>{index + 1}</Card.Title>
                      <Card.Text>El. paštas: {score.email}</Card.Text>
                      <Card.Text>Taškai: {score.score}</Card.Text>
                      <Card.Text>Data: {new Date(score.date).toLocaleDateString()}</Card.Text>
                    </Card.Body>
                  </Card>
                ))
              )}
              <div className="text-center mt-4">
                <Button variant="primary" onClick={() => navigate('/')}>
                  Grįžti į pagrindinį
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Results;
