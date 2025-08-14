
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Trophy } from "lucide-react";

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface FormationQuizProps {
  formationTitle: string;
  onQuizComplete: (passed: boolean) => void;
  onBack: () => void;
}

const FormationQuiz = ({ formationTitle, onQuizComplete, onBack }: FormationQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const questions: Question[] = [
    {
      id: "q1",
      question: "Quelle est la responsabilité des associés dans une SARL ?",
      options: [
        "Responsabilité illimitée sur leurs biens personnels",
        "Responsabilité limitée à leurs apports",
        "Aucune responsabilité",
        "Responsabilité partagée entre tous les associés"
      ],
      correctAnswer: 1
    },
    {
      id: "q2",
      question: "Quel est le capital minimum requis pour créer une SAS ?",
      options: [
        "1 000 000 FCFA minimum",
        "500 000 FCFA minimum",
        "Pas de capital minimum légal",
        "2 000 000 FCFA minimum"
      ],
      correctAnswer: 2
    },
    {
      id: "q3",
      question: "Dans une SCI, quelle est la nature de la responsabilité des associés ?",
      options: [
        "Responsabilité limitée aux apports",
        "Responsabilité illimitée et solidaire",
        "Pas de responsabilité",
        "Responsabilité limitée à 50% des dettes"
      ],
      correctAnswer: 1
    },
    {
      id: "q4",
      question: "Qui peut créer une entreprise individuelle ?",
      options: [
        "Uniquement les personnes morales",
        "Toute personne physique majeure ayant la capacité juridique",
        "Uniquement les ressortissants ivoiriens",
        "Seulement les diplômés en commerce"
      ],
      correctAnswer: 1
    }
  ];

  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateScore();
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
    setShowResults(true);
  };

  const handleFinish = () => {
    const passed = score >= Math.ceil(questions.length * 0.7); // 70% pour réussir
    onQuizComplete(passed);
  };

  if (showResults) {
    const passed = score >= Math.ceil(questions.length * 0.7);
    
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center">
            {passed ? (
              <Trophy className="h-8 w-8 text-yellow-500 mr-2" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500 mr-2" />
            )}
            Résultats de l'évaluation
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className={`text-6xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
            {score}/{questions.length}
          </div>
          
          <div className={`p-4 rounded-lg ${passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-semibold text-lg mb-2 ${passed ? 'text-green-800' : 'text-red-800'}`}>
              {passed ? 'Félicitations !' : 'Résultat insuffisant'}
            </h3>
            <p className={passed ? 'text-green-700' : 'text-red-700'}>
              {passed 
                ? `Vous avez réussi l'évaluation avec ${Math.round((score/questions.length)*100)}% de bonnes réponses.`
                : `Vous avez obtenu ${Math.round((score/questions.length)*100)}%. Il faut au moins 70% pour valider.`
              }
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-gray-800">Détail des réponses :</h4>
            {questions.map((question, index) => (
              <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="text-sm">Question {index + 1}</span>
                {selectedAnswers[index] === question.correctAnswer ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={onBack}>
              Retour
            </Button>
            <Button 
              onClick={handleFinish}
              className={passed ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            >
              {passed ? 'Valider la formation' : 'Recommencer'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Évaluation : {formationTitle}
        </CardTitle>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Question {currentQuestion + 1} sur {questions.length}</span>
          <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-red-900 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {questions[currentQuestion].question}
          </h3>
          
          <RadioGroup 
            value={selectedAnswers[currentQuestion]?.toString() || ""} 
            onValueChange={(value) => handleAnswerSelect(currentQuestion, parseInt(value))}
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded hover:bg-gray-50">
                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={onBack}
          >
            Retour
          </Button>
          
          <Button 
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestion] === undefined}
            className="bg-red-900 hover:bg-red-800"
          >
            {currentQuestion === questions.length - 1 ? 'Terminer' : 'Suivant'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FormationQuiz;
