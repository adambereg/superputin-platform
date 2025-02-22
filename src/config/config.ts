export const config = {
  database: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/superputin',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },
  ton: {
    endpoint: process.env.TON_ENDPOINT || 'https://testnet.toncenter.com/api/v2/jsonRPC',
    network: process.env.TON_NETWORK || 'testnet'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'noreply@superputin.com'
  },
  app: {
    url: process.env.APP_URL || 'http://localhost:5173',
    apiUrl: process.env.API_URL || 'http://localhost:3000/api',
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: '7d'
  }
};
