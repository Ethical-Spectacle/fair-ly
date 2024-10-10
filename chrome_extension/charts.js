import { UI_COLORS, ASPECT_COLORS } from './helpers.js';

// -------------------------------- HERO SCORE PIE CHART --------------------------------//
export function createDonutChart(canvasId, biasedCount, totalSentences, colors) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // calculate percentages
    const biasedPercentage = (biasedCount / totalSentences) * 100;
    const fairPercentage = 100 - biasedPercentage;

    // create chart (using Chart.js in libs for security policy)
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Biased', 'Fair'],
            datasets: [{
                data: [biasedPercentage, fairPercentage],
                backgroundColor: colors,
                borderWidth: 0, // no border
                hoverOffset: 10,
                hoverBackgroundColor: colors.map(color => darkenColor(color, 20)), // darken shade on hover
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // sizing these is a pain, this lets us just use the css in popup.js
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: UI_COLORS['darkText'], 
                        font: {
                            size: 12,
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: UI_COLORS['veryLightColor'],
                    titleColor: UI_COLORS['veryDarkColor'],
                    bodyColor: UI_COLORS['sortaDarkColor'],
                    borderColor: UI_COLORS['sortaDarkColor'],
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
            cutout: '60%' 
        }
    });
}


// -------------------------------- SEMICIRCLE PIE CHART FOR ENTITIES --------------------------------//
export function createCircularFillChart(canvasId, value, maxValue, count, color) {
    // get canvas from DOM, have to run this after it exists
    const canvas = document.getElementById(canvasId);

    // double check canvas exists
    if (!canvas) {
        console.error(`Canvas element with ID "${canvasId}" not found.`);
        return;  
    }

    // get 2D context for canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error(`Could not get 2D context for canvas with ID "${canvasId}".`);
        return;
    }

    // render donut
    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Detected'],
            datasets: [{
                data: [value, maxValue - value],
                backgroundColor: [
                    color,
                    UI_COLORS['semicircleBG']
                ],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // sizing these is a pain, this lets us just use the css in popup.js
            cutout: '75%',
            rotation: -90,
            circumference: 180,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: false
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                onProgress: function(animation) {
                    // draw the count in the center (at the start, which means we have to do it every frame)
                    const { width, height } = chart;
                    const centerX = width / 2;
                    const centerY = height / 1.3; 
            
                    // clear canvas before drawing the new frame
                    ctx.clearRect(0, 0, width, height);
                    chart.draw();
            
                    // draw the count
                    ctx.save();
                    ctx.font = 'bold 18pt Arial';
                    ctx.fillStyle = UI_COLORS['sortaDarkColor'];
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(count.toString(), centerX, centerY);
                    ctx.restore();
                }
            }
            
            
        }
    });
}


// -------------------------------- ASPECTS RADAR CHART --------------------------------//
export function createRadarChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    const labels = data.map(item => item.aspect); // labels for the points
    const pointColors = labels.map(label => ASPECT_COLORS[label] || '#000000'); // colors for the points
    const values = data.map(item => item.value);  // aspect counts for the points

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: labels, // aspect names
            datasets: [{
                label: 'Aspect Occurrences',
                data: values, // aspect counts
                backgroundColor: 'rgba(33, 19, 33, 0.1)', 
                borderColor: UI_COLORS['veryDarkColor'],
                pointBackgroundColor: pointColors,
                pointBorderColor: UI_COLORS['veryDarkColor'],
                pointRadius: 5,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false, // not using
                    labels: {
                        color: UI_COLORS['sortaDarkColor'],
                        font: {
                            size: 10,
                        }
                    }
                },
                tooltip: { // tooltip with count
                    enabled: true,
                    callbacks: {
                        label: function (context) {
                            const value = context.raw;
                            return `${context.label} bias: ${value} occurrences`;
                        }
                    }
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: Math.max(...values) + 1, // slight buffer for the max
                    grid: {
                        color: UI_COLORS['sortaDarkColor'],
                    },
                    pointLabels: {
                        font: {
                            size: 12
                        },
                        color: UI_COLORS['sortaDarkColor']
                    }
                }
            }
        }
    });
    
}

// -------------------------------- MINI BIAS SCORE PIE CHART --------------------------------//
export function createMiniDonutChart(canvasId, biasedScore) {
    const canvas = document.getElementById(canvasId);

    // double check canvas exists
    if (!canvas) {
        console.error(`Canvas element with ID "${canvasId}" not found.`);
        return;  
    }

    const ctx = canvas.getContext('2d');    

    const chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [(biasedScore * 100), 100 - (biasedScore*100)], // bias score and remainer (out of 100)
                backgroundColor: ['#ff6164', UI_COLORS['semicircleBG']],  // red for bias
                borderWidth: 0,  // no border
            }]
        },
        options: {
            responsive: false, 
            maintainAspectRatio: true,
            cutout: '75%', // score gets written inside here
            plugins: {
                legend: { display: false },
                tooltip: { enabled: false },
            },
            hover: {
                mode: null
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                onComplete: function() {
                    // draw the bias score in the center
                    const { width, height } = chart;
                    const centerX = width / 2;
                    const centerY = height / 2;

                    ctx.save();
                    ctx.font = 'bold 10px Arial';
                    ctx.fillStyle = UI_COLORS['sortaDarkColor']; 
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(biasedScore.toFixed(2), centerX, centerY); 
                    ctx.restore();
                }
            }
        }
    });
}



// helper function for darkening hover colors
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
