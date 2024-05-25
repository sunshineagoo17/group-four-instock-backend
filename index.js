require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Sets the port from the environmental variables or default to 8080
const port = process.env.PORT || 8080;

// Middleware to parse JSON request bodies
app.use(express.json());
app.use(cors());

// Imports route handlers
const inventoryRoutes = require('./routes/inventory');
const warehouseRoutes = require('./routes/warehouse');
const categoryRoutes = require('./routes/category');

// Defines the routes 
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(port, () => {
  console.log(`Hey buddy, I'm listening on PORT ${port}.`);
});