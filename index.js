require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 8080;

app.use(express.json());
app.use(cors());

const inventoryRoutes = require('./routes/inventory');
const warehouseRoutes = require('./routes/warehouse');
const categoryRoutes = require('./routes/category');

app.use('/api/warehouses', warehouseRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/categories', categoryRoutes);

app.listen(port, () => {
  console.log(`hey buddy, I'm listening on PORT ${port}`);
});
