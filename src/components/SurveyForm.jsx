import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Checkbox } from './ui/checkbox';
import { Progress } from './ui/progress';
import { CheckCircle } from 'lucide-react';

export function SurveyForm({ survey, onSubmit }) {
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const question = survey.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / survey.questions.length) * 100;

  const handleAnswer = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = () => {
    if (currentQuestion < survey.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    setTimeout(() => {
      onSubmit();
    }, 2000);
  };

  const isAnswered = answers[question.id] !== undefined && answers[question.id] !== '';
  const canProceed = !question.required || isAnswered;

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle className="size-16 text-green-600" />
            </div>
          </div>
          <h2 className="text-green-900 mb-2">Thank You!</h2>
          <p className="text-gray-600">
            Your response has been submitted successfully.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{survey.title}</CardTitle>
          <CardDescription>{survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-600">
              <span>Question {currentQuestion + 1} of {survey.questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-start gap-2">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-lg shrink-0">
              {currentQuestion + 1}
            </span>
            <span className="flex-1">{question.question}</span>
          </CardTitle>
          {question.required && (
            <CardDescription className="text-red-600">* Required</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {question.type === 'multiple-choice' && question.options && (
            <RadioGroup
              value={answers[question.id]}
              onValueChange={(value) => handleAnswer(question.id, value)}
            >
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <RadioGroupItem value={option} id={`${question.id}-${index}`} />
                  <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {question.type === 'checkbox' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => {
                const selectedOptions = answers[question.id] || [];
                const isChecked = selectedOptions.includes(option);
                
                return (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox
                      id={`${question.id}-${index}`}
                      checked={isChecked}
                      onCheckedChange={(checked) => {
                        const newOptions = checked
                          ? [...selectedOptions, option]
                          : selectedOptions.filter((o) => o !== option);
                        handleAnswer(question.id, newOptions);
                      }}
                    />
                    <Label htmlFor={`${question.id}-${index}`} className="flex-1 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                );
              })}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => handleAnswer(question.id, rating)}
                  className={`size-16 rounded-lg border-2 transition-all ${
                    answers[question.id] === rating
                      ? 'bg-blue-600 text-white border-blue-600 scale-110'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {rating}
                </button>
              ))}
            </div>
          )}

          {question.type === 'text' && (
            <Textarea
              placeholder="Type your answer here..."
              value={answers[question.id] || ''}
              onChange={(e) => handleAnswer(question.id, e.target.value)}
              rows={5}
              className="resize-none"
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            variant="outline"
          >
            Previous
          </Button>
          
          {currentQuestion < survey.questions.length - 1 ? (
            <Button 
              onClick={handleNext} 
              disabled={!canProceed}
            >
              Next
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={!canProceed}
            >
              Submit Survey
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}