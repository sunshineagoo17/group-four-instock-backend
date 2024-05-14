const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

router.get('/', async (req, res) => {
    try {
        const inventoriesWithWarehouseName = await knex('inventories')
        .join('warehouses','warehouses.id','warehouse_id')
        .select('inventories.id',
        'warehouses.warehouse_name',
        'inventories.item_name',
        'inventories.description',
        'inventories.category',
        'inventories.status',
        'inventories.quantity');
        res.json(inventoriesWithWarehouseName);
    } catch (error) {
        res.status(500).send('Error fetching inventories');
    }
});

module.exports = router;