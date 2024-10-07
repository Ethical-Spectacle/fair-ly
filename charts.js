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

    new Chart(ctx, {
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
                animateScale: true
            }
        }
    });
}

export function createBubbleChart(canvasId, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');

    // Function to check the overlapping distance between two circles
    function overlapDistance(circle1, circle2) {
        const dx = circle1.x - circle2.x;
        const dy = circle1.y - circle2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return Math.max(0, (circle1.r + circle2.r) - distance); // Return positive overlap distance or zero
    }

    // Function to find a position for a new bubble that does not overlap with existing bubbles
    function findBestPosition(existingBubbles, radius) {
        let bestPosition = { x: 50, y: 25 }; // Default to center of the chart
        let minTotalOverlap = Infinity;
        let bestScore = 0;

        for (let i = 0; i < 1000; i++) { // Try up to 1000 random positions
            const x = Math.random() * (100 - 2 * radius) + radius; // Ensure x stays within the boundary based on radius
            const y = Math.random() * (50 - 2 * radius) + radius; // Ensure y stays within the boundary based on radius
            const newBubble = { x, y, r: radius };

            // Calculate total overlap for this position
            let totalOverlap = 0;
            for (const existingBubble of existingBubbles) {
                totalOverlap += overlapDistance(existingBubble, newBubble);
            }

            // If there is no overlap and the bubble is fully inside, return immediately
            if (totalOverlap === 0 && x - radius >= 0 && x + radius <= 100 && y - radius >= 0 && y + radius <= 50) {
                return { x, y };
            }

            // Calculate how much of the bubble is within the boundaries
            let boundaryScore = Math.min(x - radius, 100 - (x + radius), y - radius, 50 - (y + radius));
            boundaryScore = Math.max(boundaryScore, 0); // Ensure score is not negative

            // Track the position with the least overlap and most within the boundary
            if (totalOverlap < minTotalOverlap || (totalOverlap === minTotalOverlap && boundaryScore > bestScore)) {
                minTotalOverlap = totalOverlap;
                bestScore = boundaryScore;
                bestPosition = { x, y };
            }
        }

        // Return the position with the least overlap and most within the boundary
        return bestPosition;
    }

    // Prepare the bubble chart data with non-overlapping positions
    const existingBubbles = [];

    const bubbleData = {
        datasets: data.map((item) => {
            const radius = item.value * 10;
            const { x, y } = findBestPosition(existingBubbles, radius);
            existingBubbles.push({ x, y, r: radius });

            return {
                label: item.aspect,
                data: [{ x, y, r: radius }],
                backgroundColor: item.color,
                borderColor: darkenColor(item.color, 20),
                borderWidth: 1
            };
        })
    };

    // Create the bubble chart using Chart.js
    new Chart(ctx, {
        type: 'bubble',
        data: bubbleData,
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow full resizing
            layout: {
                padding: 0 // Remove any internal padding to use the full area
            },
            plugins: {
                legend: {
                    position: 'bottom',
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
                            const label = context.dataset.label || '';
                            const r = context.raw.r / 10;  // Divide by 10 to show the original count
                            return `${label}: ${r} occurrences`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false,  // Hide x-axis for simplicity
                    min: 0,
                    max: 100  // Use full range to avoid clipping at the edges
                },
                y: {
                    display: false,  // Hide y-axis for simplicity
                    min: 0,
                    max: 50  // Reduced range to make the chart shorter while keeping bubbles within bounds
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


