/**
 * Custom Weather Widget using National Weather Service API
 * Location: Goldsboro, NC (35.3849, -77.9928)
 */

class WeatherWidget {
    constructor() {
        this.lat = 35.3849;
        this.lon = -77.9928;
        this.gridEndpoint = null;
        this.hourlyEndpoint = null;
        this.hourlyData = null;
        this.lastUpdated = null;
        this.refreshInterval = 30 * 60 * 1000; // 30 minutes
        this.init();
    }

    async init() {
        try {
            await this.fetchGridEndpoint();
            await this.fetchHourlyForecast();
            await this.updateWeather();
            // Auto-refresh every 30 minutes
            setInterval(() => {
                this.refresh();
            }, this.refreshInterval);
        } catch (error) {
            this.displayError('Unable to load weather data');
            console.error('Weather widget initialization error:', error);
        }
    }

    async refresh() {
        try {
            // Add rotation animation to icon
            const icon = document.querySelector('.current-icon');
            if (icon) {
                icon.classList.add('refreshing');
            }

            await this.fetchHourlyForecast();
            await this.updateWeather();

            // Remove animation after a delay
            setTimeout(() => {
                if (icon) {
                    icon.classList.remove('refreshing');
                }
            }, 600);
        } catch (error) {
            console.error('Error refreshing weather:', error);
        }
    }

