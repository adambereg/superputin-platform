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
  }
};
