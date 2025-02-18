import express from 'express';
import cors from 'cors';
import { DatabaseService } from './database/DatabaseService';

async function startServer() {
  try {
    await DatabaseService.getInstance().connect();
    
    const app = express();
    app.use(express.json());
    app.use(cors());
    
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });

    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 