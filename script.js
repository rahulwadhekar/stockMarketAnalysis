const listOfButton = document.querySelector('#list');
let myChart;
let currentStockSymbol = 'AAPL'; 
let currentTimeFrame = '5y'; 
let profileData = {}; 
let statsData = {}; 

async function fetchAndDisplayStockData(stockSymbol, timeFrame = currentTimeFrame) {
    const baseUrl = 'https://stocksapi-uhe1.onrender.com/api/stocks/';
    const endpoints = ['getstocksprofiledata', 'getstockstatsdata', 'getstocksdata'];

    try {
        const [profileDataResponse, statsDataResponse, stocksDataResponse] = await Promise.all(
            endpoints.map(endpoint =>
                fetch(`${baseUrl}${endpoint}`).then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching from ${endpoint}: ${response.statusText}`);
                    }
                    return response.json();
                })
            )
        );

        profileData = profileDataResponse;
        statsData = statsDataResponse;

        const stockData = stocksDataResponse.stocksData[0][stockSymbol][timeFrame];
        const prices = stockData.value;
        const timestamps = stockData.timeStamp.map(ts => new Date(ts * 1000).toLocaleDateString());

        createChart(prices, timestamps);

        currentStockSymbol = stockSymbol;
        currentTimeFrame = timeFrame;
        showDetails();
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

function createChart(prices, timestamps) {
    const ctx = document.createElement('canvas');
    ctx.id = 'myChart';
    const chartContainer = document.getElementById('chart');
    chartContainer.innerHTML = '';
    chartContainer.appendChild(ctx);

    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timestamps,
            datasets: [{
                label: `${currentStockSymbol} Stock Price (${currentTimeFrame})`,
                data: prices,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 2,
                fill: true,
                pointRadius: 0,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: { display: false },
                y: { beginAtZero: false }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function (tooltipItem) {
                            return `Price: $${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                intersect: true
            }
        }
    });
}

function showDetails() {
    const details = document.getElementById('details');
    details.innerHTML = '';

    const stockStats = statsData.stocksStatsData[0][currentStockSymbol];
    const bookValue = stockStats.bookValue;
    const profit = Math.floor(stockStats.profit * 100);

    const companyProfile = profileData.stocksProfileData[0][currentStockSymbol];
    const { summary } = companyProfile;

    const compName = document.createElement('span');
    const priceDetails = document.createElement('span');
    const percentageDetails = document.createElement('span');
    compName.className = 'span1'
    priceDetails.className = 'span2'
    percentageDetails.className = 'span3'

    compName.textContent = `Company: ${currentStockSymbol}`;
    priceDetails.textContent = `Current Price: $${bookValue}`;
    percentageDetails.textContent = `Profit: ${profit}%`;

    details.appendChild(compName);
    details.appendChild(priceDetails);
    details.appendChild(percentageDetails);

    const profileSection = document.createElement('div');
    profileSection.classList.add('profile-section');

    const companyInfo = document.createElement('div');
    companyInfo.innerHTML = `
        <strong>Company Overview:</strong><br>
        ${summary}
    `;

    profileSection.appendChild(companyInfo);
    details.appendChild(profileSection);
}

function createTimeFrameButtons() {
    const timeFrames = ['1mo', '3mo', '1y', '5y'];
    timeFrames.forEach(timeFrame => {
        const button = document.getElementById(`button-${timeFrame}`);
        button.addEventListener('click', () => {
            fetchAndDisplayStockData(currentStockSymbol, timeFrame);
        });
    });
}

async function fetchStockData() {
    const baseUrl = 'https://stocksapi-uhe1.onrender.com/api/stocks/';
    const endpoints = ['getstocksprofiledata', 'getstockstatsdata', 'getstocksdata'];

    try {
        const [profileDataResponse, statsDataResponse, stocksDataResponse] = await Promise.all(
            endpoints.map(endpoint =>
                fetch(`${baseUrl}${endpoint}`).then(response => {
                    if (!response.ok) {
                        throw new Error(`Error fetching from ${endpoint}: ${response.statusText}`);
                    }
                    return response.json();
                })
            )
        );

        profileData = profileDataResponse;
        statsData = statsDataResponse;

        const stockStats = statsData.stocksStatsData[0];
        for (const stock in stockStats) {
            if (stock !== "_id") {
                const button = document.createElement('button');
                const buttonDiv = document.createElement('div');
                const priceSpan = document.createElement('span');
                const perSpan = document.createElement('span');

                const bookValue = stockStats[stock].bookValue;
                const profit = Math.floor(stockStats[stock].profit * 100);

                buttonDiv.className = 'listButtonDiv';
                button.className = 'listButton';
                button.textContent = stock;

                priceSpan.textContent = `$${bookValue}`;
                perSpan.textContent = `${profit}%`;

                button.addEventListener('click', () => {
                    fetchAndDisplayStockData(stock, currentTimeFrame);
                });

                buttonDiv.appendChild(button);
                buttonDiv.appendChild(priceSpan);
                buttonDiv.appendChild(perSpan);

                listOfButton.appendChild(buttonDiv);
            }
        }

        fetchAndDisplayStockData('AAPL', currentTimeFrame);
    } catch (error) {
        console.error('Error fetching stock data:', error);
    }
}

fetchStockData();
createTimeFrameButtons();
