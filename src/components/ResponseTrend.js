import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const ResponseTrend = ({ dates }) => {
    const [timeFrame, setTimeFrame] = useState('daily');

    const chartData = useMemo(() => {
        if (!dates || dates.length === 0) return null;

        const dateCounts = {};

        const sortedDates = [...dates].sort((a, b) => new Date(a) - new Date(b));

        sortedDates.forEach(dateString => {
            const date = new Date(dateString);
            let key;

            if (timeFrame === 'daily') {

                key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            } else {

                key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            }

            dateCounts[key] = (dateCounts[key] || 0) + 1;
        });

        return {
            labels: Object.keys(dateCounts),
            datasets: [{
                label: 'Responses',
                data: Object.values(dateCounts),
                borderColor: '#415A77',
                backgroundColor: 'rgba(65, 90, 119, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#1b263b',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        };
    }, [dates, timeFrame]);
        
    console.log('dates prop:', dates);


    if (!dates || dates.length === 0) {
        return <div className="text-center text-gray-400 py-10 text-sm">No data available</div>;
    }

    return (
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-[#1b263b] text-sm uppercase tracking-wide">Response Trend</h4>
                <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setTimeFrame('daily')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${timeFrame === 'daily' ? 'bg-white shadow text-[#1b263b] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Daily
                    </button>
                    <button
                        onClick={() => setTimeFrame('monthly')}
                        className={`px-3 py-1 text-xs rounded-md transition-all ${timeFrame === 'monthly' ? 'bg-white shadow text-[#1b263b] font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Monthly
                    </button>
                </div>
            </div>

            <div className="h-48 w-full">
                {chartData && <Line
                    data={chartData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
                            x: { grid: { display: false } }
                        }
                    }}
                />}
            </div>
        </div>
    );
};

export default ResponseTrend;