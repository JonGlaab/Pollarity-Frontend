import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Plus, Trash2, GripVertical } from 'lucide-react';

export function CreateSurvey({ onCreate, onSaveDraft }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [editingQuestion, setEditingQuestion] = useState({
    type: 'multiple-choice',
    question: '',
    options: [''],
    required: true,
  });

  const handleAddQuestion = () => {
    if (!editingQuestion.question) return;

    const newQuestion = {
      id: `q${Date.now()}`,
      type: editingQuestion.type || 'multiple-choice',
      question: editingQuestion.question,
      options: editingQuestion.options?.filter(o => o.trim() !== ''),
      required: editingQuestion.required || false,
    };

    setQuestions([...questions, newQuestion]);
    setEditingQuestion({
      type: 'multiple-choice',
      question: '',
      options: [''],
      required: true,
    });
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreateSurvey = () => {
    if (!title || questions.length === 0) return;

    const survey = {
      id: Date.now().toString(),
      title,
      description,
      questions,
      responses: 0,
    };

    onCreate(survey);
    
    // Reset form
    setTitle('');
    setDescription('');
    setQuestions([]);
  };

  const handleSaveDraft = () => {
    if (!title || questions.length === 0) return;

    const survey = {
      id: Date.now().toString(),
      title,
      description,
      questions,
    };

    onSaveDraft?.(survey);
    
    // Reset form
    setTitle('');
    setDescription('');
    setQuestions([]);
  };

  const needsOptions = editingQuestion.type === 'multiple-choice' || editingQuestion.type === 'checkbox';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Survey Details */}
      <Card>
        <CardHeader>
          <CardTitle>Survey Details</CardTitle>
          <CardDescription>Basic information about your survey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Survey Title</Label>
            <Input
              id="title"
              placeholder="e.g., Customer Satisfaction Survey"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Briefly describe the purpose of this survey"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Questions List */}
      {questions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Questions ({questions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border"
              >
                <GripVertical className="size-5 text-gray-400 mt-1" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <p className="flex-1">{question.question}</p>
                    {question.required && (
                      <Badge variant="secondary">Required</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{question.type}</Badge>
                    {question.options && (
                      <span className="text-gray-600">{question.options.length} options</span>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveQuestion(index)}
                >
                  <Trash2 className="size-4 text-red-600" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Question */}
      <Card>
        <CardHeader>
          <CardTitle>Add Question</CardTitle>
          <CardDescription>Create a new question for your survey</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-text">Question</Label>
            <Input
              id="question-text"
              placeholder="Enter your question"
              value={editingQuestion.question}
              onChange={(e) =>
                setEditingQuestion({ ...editingQuestion, question: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="question-type">Question Type</Label>
              <Select
                value={editingQuestion.type}
                onValueChange={(value) =>
                  setEditingQuestion({ 
                    ...editingQuestion, 
                    type: value,
                    options: value === 'multiple-choice' || value === 'checkbox' ? [''] : undefined
                  })
                }
              >
                <SelectTrigger id="question-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="rating">Rating (1-5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="required">Required Question</Label>
              <Switch
                id="required"
                checked={editingQuestion.required}
                onCheckedChange={(checked) =>
                  setEditingQuestion({ ...editingQuestion, required: checked })
                }
              />
            </div>
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label>Options</Label>
              {editingQuestion.options?.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...(editingQuestion.options || [])];
                      newOptions[index] = e.target.value;
                      setEditingQuestion({ ...editingQuestion, options: newOptions });
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const newOptions = editingQuestion.options?.filter((_, i) => i !== index);
                      setEditingQuestion({ ...editingQuestion, options: newOptions });
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setEditingQuestion({
                    ...editingQuestion,
                    options: [...(editingQuestion.options || []), ''],
                  })
                }
              >
                <Plus className="size-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleAddQuestion} 
            disabled={!editingQuestion.question}
          >
            <Plus className="size-4 mr-2" />
            Add Question
          </Button>
        </CardFooter>
      </Card>

      {/* Create Survey Button */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-900">Ready to create your survey?</p>
              <p className="text-gray-600">
                {questions.length} question{questions.length !== 1 ? 's' : ''} added
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSaveDraft}
                disabled={!title || questions.length === 0}
                variant="outline"
              >
                Save as Draft
              </Button>
              <Button
                onClick={handleCreateSurvey}
                disabled={!title || questions.length === 0}
                size="lg"
              >
                Publish Survey
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}