// charts.js

// Donut Chart (Using Chart.js)
export function createDonutChart(canvasId, biasedCount, totalSentences, colors) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Calculate percentages
    const biasedPercentage = (biasedCount / totalSentences) * 100;
    const fairPercentage = 100 - biasedPercentage;

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Biased', 'Fair'],
            datasets: [{
                data: [biasedPercentage, fairPercentage],
                backgroundColor: colors,
                borderColor: '#ffffff',
                borderWidth: 2,
                hoverOffset: 10,
                hoverBackgroundColor: colors.map(color => darkenColor(color, 20)), // Darker shade on hover
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#4a4a4a',  // Sleek dark gray color for text
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',  // Dark tooltip for better contrast
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#666',
                    borderWidth: 1,
                    cornerRadius: 6
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            },
            cutout: '60%'  // Inner radius for a sleek donut shape
        }
    });
}


export function createCircularFillChart(canvasId, value, maxValue, label, color) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: [label, ''],
            datasets: [{
                data: [value * 100, (maxValue - value) * 100],
                backgroundColor: [
                    color,
                    '#e0e0e0'  // Light gray for unfilled part
                ],
                borderWidth: 1,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            cutout: '75%',  // Create a sleek and thin filled circular chart
            rotation: -90,  // Start from the top
            circumference: 180,  // Only draw a half-circle
            plugins: {
                legend: {
                    display: false  // No legend for a simpler look
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${(context.raw).toFixed(2)}%`;
                        }
                    }
                },
                doughnutLabel: {
                    labels: [
                        {
                            text: `${value * 100}%`,
                            font: {
                                size: 18,
                                weight: 'bold'
                            },
                            color: '#4a4a4a'
                        }
                    ]
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        },
        plugins: [
            {
                id: 'entityTypeLabel',
                afterDraw: function (chart) {
                    const ctx = chart.ctx;
                    const canvas = chart.canvas;
                    const { width, height } = canvas;

                    // Draw the label below the chart
                    ctx.font = 'bold 14px Arial';
                    ctx.fillStyle = '#4a4a4a';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, width / 2, height - 10);
                }
            }
        ]
    });
}


export function createBubbleChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Prepare the bubble chart data
    const bubbleData = {
        datasets: data.map((item) => ({
            label: item.aspect,
            data: [{
                x: Math.random() * 100,  // Random x value to spread out bubbles
                y: Math.random() * 100,  // Random y value to spread out bubbles
                r: item.value  // Radius of the bubble is proportional to the count of the aspect
            }],
            backgroundColor: item.color,
            borderColor: darkenColor(item.color, 20),
            borderWidth: 1
        }))
    };

    // Create the bubble chart using Chart.js
    new Chart(ctx, {
        type: 'bubble',
        data: bubbleData,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#4a4a4a',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const r = context.raw.r;
                            return `${label}: ${r} occurrences`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false,  // Hide x-axis for simplicity
                    min: 0,
                    max: 100
                },
                y: {
                    display: false,  // Hide y-axis for simplicity
                    min: 0,
                    max: 100
                }
            }
        }
    });
}

// Helper function to darken color
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16),
          amt = Math.round(2.55 * percent),
          R = (num >> 16) + amt,
          G = (num >> 8 & 0x00FF) + amt,
          B = (num & 0x0000FF) + amt;
    return "#" + (
      0x1000000 + 
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 + 
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 + 
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}


