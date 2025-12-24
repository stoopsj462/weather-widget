# Weather Widget

A modern, sleek weather widget that displays current conditions and hourly forecasts for Goldsboro, NC using the National Weather Service API.

## Features

- **Real-time Weather Data**: Displays current temperature, conditions, and wind information
- **Hourly Forecast**: Shows upcoming hourly weather predictions
- **Auto-refresh**: Automatically updates every 30 minutes
- **Modern UI**: Dark theme with smooth animations and hover effects
- **Responsive Design**: Adapts to different screen sizes with horizontal scrolling
- **No API Key Required**: Uses the free National Weather Service API

## Demo

The widget displays:
- Current temperature and weather conditions
- Weather icon with refresh functionality
- Wind speed and direction
- Hourly forecast timeline with icons and temperatures

## Technologies Used

- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with gradients, animations, and flexbox
- **Vanilla JavaScript**: ES6+ class-based architecture
- **National Weather Service API**: Free weather data source

## Installation

1. Clone or download this repository
2. Open `index1.html` in a web browser
3. The widget will automatically load weather data for Goldsboro, NC

```bash
git clone <your-repo-url>
cd weather-widget
open index1.html
```

## File Structure

```
weather-widget/
├── index1.html          # Main HTML file
├── weather-widget.js    # JavaScript logic and API integration
├── weather-widget.css   # Styling and animations
└── README.md           # This file
```

## Customization

### Change Location

To display weather for a different location, modify the coordinates in `weather-widget.js`:

```javascript
constructor() {
    this.lat = 35.3849;  // Change latitude
    this.lon = -77.9928; // Change longitude
    // ... rest of code
}
```

To find coordinates for your location:
1. Visit [OpenStreetMap](https://www.openstreetmap.org/)
2. Search for your location
3. Right-click and select "Show address" to see coordinates

### Adjust Refresh Interval

Change the auto-refresh frequency in `weather-widget.js`:

```javascript
this.refreshInterval = 30 * 60 * 1000; // 30 minutes (in milliseconds)
```

### Customize Styling

Edit `weather-widget.css` to modify:
- Color scheme (currently dark theme)
- Widget dimensions and spacing
- Animation effects
- Font sizes and styles

## How It Works

1. **Initialization**: On load, the widget fetches the grid endpoint from NWS API based on coordinates
2. **Data Retrieval**: Retrieves hourly forecast data from the appropriate NWS grid
3. **Display**: Renders current conditions and hourly forecast with appropriate icons
4. **Auto-refresh**: Updates data every 30 minutes automatically
5. **Manual Refresh**: Click the weather icon to manually refresh data

## API Usage

This widget uses the [National Weather Service API](https://www.weather.gov/documentation/services-web-api), which:
- Requires no API key
- Provides free weather data for US locations
- Updates regularly with official NWS forecasts
- Includes detailed hourly and daily forecasts

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Any modern browser with ES6+ support

## Known Limitations

- Only works for US locations (NWS API limitation)
- Requires internet connection
- Weather icons depend on NWS API availability

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

See LICENSE file for details.

## Acknowledgments

- Weather data provided by [National Weather Service](https://www.weather.gov/)
- Built with vanilla JavaScript (no frameworks required)

## Support

For issues or questions, please open an issue in the repository.

---

**Last Updated**: December 2025
