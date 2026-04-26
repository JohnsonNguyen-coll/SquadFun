import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';
import { startIndexer } from './services/indexer.js';
dotenv.config();
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });
const PORT = process.env.PORT || 3001;
// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);
// Routes
app.use('/api', apiRoutes);
// WebSocket subscriptions
const subscriptions = new Map();
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        try {
            const { type, address } = JSON.parse(message.toString());
            if (type === 'subscribe' && address) {
                if (!subscriptions.has(address)) {
                    subscriptions.set(address, new Set());
                }
                subscriptions.get(address).add(ws);
            }
        }
        catch (e) {
            console.error('WS Error:', e);
        }
    });
    ws.on('close', () => {
        subscriptions.forEach((clients) => clients.delete(ws));
    });
});
// Broadcast function
export const broadcast = (address, data) => {
    // Global feed
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
    // Specific token feed
    const subscribers = subscriptions.get(address);
    if (subscribers) {
        subscribers.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
};
httpServer.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    // Start the blockchain indexer
    try {
        await startIndexer();
    }
    catch (error) {
        console.error('Failed to start indexer:', error);
    }
});
//# sourceMappingURL=index.js.map