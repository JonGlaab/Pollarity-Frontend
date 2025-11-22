import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

export default function ViewSurvey() {
  const { niceUrl } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchSurvey = async () => {
      try {
        const res = await axios.get(`/api/surveys/${niceUrl}`);
        setSurvey(res.data);
      } catch (err) {
        console.error('Failed to load survey', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSurvey();
  }, [niceUrl]);

  if (loading) return <div className="p-8">Loading survey…</div>;
  if (!survey) return <div className="p-8">Survey not found or not published.</div>;

  const handleChange = (question, value) => {
    setAnswers(prev => ({ ...prev, [question.question_id]: value }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { answers: [] };
      survey.Questions.forEach(q => {
        const val = answers[q.question_id];
        if (q.question_type === 'multiple_choice') {
          if (val) payload.answers.push({ question_id: q.question_id, selected_option_id: parseInt(val, 10) });
        } else if (q.question_type === 'checkbox') {
          if (Array.isArray(val)) {
            val.forEach(optId => payload.answers.push({ question_id: q.question_id, selected_option_id: parseInt(optId, 10) }));
          }
        } else if (q.question_type === 'short_answer') {
          if (val) payload.answers.push({ question_id: q.question_id, response_text: val });
        }
      });

      await axios.post(`/api/surveys/nice/${niceUrl}/submit`, payload);
      setSubmitted(true);
    } catch (err) {
      console.error('Submit failed', err);
      alert('Failed to submit responses. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto p-8">
        <h2 className="text-2xl font-semibold">Thanks — your responses were recorded.</h2>
        <div className="mt-4">
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-4 py-2 rounded">Back Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold">{survey.title}</h1>
      <p className="text-gray-600 mb-6">{survey.description}</p>

      <div className="space-y-6">
        {survey.Questions.map((q) => (
          <div key={q.question_id} className="p-4 border rounded">
            <p className="font-semibold">{q.question_order}. {q.question_text} {q.is_required && <span className="text-red-600">*</span>}</p>

            {q.question_type === 'multiple_choice' && (
              <div className="mt-2 space-y-2">
                {q.Options.map(opt => (
                  <label key={opt.option_id} className="flex items-center gap-2">
                    <input type="radio" name={`q-${q.question_id}`} value={opt.option_id} onChange={(e) => handleChange(q, e.target.value)} />
                    <span>{opt.option_text}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'checkbox' && (
              <div className="mt-2 space-y-2">
                {q.Options.map(opt => (
                  <label key={opt.option_id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={opt.option_id}
                      checked={Array.isArray(answers[q.question_id]) && answers[q.question_id].includes(String(opt.option_id))}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setAnswers(prev => {
                          const existing = Array.isArray(prev[q.question_id]) ? prev[q.question_id].slice() : [];
                          if (checked) existing.push(String(opt.option_id)); else {
                            const idx = existing.indexOf(String(opt.option_id)); if (idx > -1) existing.splice(idx,1);
                          }
                          return { ...prev, [q.question_id]: existing };
                        });
                      }}
                    />
                    <span>{opt.option_text}</span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'short_answer' && (
              <textarea
                className="w-full border p-2 mt-2"
                rows={3}
                value={answers[q.question_id] || ''}
                onChange={(e) => handleChange(q, e.target.value)}
              />
            )}
          </div>
        ))}

        <div className="flex justify-end">
          <button onClick={handleSubmit} disabled={submitting} className="bg-green-600 text-white px-4 py-2 rounded">
            {submitting ? 'Submitting…' : 'Submit Responses'}
          </button>
        </div>
      </div>
    </div>
  );
}