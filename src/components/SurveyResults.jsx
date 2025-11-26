import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { BarChart3, Users } from 'lucide-react';

export function SurveyResults({ survey }) {
  // Expect server-provided `survey` shape:
  // { title, description, responses: number, questions: [ { question, type, data: [...], average? } ] }
  const results = (survey && Array.isArray(survey.questions)) ? survey.questions : [];
  const totalResponses = survey && (survey.responses || survey.total_responses || 0);

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
          <div className="flex items-center gap-6 text-[#415a77]">
            <div className="flex items-center gap-2"><Users className="size-5" /><span>{totalResponses} total responses</span></div>
            {survey.unique_respondents !== undefined && (
              <div className="flex items-center gap-2"><svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H7"/></svg><span>{survey.unique_respondents} unique respondents</span></div>
            )}
            {survey.first_response_at && (
              <div className="text-sm text-gray-600">First: {new Date(survey.first_response_at).toLocaleString()}</div>
            )}
            {survey.last_response_at && (
              <div className="text-sm text-gray-600">Last: {new Date(survey.last_response_at).toLocaleString()}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length === 0 && (
        <div className="p-6 text-center text-gray-600">No results available for this survey yet.</div>
      )}

      {results.map((result, index) => (
        <Card key={index} className="bg-white border-[#778da9]">
          <CardHeader>
            <CardTitle className="flex items-start gap-2">
              <span className="bg-[#415a77] text-white px-3 py-1 rounded-lg shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-[#0d1b2a]">{result.title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

          {/* Multiple Choice */}
          {result.type === 'multiple_choice' && result.data && (
          <div className="space-y-3">
              {result.data.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#0d1b2a]">{item.option}</span>
                    <span className="text-[#415a77]">{item.count} ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="bg-[#e0e1dd]" />
                </div>
              ))}
            </div>
          )}

          {/* Checkbox */}
          {result.type === 'checkbox' && result.data && (
            <div className="space-y-3">
              {result.data.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#0d1b2a]">{item.option}</span>
                    <span className="text-[#415a77]">{item.count} ({item.percentage}%)</span>
                  </div>
                  <Progress value={item.percentage} className="bg-[#e0e1dd]" />
                </div>
              ))}
            </div>
          )}

          {/* Short Answer */}
          {result.type === 'short_answer' && result.data && (
            <div className="space-y-3">
              <p className="text-[#415a77]">Responses:</p>
              {console.log("Result Data:", result.type)}
              {result.data.map((response, i) => (
                <div key={i} className="p-4 bg-[#e0e1dd] rounded-lg border border-[#778da9]">
                  <p className="text-[#0d1b2a] italic">"{response}"</p>
                </div>
              ))}
            <p className="text-[#415a77]">+ {Math.max(0, totalResponses - (result.data.length || 0))} more responses</p>
    </div>
  )}
</CardContent>

        </Card>
      ))}
    </div>
  );
}