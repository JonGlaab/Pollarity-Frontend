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
              <span className="flex-1 text-[#0d1b2a]">{result.question}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.type === 'multiple-choice' && result.data && (
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

                {result.cooccurrence && result.cooccurrence.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-[#415a77] mb-2">Co-selection heatmap (how often options are selected together)</div>
                    <div className="overflow-auto">
                      {/* build matrix */}
                      {
                        (() => {
                          const opts = result.data || [];
                          const idToIndex = {};
                          opts.forEach((o, idx) => { idToIndex[o.option_id] = idx; });
                          const size = opts.length;
                          const matrix = Array.from({ length: size }, () => Array(size).fill(0));
                          result.cooccurrence.forEach(c => {
                            const ai = idToIndex[c.a];
                            const bi = idToIndex[c.b];
                            if (ai !== undefined && bi !== undefined) {
                              matrix[ai][bi] = c.count;
                              matrix[bi][ai] = c.count;
                            }
                          });

                          const max = Math.max(...matrix.flat(), 1);

                          return (
                            <div className="inline-block border rounded">
                              <div className="grid" style={{ gridTemplateColumns: `120px repeat(${size}, 80px)` }}>
                                <div className="p-2 font-semibold">&nbsp;</div>
                                {opts.map((o, i) => <div key={`col-${i}`} className="p-2 text-xs font-medium text-center border-l truncate">{o.option}</div>)}
                                {opts.map((row, rIdx) => (
                                  <div key={`row-${rIdx}`} className="flex">
                                    <div className="p-2 text-sm font-medium border-t truncate">{opts[rIdx].option}</div>
                                    {matrix[rIdx].map((val, cIdx) => {
                                      const intensity = Math.round((val / max) * 100);
                                      const bg = `rgba(59,130,246,${0.08 + (intensity / 100) * 0.9})`;
                                      return (
                                        <div key={`cell-${rIdx}-${cIdx}`} className="p-2 text-center border-t border-l" style={{ background: bg, minWidth: 80, height: 48 }}>
                                          <div className="text-xs">{val}</div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()
                      }
                    </div>
                  </div>
                )}
              </div>
            )}
            {result.type === 'rating' && result.data && (
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
                        <span className="text-[#415a77]">{item.count} ({item.percentage}%)</span>
                      </div>
                      <Progress value={item.percentage} className="bg-[#e0e1dd]" />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {result.type === 'text' && result.data && (
              <div className="space-y-3">
                <p className="text-[#415a77]"> Responses:</p>
                {result.data.map((response, i) => (
                  <div key={i} className="p-4 bg-[#e0e1dd] rounded-lg border border-[#778da9]">
                    <p className="text-[#0d1b2a] italic">"{response}"</p>
                  </div>
                ))}
                <p className="text-[#415a77]">+ {Math.max(0, totalResponses - (result.data.length || 0))} more responses</p>

                {/* Word map (tag cloud) */}
                {result.word_map && result.word_map.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm text-[#415a77] mb-2">Word map</div>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const max = Math.max(...result.word_map.map(w => w.count), 1);
                        return result.word_map.map((w, idx) => {
                          const size = 0.9 + (w.count / max) * 1.6; // scale font-size
                          return (
                            <span key={`wm-${idx}`} className="inline-block bg-gray-100 px-2 py-1 rounded text-[#0d1b2a]" style={{ fontSize: `${12 * size}px` }}>
                              {w.word} <span className="text-xs text-gray-500">{w.count}</span>
                            </span>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}