require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const app = express(); 

const port = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());

const inventoryRoutes = require('./routes/inventory'); 
const warehouseRoutes = require('./routes/warehouse');

app.use('/',warehouseRoutes);

app.use('/',inventoryRoutes);

app.listen(port,()=>{
    console.log(`hey buddy, I'm listening on PORT ${port}`);
});