
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, BookOpen, Clock, Star } from "lucide-react";
import FormationQuiz from './FormationQuiz';

interface LegalKnowledge {
  category: string;
  title: string;
  content: string;
  keywords: string[];
}

interface LegalLearningModalProps {
  knowledge: LegalKnowledge;
  isOpen: boolean;
  onClose: () => void;
}

const LegalLearningModal = ({ knowledge, isOpen, onClose }: LegalLearningModalProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  const steps = [
    {
      title: "Introduction",
      content: `Bienvenue dans l'étude de ${knowledge.title}. Cette formation vous permettra de maîtriser les aspects essentiels de ce sujet juridique.`
    },
    {
      title: "Définition et cadre légal",
      content: knowledge.content
    },
    {
      title: "Points clés à retenir",
      content: `Les mots-clés importants : ${knowledge.keywords.join(', ')}`
    },
    {
      title: "Quiz de validation",
      content: "Testez vos connaissances avec ce quiz rapide."
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        // Dernière étape avant le quiz
        setShowQuiz(true);
        return;
      }
      setCurrentStep(currentStep + 1);
      setProgress(((currentStep + 1) / steps.length) * 100);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress((currentStep / steps.length) * 100);
    }
  };

  const handleQuizComplete = (passed: boolean) => {
    setQuizPassed(passed);
    setShowQuiz(false);
    if (passed) {
      setCompleted(true);
      setProgress(100);
    } else {
      // Retour au début si échec
      setCurrentStep(0);
      setProgress(0);
    }
  };

  if (showQuiz) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <FormationQuiz
            formationTitle={knowledge.title}
            onQuizComplete={handleQuizComplete}
            onBack={() => setShowQuiz(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2 text-red-900" />
            {knowledge.title}
          </DialogTitle>
          <DialogDescription>
            Formation juridique interactive - {knowledge.category}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{knowledge.category}</Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              5-10 minutes
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {!completed ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Étape {currentStep + 1}: {steps[currentStep].title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-line">{steps[currentStep].content}</p>
                </div>

                <div className="flex justify-between mt-6">
                  <Button 
                    variant="outline" 
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    Précédent
                  </Button>
                  <Button 
                    onClick={handleNext}
                    className="bg-red-900 hover:bg-red-800"
                  >
                    {currentStep === steps.length - 1 ? 'Commencer le quiz' : 'Suivant'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Formation terminée !
                </h3>
                <p className="text-green-700 mb-4">
                  Félicitations ! Vous avez terminé l'étude de {knowledge.title} et réussi l'évaluation.
                </p>
                <div className="flex items-center justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <Button onClick={onClose} className="bg-red-900 hover:bg-red-800">
                  Fermer
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LegalLearningModal;
