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
            maintainAspectRatio: false, // Allow us to control the height via CSS
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#4a4a4a',  // Sleek dark gray color for text
                        font: {
                            size: 12,
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
                    cornerRadius: 6,
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            return `${value.toFixed(1)}%`;
                        }
                    }
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


export function createCircularFillChart(canvasId, value, maxValue, count, color) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) {
        console.error(`Canvas element with ID "${canvasId}" not found.`);
        return; // Exit the function if the canvas element doesn't exist
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`Could not get 2D context for canvas with ID "${canvasId}".`);
        return;
    }

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Detected'],
            datasets: [{
                data: [value, maxValue - value],
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
            maintainAspectRatio: false, // This will allow us to control the height via CSS styles
            cutout: '75%',
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false // Disable tooltips
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                onProgress: function(animation) {
                    // Draw the count value in the center
                    const { width, height } = chart;
                    const centerX = width / 2;
                    const centerY = height / 1.3; // Adjusted for semicircle
            
                    // Clear the canvas before drawing the new frame
                    ctx.clearRect(0, 0, width, height);
                    // Redraw the chart background (optional if you need to redraw the existing state)
                    chart.draw();
            
                    // Draw the count value
                    ctx.save();
                    ctx.font = 'bold 2em Arial'; // Increase the font size here (e.g., '2em' or '30px')
                    ctx.fillStyle = '#4a4a4a'; // Dark gray text color
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(count.toString(), centerX, centerY);
                    ctx.restore();
                }
            }
            
            
        }
    });
}

export function createRadarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = data.map(item => item.aspect); // Aspects will be the labels on radar chart
    const values = data.map(item => item.value);  // Aspect counts will be the data points

    // Define colors for the radar chart
    const backgroundColor = 'rgba(54, 162, 235, 0.2)'; // Light blue background for radar
    const borderColor = 'rgba(54, 162, 235, 1)'; // Blue border for radar

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels, // Labels for each aspect
            datasets: [{
                label: 'Aspect Occurrences',
                data: values, // Data points for each aspect
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                pointBackgroundColor: borderColor,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'none',
                    labels: {
                        color: '#4a4a4a',
                        font: {
                            size: 10,
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            return `${context.label}: ${value} occurrences`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0, // Ensure minimum value is 0
                    suggestedMax: Math.max(...values) + 2, // Add some buffer to the maximum value
                    grid: {
                        color: 'rgba(200, 200, 200, 0.3)'
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        },
                        color: '#4a4a4a'
                    }
                }
            }
        }
    });
}


export function createMiniDonutChart(canvasId, biasedScore) {
    const canvas = document.getElementById(canvasId);

    if (!canvas) {
        console.error(`Canvas with ID "${canvasId}" not found.`);
        return;  // Exit early if the canvas is not found
    }

    const ctx = canvas.getContext('2d');    

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [(biasedScore * 100), 100 - (biasedScore*100)], // Bias and remainder
                backgroundColor: ['#ff6164', '#e0e0e0'],  // Red for bias, light gray for remainder
                borderWidth: 0,  // No border
            }]
        },
        options: {
            responsive: false, // Disable responsiveness since it's a fixed size
            maintainAspectRatio: true,
            cutout: '75%', // Make the inner circle bigger for placing the text
            plugins: {
                legend: { display: false },  // Hide the legend
                tooltip: { enabled: false }, // Disable tooltips
            },
            hover: {
                mode: null // Disable any hover effect
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                onComplete: function() {
                    // Draw the bias percentage in the center
                    const { width, height } = chart;
                    const centerX = width / 2;
                    const centerY = height / 2;

                    ctx.save();
                    ctx.font = 'bold 10px Arial'; // Font size for bias score
                    ctx.fillStyle = '#4a4a4a'; // Dark gray text color
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(biasedScore.toFixed(2), centerX, centerY); // Display bias percentage
                    ctx.restore();
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
