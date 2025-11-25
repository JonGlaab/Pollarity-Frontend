import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
);

const QuestionChart = ({ question }) => {
  const answers = question.answers || [];  // <— safe default

  if (question.question_type === 'multiple_choice') {
    return (
      <div className="h-64 flex justify-center items-center">
        <Pie
          data={{
            labels: answers.map(a => a.option_text),
            datasets: [{
              data: answers.map(a => a.count),
              backgroundColor: ['#1b263b', '#415a77', '#778da9', '#e0e1dd', '#0d1b2a'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          }}
          options={{
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
            }
          }}
        />
      </div>
    );
  }

  if (question.question_type === 'checkbox') {
    return (
      <div className="h-64 w-full">
        <Bar
          data={{
            labels: answers.map(a => a.option_text),
            datasets: [{
              label: 'Votes',
              data: answers.map(a => a.count),
              backgroundColor: '#415a77',
              borderRadius: 4,
              barThickness: 20,
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
              x: { grid: { display: false } }
            }
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 h-64 overflow-y-auto">
      {answers.length > 0 ? (
        <ul className="space-y-2">
          {answers.map((ans, i) => (
            <li key={i} className="text-sm text-gray-700 bg-white p-3 rounded shadow-sm border-l-4 border-[#415a77]">
              "{ans}"
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400 text-sm italic">
          No text responses yet.
        </div>
      )}
    </div>
  );
};

export default QuestionChart;