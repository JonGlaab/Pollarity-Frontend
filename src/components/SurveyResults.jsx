import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart3, Users } from 'lucide-react';

// Mock data generator for demonstration
function generateMockResults(survey) {
  const totalResponses = survey.responses || 0;
  
  return survey.questions.map((question) => {
    if (question.type === 'multiple-choice' && question.options) {
      // Generate random distribution for options
      const total = 100;
      let remaining = total;
      const distribution = question.options.map((option, index) => {
        if (index === question.options.length - 1) {
          return { option, percentage: remaining, count: Math.floor((remaining / 100) * totalResponses) };
        }
        const percentage = Math.floor(Math.random() * remaining);
        remaining -= percentage;
        return { option, percentage, count: Math.floor((percentage / 100) * totalResponses) };
      });
      return { question: question.question, type: 'multiple-choice', data: distribution };
    }
    
    if (question.type === 'checkbox' && question.options) {
      // For checkboxes, each option can be 0-100%
      const distribution = question.options.map((option) => {
        const percentage = Math.floor(Math.random() * 80) + 10;
        return { option, percentage, count: Math.floor((percentage / 100) * totalResponses) };
      });
      return { question: question.question, type: 'checkbox', data: distribution };
    }
    
    if (question.type === 'rating') {
      const ratings = [1, 2, 3, 4, 5];
      let remaining = 100;
      const distribution = ratings.map((rating, index) => {
        if (index === ratings.length - 1) {
          return { rating, percentage: remaining, count: Math.floor((remaining / 100) * totalResponses) };
        }
        const percentage = Math.floor(Math.random() * remaining);
        remaining -= percentage;
        return { rating, percentage, count: Math.floor((percentage / 100) * totalResponses) };
      });
      const average = distribution.reduce((sum, d) => sum + (d.rating * d.percentage), 0) / 100;
      return { question: question.question, type: 'rating', data: distribution, average: average.toFixed(1) };
    }
    
    if (question.type === 'text') {
      // Sample text responses
      const sampleResponses = [
        'Great experience overall!',
        'Could use some improvements in certain areas.',
        'Very satisfied with the service.',
        'Looking forward to future updates.',
      ];
      return { question: question.question, type: 'text', data: sampleResponses.slice(0, 3) };
    }
    
    return { question: question.question, type: question.type, data: [] };
  });
}

export function SurveyResults({ survey }) {
  const results = generateMockResults(survey);
  const totalResponses = survey.responses || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-white border-[#778da9]">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-[#0d1b2a]">
            <BarChart3 className="size-6 text-[#415a77]" />
            {survey.title}
          </CardTitle>
          <CardDescription className="text-[#415a77]">{survey.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-[#415a77]">
            <Users className="size-5" />
            <span>{totalResponses} total responses</span>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.map((result, index) => (
        <Card key={index} className="bg-white border-[#778da9]">
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="bg-[#415a77] text-white px-3 py-1 rounded-lg shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-[#0d1b2a]">{result.question}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.type === 'multiple-choice' && (
              <div className="space-y-3">
                {result.data.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#0d1b2a]">{item.option}</span>
                      <span className="text-[#415a77]">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="bg-[#e0e1dd]" />
                  </div>
                ))}
              </div>
            )}

            {result.type === 'checkbox' && (
              <div className="space-y-3">
                {result.data.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#0d1b2a]">{item.option}</span>
                      <span className="text-[#415a77]">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <Progress value={item.percentage} className="bg-[#e0e1dd]" />
                  </div>
                ))}
              </div>
            )}

            {result.type === 'rating' && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-[#415a77] rounded-lg">
                  <div className="text-[#e0e1dd]">Average Rating</div>
                  <div className="text-white">{result.average} / 5.0</div>
                </div>
                <div className="space-y-3">
                  {result.data.map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-[#0d1b2a]">⭐ {item.rating}</span>
                        <span className="text-[#415a77]">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <Progress value={item.percentage} className="bg-[#e0e1dd]" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.type === 'text' && (
              <div className="space-y-3">
                <p className="text-[#415a77]">Sample responses:</p>
                {result.data.map((response, i) => (
                  <div key={i} className="p-4 bg-[#e0e1dd] rounded-lg border border-[#778da9]">
                    <p className="text-[#0d1b2a] italic">"{response}"</p>
                  </div>
                ))}
                <p className="text-[#415a77]">
                  + {Math.max(0, totalResponses - 3)} more responses
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}