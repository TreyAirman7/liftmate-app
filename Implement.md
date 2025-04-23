<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Predicted Weightlifting Performance</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation"></script>
    <script src="https://cdn.jsdelivr.net/npm/luxon@3.0.1/build/global/luxon.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-luxon@1.2.0/dist/chartjs-adapter-luxon.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.2.1/css/all.min.css">
</head>
<body class="bg-gray-50 font-sans text-gray-800 p-4 md:p-6 max-w-6xl mx-auto">
    <div class="bg-white rounded-xl shadow-lg p-5 mb-8">
        <header class="mb-6">
            <h1 class="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Performance Predictor</h1>
            <p class="text-gray-600">Track your progress and see where your performance is heading</p>
        </header>

        <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="bg-gray-100 rounded-lg p-4 flex-1">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-medium text-gray-700">Current 1RM</h3>
                    <div class="text-xl font-bold">225 <span class="text-sm font-normal text-gray-500">lbs</span></div>
                </div>
                <div class="flex items-center text-sm text-green-600">
                    <i class="fas fa-arrow-up mr-1"></i>
                    <span>+5 lbs from last month</span>
                </div>
            </div>
            
            <div class="bg-gray-100 rounded-lg p-4 flex-1">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-medium text-gray-700">Predicted 1RM</h3>
                    <div class="text-xl font-bold">255 <span class="text-sm font-normal text-gray-500">lbs</span></div>
                </div>
                <div class="flex items-center text-sm text-blue-600">
                    <i class="fas fa-calendar-alt mr-1"></i>
                    <span>Expected by Oct 15, 2023</span>
                </div>
            </div>
            
            <div class="bg-gray-100 rounded-lg p-4 flex-1">
                <div class="flex justify-between items-center mb-3">
                    <h3 class="font-medium text-gray-700">Confidence Level</h3>
                    <div class="text-xl font-bold">82<span class="text-sm font-normal text-gray-500">%</span></div>
                </div>
                <div class="flex items-center text-sm text-gray-600">
                    <i class="fas fa-chart-line mr-1"></i>
                    <span>Based on 32 workout sessions</span>
                </div>
            </div>
        </div>

        <div class="mb-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-800">Performance Trend</h2>
                <div class="flex gap-2">
                    <select id="exerciseSelector" class="text-sm border rounded-md px-2 py-1 bg-white">
                        <option value="squat">Squat</option>
                        <option value="bench">Bench Press</option>
                        <option value="deadlift">Deadlift</option>
                        <option value="overhead">Overhead Press</option>
                    </select>
                    <select id="timeframeSelector" class="text-sm border rounded-md px-2 py-1 bg-white">
                        <option value="3m">3 Months</option>
                        <option value="6m" selected>6 Months</option>
                        <option value="1y">1 Year</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-2 md:p-4 h-80 relative">
                <canvas id="performanceChart"></canvas>
                <div id="tooltipEl" class="hidden absolute bg-white p-2 rounded-md shadow-lg border border-gray-200 z-10 pointer-events-none"></div>
            </div>
            
            <div class="flex mt-4 text-sm">
                <div class="flex items-center mr-4">
                    <div class="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                    <span>Historical Data</span>
                </div>
                <div class="flex items-center mr-4">
                    <div class="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                    <span>Predicted Growth</span>
                </div>
                <div class="flex items-center">
                    <div class="w-4 h-4 bg-green-200 opacity-70 mr-2"></div>
                    <span>Confidence Range</span>
                </div>
            </div>
        </div>

        <div class="mb-8">
            <h2 class="text-xl font-bold text-gray-800 mb-4">Rep Range Predictions</h2>
            <div class="overflow-x-auto">
                <table class="min-w-full bg-white rounded-lg overflow-hidden">
                    <thead class="bg-gray-100 text-gray-700">
                        <tr>
                            <th class="py-3 px-4 text-left">Rep Range</th>
                            <th class="py-3 px-4 text-left">Current Max</th>
                            <th class="py-3 px-4 text-left">Predicted Max</th>
                            <th class="py-3 px-4 text-left">Est. Achievement</th>
                            <th class="py-3 px-4 text-left">Progress</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr>
                            <td class="py-3 px-4 font-medium">1RM</td>
                            <td class="py-3 px-4">225 lbs</td>
                            <td class="py-3 px-4">255 lbs</td>
                            <td class="py-3 px-4">Oct 15, 2023</td>
                            <td class="py-3 px-4 w-1/5">
                                <div class="relative pt-1">
                                    <div class="flex mb-2 items-center justify-between">
                                        <div class="text-xs text-right w-full font-semibold inline-block text-blue-600">
                                            68%
                                        </div>
                                    </div>
                                    <div class="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                        <div style="width: 68%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="py-3 px-4 font-medium">3RM</td>
                            <td class="py-3 px-4">205 lbs</td>
                            <td class="py-3 px-4">235 lbs</td>
                            <td class="py-3 px-4">Sep 30, 2023</td>
                            <td class="py-3 px-4 w-1/5">
                                <div class="relative pt-1">
                                    <div class="flex mb-2 items-center justify-between">
                                        <div class="text-xs text-right w-full font-semibold inline-block text-blue-600">
                                            75%
                                        </div>
                                    </div>
                                    <div class="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                        <div style="width: 75%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="py-3 px-4 font-medium">5RM</td>
                            <td class="py-3 px-4">190 lbs</td>
                            <td class="py-3 px-4">220 lbs</td>
                            <td class="py-3 px-4">Sep 18, 2023</td>
                            <td class="py-3 px-4 w-1/5">
                                <div class="relative pt-1">
                                    <div class="flex mb-2 items-center justify-between">
                                        <div class="text-xs text-right w-full font-semibold inline-block text-blue-600">
                                            82%
                                        </div>
                                    </div>
                                    <div class="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                        <div style="width: 82%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td class="py-3 px-4 font-medium">10RM</td>
                            <td class="py-3 px-4">165 lbs</td>
                            <td class="py-3 px-4">195 lbs</td>
                            <td class="py-3 px-4">Sep 5, 2023</td>
                            <td class="py-3 px-4 w-1/5">
                                <div class="relative pt-1">
                                    <div class="flex mb-2 items-center justify-between">
                                        <div class="text-xs text-right w-full font-semibold inline-block text-blue-600">
                                            88%
                                        </div>
                                    </div>
                                    <div class="overflow-hidden h-2 text-xs flex rounded bg-blue-200">
                                        <div style="width: 88%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div class="bg-gray-100 rounded-lg p-4 mb-6">
            <h2 class="text-lg font-bold text-gray-800 mb-2">Performance Insights</h2>
            <div class="space-y-3">
                <div class="flex items-start">
                    <i class="fas fa-chart-line text-blue-500 mt-1 mr-3"></i>
                    <p>Your squat strength is increasing at an average rate of <span class="font-medium">2.4%</span> per month, which is above average for your experience level.</p>
                </div>
                <div class="flex items-start">
                    <i class="fas fa-bullseye text-blue-500 mt-1 mr-3"></i>
                    <p>At your current pace, you're on track to reach your goal of <span class="font-medium">275 lbs</span> by January 2024.</p>
                </div>
                <div class="flex items-start">
                    <i class="fas fa-lightbulb text-yellow-500 mt-1 mr-3"></i>
                    <p>Consider adding more volume to your workouts in the 70-80% of 1RM range to potentially accelerate your strength gains.</p>
                </div>
            </div>
        </div>

        <div class="bg-white border-t pt-4">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Analysis based on:</h3>
            <ul class="text-sm text-gray-600 space-y-1 ml-4">
                <li>• 32 recorded workout sessions</li>
                <li>• Training frequency: 3.2 sessions per week</li>
                <li>• Linear progression model with fatigue adjustment</li>
                <li>• Last updated: Aug 28, 2023</li>
            </ul>
        </div>
    </div>

    <script>
        // Sample data generation function
        function generateData() {
            // Past 6 months of actual data
            const actualData = [];
            const today = new Date();
            let currentDate = new Date(today);
            currentDate.setMonth(currentDate.getMonth() - 6);
            
            let weight = 170; // Starting weight
            
            // Generate historical data points
            while (currentDate <= today) {
                // Add some noise to the data
                const noise = (Math.random() - 0.3) * 8;
                weight += Math.random() * 1.8 + noise;
                
                actualData.push({
                    x: new Date(currentDate),
                    y: Math.round(weight)
                });
                
                // Move to next data point (typically workouts are a few days apart)
                const daysToAdd = Math.floor(Math.random() * 4) + 3;
                currentDate.setDate(currentDate.getDate() + daysToAdd);
            }
            
            // Future 3 months of predicted data
            const predictedData = [];
            currentDate = new Date(today);
            weight = actualData[actualData.length - 1].y; // Start from last actual weight
            
            // Generate prediction data points
            let confidenceUpper = [];
            let confidenceLower = [];
            
            for (let i = 1; i <= 12; i++) {
                currentDate.setDate(currentDate.getDate() + 7); // Weekly prediction points
                weight += 1.2 + (Math.random() * 0.8); // Steadier progress for prediction
                
                const predictionPoint = {
                    x: new Date(currentDate),
                    y: Math.round(weight)
                };
                
                predictedData.push(predictionPoint);
                
                // Add confidence interval (gets wider further into the future)
                const confidence = 2 + (i * 0.5); // Confidence range increases over time
                confidenceUpper.push({
                    x: predictionPoint.x,
                    y: Math.round(predictionPoint.y + confidence)
                });
                
                confidenceLower.push({
                    x: predictionPoint.x,
                    y: Math.round(predictionPoint.y - confidence)
                });
            }
            
            return {
                actual: actualData,
                predicted: predictedData,
                confidenceUpper: confidenceUpper,
                confidenceLower: confidenceLower.reverse() // Reverse for the area fill
            };
        }

        // Create and animate the chart when the document is ready
        document.addEventListener('DOMContentLoaded', function() {
            const data = generateData();
            const ctx = document.getElementById('performanceChart').getContext('2d');
            
            // Create confidence area dataset by combining upper and lower bounds
            const confidenceArea = [...data.confidenceUpper, ...data.confidenceLower];
            
            // Create the chart
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Historical',
                            data: data.actual,
                            borderColor: '#3B82F6', // blue-500
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2,
                            pointRadius: 3,
                            pointBackgroundColor: '#3B82F6',
                            tension: 0.2
                        },
                        {
                            label: 'Predicted',
                            data: data.predicted,
                            borderColor: '#10B981', // green-500
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            pointRadius: 2,
                            pointBackgroundColor: '#10B981',
                            tension: 0.3
                        },
                        {
                            label: 'Confidence Range',
                            data: confidenceArea,
                            fill: true,
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            borderWidth: 0,
                            pointRadius: 0,
                            showLine: true
                        }
                    ]
                },
                options: {
                    animation: {
                        duration: 1500,
                        easing: 'easeOutQuart'
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                        mode: 'index',
                        intersect: false,
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false,
                            external: (context) => {
                                // External custom tooltip
                                const tooltipEl = document.getElementById('tooltipEl');
                                
                                // Hide if no tooltip
                                if (context.tooltip.opacity === 0) {
                                    tooltipEl.classList.add('hidden');
                                    return;
                                }
                                
                                // Set content
                                if (context.tooltip.body) {
                                    const titleLines = context.tooltip.title || [];
                                    const bodyLines = context.tooltip.body.map(b => b.lines);
                                    
                                    let innerHtml = '<div class="font-medium text-gray-700 mb-1">';
                                    
                                    titleLines.forEach(title => {
                                        innerHtml += `${new Date(title).toLocaleDateString()}</div>`;
                                    });
                                    
                                    innerHtml += '<div class="text-sm space-y-1">';
                                    
                                    context.tooltip.dataPoints.forEach((dataPoint) => {
                                        const color = dataPoint.dataset.borderColor;
                                        const label = dataPoint.dataset.label;
                                        const value = dataPoint.formattedValue;
                                        
                                        // Skip the confidence range in tooltip
                                        if (label !== 'Confidence Range') {
                                            innerHtml += `<div class="flex items-center">
                                                <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${color}"></div>
                                                <span class="font-medium">${label}:</span>
                                                <span class="ml-1">${value} lbs</span>
                                            </div>`;
                                        }
                                    });
                                    
                                    innerHtml += '</div>';
                                    
                                    tooltipEl.innerHTML = innerHtml;
                                }
                                
                                // Set position
                                const position = context.chart.canvas.getBoundingClientRect();
                                tooltipEl.style.left = position.left + window.pageXOffset + context.tooltip.caretX + 'px';
                                tooltipEl.style.top = position.top + window.pageYOffset + context.tooltip.caretY + 'px';
                                tooltipEl.classList.remove('hidden');
                                
                                // Transform to position tooltip correctly relative to pointer
                                tooltipEl.style.transform = 'translate(-50%, -100%)';
                                tooltipEl.style.marginTop = '-10px';
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'month',
                                tooltipFormat: 'MMM d, yyyy',
                                displayFormats: {
                                    month: 'MMM'
                                }
                            },
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxRotation: 0
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Weight (lbs)',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: 'rgba(0, 0, 0, 0.05)'
                            }
                        }
                    }
                }
            });
            
            // Add vertical line at today's date
            const todayPlugin = {
                id: 'todayLine',
                afterDraw: (chart) => {
                    const ctx = chart.ctx;
                    const xAxis = chart.scales.x;
                    const yAxis = chart.scales.y;
                    const today = new Date();
                    
                    const x = xAxis.getPixelForValue(today);
                    
                    // Only draw if in range
                    if (x >= xAxis.left && x <= xAxis.right) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(x, yAxis.top);
                        ctx.lineTo(x, yAxis.bottom);
                        ctx.lineWidth = 2;
                        ctx.strokeStyle = 'rgba(107, 114, 128, 0.5)';
                        ctx.setLineDash([4, 4]);
                        ctx.stroke();
                        
                        // Add "Today" label
                        ctx.fillStyle = 'rgba(107, 114, 128, 1)';
                        ctx.font = '10px sans-serif';
                        ctx.textAlign = 'center';
                        ctx.fillText('Today', x, yAxis.top - 8);
                        ctx.restore();
                    }
                }
            };
            
            chart.config.plugins.push(todayPlugin);
            chart.update();
            
            // Event listeners for selectors
            document.getElementById('exerciseSelector').addEventListener('change', function() {
                // In a real app, this would fetch new data
                // For demo purposes, we'll just regenerate random data
                const newData = generateData();
                
                // Update chart data
                chart.data.datasets[0].data = newData.actual;
                chart.data.datasets[1].data = newData.predicted;
                chart.data.datasets[2].data = [...newData.confidenceUpper, ...newData.confidenceLower];
                
                chart.update();
            });
            
            document.getElementById('timeframeSelector').addEventListener('change', function() {
                // In a real app, this would adjust the visible timeframe
                chart.update();
            });
        });
    </script>
</body>
</html>
