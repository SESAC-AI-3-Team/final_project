import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const FinancialChart = ({ balance, income, expense }) => {
    const doughnutData = {
        labels: ['총 수입', '총 지출'],
        datasets: [
            {
                data: [income, expense],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)', // Primary Blue
                    'rgba(239, 68, 68, 0.8)',   // Red
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(239, 68, 68, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const barData = {
        labels: ['잔액', '수입', '지출'],
        datasets: [
            {
                label: '금액 (원)',
                data: [balance, income, expense],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(34, 197, 94, 0.6)', // Green
                    'rgba(239, 68, 68, 0.6)',
                ],
                borderRadius: 8,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        family: 'Pretendard, sans-serif',
                        size: 12
                    }
                }
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#1F2937',
                bodyColor: '#1F2937',
                borderColor: '#E5E7EB',
                borderWidth: 1,
                padding: 12,
                boxPadding: 6,
                usePointStyle: true,
                callbacks: {
                    label: (context) => {
                        let label = context.dataset.label || '';
                        if (label) label += ': ';
                        if (context.parsed.y !== undefined) {
                            label += new Intl.NumberFormat('ko-KR').format(context.parsed.y) + '원';
                        } else if (context.parsed !== undefined) {
                            label += new Intl.NumberFormat('ko-KR').format(context.parsed) + '원';
                        }
                        return label;
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    display: false
                },
                ticks: {
                    callback: (value) => new Intl.NumberFormat('ko-KR').format(value) + '원'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
                <h3 className="text-lg font-bold mb-4 w-full text-left">수입/지출 비중</h3>
                <div className="w-full h-[250px] relative">
                    <Doughnut data={doughnutData} options={{ ...options, scales: undefined }} />
                </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                <h3 className="text-lg font-bold mb-4">재정 현황 비교</h3>
                <div className="w-full h-[250px]">
                    <Bar data={barData} options={options} />
                </div>
            </div>
        </div>
    );
};

export default FinancialChart;
