# Rideau Canal Dashboard - Angular Version

## Project Setup

This is an Angular application for the Rideau Canal Ice Monitoring Dashboard, using Express.js as a backend API server connected to Azure Cosmos DB.

### Directory Structure

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/         # Main dashboard component
│   │   │   ├── location-card/     # Location card component
│   │   │   ├── charts/            # Charts component (ng2-charts)
│   │   │   ├── header/            # Header component
│   │   │   └── footer/            # Footer component
│   │   ├── services/
│   │   │   └── dashboard.service.ts  # API service
│   │   ├── app.module.ts          # App module
│   │   ├── app.component.*        # Root component
│   ├── environments/              # Environment configurations
│   ├── styles.scss               # Global styles
│   ├── main.ts                   # Application bootstrap
│   ├── index.html                # Main HTML
├── server.js                     # Express server
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── angular.json                  # Angular CLI config
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Angular Application
```bash
npm run build
```

This creates an optimized production build in `dist/rideau-canal-dashboard/`

### 3. Start the Server
```bash
npm start
```

The dashboard will be available at `http://localhost:3000`

### Development Mode

For development with hot reload:
```bash
# Terminal 1: Build Angular in watch mode
npm run watch

# Terminal 2: Start Express server
npm run dev
```

## Features

- **Real-time Dashboard**: Displays current ice thickness, temperature, and snow accumulation
- **Location Cards**: Three monitoring locations (Dow's Lake, Fifth Avenue, NAC)
- **Historical Charts**: Ice thickness and temperature trends using Chart.js
- **Auto-refresh**: Updates every 30 seconds
- **Responsive Design**: Works on desktop and mobile devices

## API Endpoints

The backend Express server provides:

- `GET /api/latest` - Get latest data for all locations
- `GET /api/history/:location` - Get historical data for a specific location
- `GET /health` - Health check endpoint

## Technologies Used

### Frontend
- **Angular 17**: Modern web framework
- **ng2-charts**: Chart.js wrapper for Angular
- **RxJS**: Reactive programming
- **SCSS**: Styling

### Backend
- **Express.js**: Web server
- **Azure Cosmos DB**: Data storage
- **Node.js**: Runtime

## Environment Variables

Create a `.env` file in the root directory:

```
COSMOS_ENDPOINT=your_cosmos_endpoint
COSMOS_KEY=your_cosmos_key
COSMOS_DATABASE=RideauCanalDB
COSMOS_CONTAINER=SensorAggregations
PORT=3000
```

## Data Format

The Cosmos DB container expects documents with the following structure:

```json
{
  "location": "Dow's Lake",
  "timestamp": "2026-04-18T17:19:59.0000000Z",
  "avg_ice_thickness": 26.74,
  "min_ice_thickness": 1.23,
  "max_ice_thickness": 57.67,
  "avg_surface_temperature": -2.40,
  "min_surface_temperature": -13.06,
  "max_surface_temperature": 4.94,
  "max_snow_accumulation": 28.40,
  "avg_external_temperature": -8.17,
  "reading_count": 16
}
```

## Build & Deployment

### Production Build
```bash
npm run build
npm start
```

The Angular application is built to the `dist/` directory and served by Express.js.

### Docker (Optional)
For containerized deployment, create a `Dockerfile`:

```dockerfile
FROM node:18 as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY --from=builder /app/dist ./dist
COPY server.js .
COPY .env .
EXPOSE 3000
CMD ["npm", "start"]
```

## Troubleshooting

### Data not showing
1. Check that Cosmos DB credentials in `.env` are correct
2. Verify database and container names exist
3. Check browser console for API errors
4. Run `npm run health` to test connection

### Charts not rendering
1. Ensure ng2-charts is installed
2. Check that historical data API is returning valid data
3. Verify Chart.js is properly loaded

## License

MIT