    async fetchGridEndpoint() {
        try {
            const response = await fetch(
                `https://api.weather.gov/points/${this.lat},${this.lon}`,
                {
                    headers: {
                        'User-Agent': '4TS-Board-Weather-Widget',
                        'Accept': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.gridEndpoint = data.properties.forecast;
            this.hourlyEndpoint = data.properties.forecastHourly;
        } catch (error) {
            console.error('Error fetching grid endpoint:', error);
            throw error;
        }
    }

    async fetchHourlyForecast() {
        try {
            if (!this.hourlyEndpoint) {
                await this.fetchGridEndpoint();
            }

            const response = await fetch(this.hourlyEndpoint, {
                headers: {
                    'User-Agent': '4TS-Board-Weather-Widget',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.hourlyData = data.properties.periods;
        } catch (error) {
            console.error('Error fetching hourly forecast:', error);
        }
    }

    async updateWeather() {
        try {
            if (!this.gridEndpoint) {
                await this.fetchGridEndpoint();
            }

            const response = await fetch(this.gridEndpoint, {
                headers: {
                    'User-Agent': '4TS-Board-Weather-Widget',
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.displayWeather(data.properties.periods);
        } catch (error) {
            console.error('Error updating weather:', error);
            this.displayError('Unable to update weather data');
        }
    }

    displayWeather(periods) {
        if (!periods || periods.length === 0) {
            this.displayError('No weather data available');
            return;
        }

        // Get the next 7 days (14 periods - day and night for each day)
        const forecastDays = [];
        for (let i = 0; i < Math.min(14, periods.length); i += 2) {
            const dayPeriod = periods[i];
            const nightPeriod = periods[i + 1] || periods[i];

            forecastDays.push({
                name: dayPeriod.name,
                startTime: dayPeriod.startTime,
                icon: dayPeriod.icon,
                shortForecast: dayPeriod.shortForecast,
                high: dayPeriod.isDaytime ? dayPeriod.temperature : nightPeriod.temperature,
                low: nightPeriod.isDaytime ? dayPeriod.temperature : nightPeriod.temperature
            });
        }

        // Filter out past hours for the hourly sections
        const now = new Date();
        const upcomingHourly = (this.hourlyData || []).filter(hour => {
            const endTime = new Date(hour.endTime);
            return endTime > now;
        });

        // USE THE HOURLY DATA FOR THE "CURRENT" SECTION (much more accurate than daily forecast block)
        const current = upcomingHourly[0] || periods[0];

        // Get the next 4 hours from hourly data (starting from 1 hour after current)
        let hourlyCardsHTML = '';
        if (upcomingHourly.length > 1) {
            const next4Hours = upcomingHourly.slice(1, 5);
            if (next4Hours.length > 0) {
                hourlyCardsHTML = next4Hours.map(hour => {
                    const time = new Date(hour.startTime);
                    const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

                    return `
                        <div class="hourly-forecast-card">
                            <div class="hourly-forecast-time">${timeStr}</div>
                            <img src="${hour.icon}" alt="${hour.shortForecast}" class="hourly-forecast-icon">
                            <div class="hourly-forecast-temp">${hour.temperature}°</div>
                        </div>
                    `;
                }).join('');
            }
        }

        const container = document.getElementById('weather-widget-content');
        if (!container) {
            console.error('Weather widget container not found');
            return;
        }

        // Build forecast cards HTML
        const forecastCardsHTML = forecastDays.map((day, index) => `
      <div class="forecast-card" data-day-index="${index}" data-day-name="${day.name}" data-start-time="${day.startTime}">
        <div class="forecast-day">${day.name}</div>
        <img src="${day.icon}" alt="${day.shortForecast}" class="forecast-icon">
        <div class="forecast-temps">
          <span class="forecast-high">${day.high}°</span>
          <span class="forecast-low">${day.low}°</span>
        </div>
      </div>
    `).join('');

        // Update last updated time
        this.lastUpdated = new Date();
        const timeStr = this.lastUpdated.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

        container.innerHTML = `
      <div class="weather-current">
        <div class="current-main">
          <div class="current-icon-container" title="Click to refresh">
            <img src="${current.icon}" alt="${current.shortForecast}" class="current-icon">
          </div>
          <div class="current-info">
            <div class="current-temp">${current.temperature}°${current.temperatureUnit || 'F'}</div>
            <div class="current-condition">${current.shortForecast}</div>
            <div class="current-wind">Wind: ${current.windSpeed} ${current.windDirection}</div>
          </div>
        </div>
        <div class="weather-meta">
          <div class="weather-location">Goldsboro, NC</div>
          <div class="weather-updated">As of ${timeStr}</div>
          <div class="refresh-hint">Click icon to refresh</div>
        </div>
      </div>
      ${hourlyCardsHTML ? `
      <div class="weather-hourly">
        <div class="hourly-title">Next 4 Hours</div>
        <div class="hourly-forecast-cards">
          ${hourlyCardsHTML}
        </div>
      </div>
      ` : ''}
      <div class="weather-forecast">
        <div class="forecast-header">
          <div class="forecast-title">7-Day Forecast</div>
          <div class="forecast-hint">Click icon for forecast</div>
        </div>
        <div class="forecast-cards" title="Click icon for hourly forecast">
          ${forecastCardsHTML}
        </div>
      </div>
    `;

        // Add click handlers to forecast cards
        this.attachCardClickHandlers();

        // Add click handler to current icon for refresh
        const iconContainer = document.querySelector('.current-icon-container');
        if (iconContainer) {
            iconContainer.style.cursor = 'pointer';
            iconContainer.addEventListener('click', () => this.refresh());
        }
    }

    attachCardClickHandlers() {
        const cards = document.querySelectorAll('.forecast-card');
        cards.forEach(card => {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const dayName = card.dataset.dayName;
                const startTime = card.dataset.startTime;
                this.showHourlyModal(dayName, startTime);
            });
        });
    }

    showHourlyModal(dayName, startTime) {
        if (!this.hourlyData) {
            console.error('Hourly data not available');
            return;
        }

        // Filter hourly data for the selected day (next 24 hours from start time)
        const now = new Date();
        const startDate = new Date(startTime);
        const endDate = new Date(startDate);
        endDate.setHours(endDate.getHours() + 24);

        const dayHourlyData = this.hourlyData.filter(period => {
            const periodStartTime = new Date(period.startTime);
            const periodEndTime = new Date(period.endTime);
            // Must be within the 24h window AND haven't ended yet
            return periodStartTime >= startDate && periodStartTime < endDate && periodEndTime > now;
        });

        // Create modal HTML
        const hourlyHTML = dayHourlyData.map(hour => {
            const time = new Date(hour.startTime);
            const timeStr = time.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });

            return `
        <div class="hourly-item">
          <div class="hourly-time">${timeStr}</div>
          <img src="${hour.icon}" alt="${hour.shortForecast}" class="hourly-icon">
          <div class="hourly-temp">${hour.temperature}°${hour.temperatureUnit}</div>
          <div class="hourly-condition">${hour.shortForecast}</div>
          <div class="hourly-wind">${hour.windSpeed} ${hour.windDirection}</div>
        </div>
      `;
        }).join('');

        const modalHTML = `
      <div class="weather-modal" id="hourly-modal">
        <div class="weather-modal-content">
          <div class="weather-modal-header">
            <h2>Hourly Forecast - ${dayName}</h2>
            <button class="weather-modal-close" onclick="document.getElementById('hourly-modal').remove()">&times;</button>
          </div>
          <div class="weather-modal-body">
            ${hourlyHTML}
          </div>
        </div>
      </div>
    `;

        // Remove existing modal if any
        const existingModal = document.getElementById('hourly-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to body
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Close modal when clicking outside
        const modal = document.getElementById('hourly-modal');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    displayError(message) {
        const container = document.getElementById('weather-widget-content');
        if (container) {
            container.innerHTML = `
        <div class="weather-error">
          <div class="error-icon">⚠️</div>
          <div class="error-message">${message}</div>
          <div class="weather-location">Goldsboro, NC</div>
        </div>
      `;
        }
    }
}

// Initialize weather widget when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WeatherWidget();
    });
} else {
    new WeatherWidget();
}
