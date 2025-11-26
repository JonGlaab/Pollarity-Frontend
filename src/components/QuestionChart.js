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

// Updated to accept type, data, and options directly
const QuestionChart = ({ type, data, options }) => {
    // Safe default
    const items = data || [];

    // Helper to extract label/value regardless of input format
    const getLabel = (item) => item.label || item.option || item.option_text;
    const getValue = (item) => item.value ?? item.count ?? 0;

    if (type === 'multiple_choice' || type === 'multiple-choice') {
        return (
            <div className="h-64 flex justify-center items-center">
                <Pie
                    data={{
                        labels: items.map(getLabel),
                        datasets: [{
                            data: items.map(getValue),
                            backgroundColor: ['#1b263b', '#415a77', '#778da9', '#e0e1dd', '#0d1b2a'],
                            borderWidth: 2,
                            borderColor: '#ffffff'
                        }]
                    }}
                    options={{
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'right', labels: { boxWidth: 12, font: { size: 11 } } }
                        },
                        ...options
                    }}
                />
            </div>
        );
    }

    if (type === 'checkbox') {
        return (
            <div className="h-64 w-full">
                <Bar
                    data={{
                        labels: items.map(getLabel),
                        datasets: [{
                            label: 'Votes',
                            data: items.map(getValue),
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
                        },
                        ...options
                    }}
                />
            </div>
        );
    }

    // Short Answer / Text
    return (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-2 h-64 overflow-y-auto">
            {items.length > 0 ? (
                <ul className="space-y-2">
                    {items.map((item, i) => (
                        <li key={i} className="text-sm text-gray-700 bg-white p-3 rounded shadow-sm border-l-4 border-[#415a77]">
                            "{typeof item === 'string' ? item : (item.response_text || item.label || item.option)}"
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