require('dotenv').config();
const http = require('http');
const app = require('./app');
const { connectMongo } = require('./config/mongo');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectMongo();        // ✅ kết nối Mongo trước
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

start();
