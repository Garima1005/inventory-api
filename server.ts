require('dotenv').config();
import app from './src/app'
import {createTables} from './src/db/schema'
import {seedDatabase} from './src/db/seed'


const PORT = process.env.PORT;

const startServer = async () => {
  createTables();        
  await seedDatabase();  

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();