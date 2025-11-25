import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ClipboardCheck, BarChart3, Upload, Trash2, Lock } from 'lucide-react';

export function SurveyList({ 
  surveys, 
  onTakeSurvey, 
  onViewResults, 
  isDrafts = false,
  isPastSurveys = false,
  onPublishDraft,
  onDeleteDraft,
  onEditDraft
}) {
  if (surveys.length === 0) {
    return (
      <Card>
        <CardContent className="pt-12 pb-12 text-center">
          <p className="text-gray-600">
            {isDrafts ? 'No draft surveys yet. Create one to get started!' : 
             isPastSurveys ? 'No closed surveys yet.' :
             'No surveys available at the moment.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {surveys.map((survey) => (
        <Card key={survey.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="flex-1">{survey.title}</CardTitle>
              <div className="flex flex-col gap-1">
                {survey.status === 'closed' && (
                  <Badge variant="secondary">
                    <Lock className="size-3 mr-1" />
                    Closed
                  </Badge>
                )}
                {survey.status === 'draft' && (
                  <Badge variant="secondary">
                    Draft
                  </Badge>
                )}
                {survey.responses !== undefined && (
                  <Badge variant="secondary">
                    {survey.responses || 0} responses
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>{survey.description}</CardDescription>
            {survey.createdAt && (
              <p className="text-gray-600">Created: {survey.createdAt}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-gray-600">
              <ClipboardCheck className="size-4" />
              <span>{survey.questions.length} questions</span>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            {isDrafts ? (
              <>
                <Button 
                  onClick={() => onPublishDraft?.(survey.id)} 
                  className="flex-1"
                >
                  <Upload className="size-4 mr-2" />
                  Publish
                </Button>
                <Button 
                  onClick={() => onDeleteDraft?.(survey.id)} 
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            ) : isPastSurveys ? (
              <Button 
                onClick={() => onViewResults(survey)} 
                className="w-full"
              >
                <BarChart3 className="size-4 mr-2" />
                View Results
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => onTakeSurvey(survey)} 
                  className="flex-1"
                >
                  Take Survey
                </Button>
                <Button 
                  onClick={() => onViewResults(survey)} 
                  variant="outline"
                  className="flex-1"
                >
                  <BarChart3 className="size-4 mr-2" />
                  Results
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}