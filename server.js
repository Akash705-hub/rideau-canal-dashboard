/**
 * Rideau Canal Monitoring Dashboard - Express Server
 * Serves Angular frontend + Cosmos DB API backend
 */

const express = require('express');
const { CosmosClient } = require('@azure/cosmos');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve Angular build
const distRootPath = path.join(__dirname, 'dist/rideau-canal-dashboard');
const browserDistPath = path.join(distRootPath, 'browser');
const staticRoot = fs.existsSync(browserDistPath) ? browserDistPath : distRootPath;

app.use(express.static(staticRoot));

// ===================== Cosmos DB Setup =====================
const cosmosClient = new CosmosClient({
    endpoint: process.env.COSMOS_ENDPOINT,
    key: process.env.COSMOS_KEY
});

const database = cosmosClient.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

// ===================== Helpers =====================
function mapCosmosRecord(item) {
    return {
        location: item.location,
        timestamp: item.timestamp,

        avgIceThickness: item.avg_ice_thickness,
        maxIceThickness: item.max_ice_thickness,
        minIceThickness: item.min_ice_thickness,

        avgSurfaceTemperature: item.avg_surface_temperature,
        maxSurfaceTemperature: item.max_surface_temperature,
        minSurfaceTemperature: item.min_surface_temperature,

        avgSnowAccumulation: item.max_snow_accumulation,
        maxSnowAccumulation: item.max_snow_accumulation,
        minSnowAccumulation: item.min_snow_accumulation,

        avgExternalTemperature: item.avg_external_temperature,
        maxExternalTemperature: item.max_external_temperature,
        minExternalTemperature: item.min_external_temperature,
    };
}

// ===================== /api/latest =====================
app.get('/api/latest', async (req, res) => {
    console.log("/api/latest called...");

    try {
        console.log("Using Cosmos endpoint:", process.env.COSMOS_ENDPOINT);
        console.log("Database:", process.env.COSMOS_DATABASE);
        console.log("Container:", process.env.COSMOS_CONTAINER);

        const locations = ["Dow's Lake", "Fifth Avenue", "NAC"];
        const results = [];

        for (const location of locations) {
            console.log(`\n=============================`);
            console.log(`FETCHING LATEST FOR: ${location}`);
            console.log("=============================\n");

            const querySpec = {
                query: "SELECT * FROM c WHERE c.location = @location",
                parameters: [{ name: "@location", value: location }]
            };

            console.log("QUERY SPEC:", JSON.stringify(querySpec, null, 2));

            let queryResult;
            try {
                queryResult = await container.items.query(querySpec).fetchAll();
            } catch (err) {
                console.error(`Cosmos query failed for ${location}:`, err);
                continue;
            }

            const resources = queryResult.resources;
            console.log(`Returned items count for ${location}:`, resources.length);

            if (resources.length === 0) {
                console.log(`No records found for ${location}`);
                continue;
            }

            console.log("First record structure:", Object.keys(resources[0]));

            // Sort newest → oldest
            resources.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            const latest = resources[0];
            console.log("Latest timestamp:", latest.timestamp);

            results.push(mapCosmosRecord(latest));
        }

        console.log("\nFINAL RESULT:", JSON.stringify(results, null, 2));

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            data: results
        });

    } catch (error) {
        console.error("CRITICAL ERROR in /api/latest:", error);
        res.status(500).json({ success: false, error: "Failed to fetch latest data" });
    }
});

// ===================== /api/history/:location =====================
app.get("/api/history/:location", async (req, res) => {
    try {
        const location = decodeURIComponent(req.params.location);

        const querySpec = {
            query: "SELECT * FROM c WHERE c.location = @location ORDER BY c.timestamp DESC",
            parameters: [{ name: "@location", value: location }],
        };

        const { resources } = await container.items.query(querySpec).fetchAll();
        const mapped = resources.map(mapCosmosRecord);

        res.json({ success: true, data: mapped });

    } catch (error) {
        console.error("ERROR /api/history:", error);
        res.status(500).json({ success: false, error: "Failed to fetch history" });
    }
});

// ===================== Root + Health =====================
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        cosmosdb: {
            endpoint: process.env.COSMOS_ENDPOINT ? 'configured' : 'missing',
            database: process.env.COSMOS_DATABASE,
            container: process.env.COSMOS_CONTAINER
        }
    });
});

// Serve Angular index.html for the app root
app.get('/', (req, res) => {
    res.sendFile(path.join(staticRoot, 'index.html'));
});

// Serve Angular index.html for all non-API routes (client-side routing)
app.get('/*splat', (req, res) => {
    res.sendFile(path.join(staticRoot, 'index.html'));
});

// ===================== Start Server =====================
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
