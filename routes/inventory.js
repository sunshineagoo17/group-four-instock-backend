const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

// Endpoint to get the entire inventory list 
router.get('/', async (req, res) => {
    try {
        const inventoriesWithWarehouseName = await knex('inventories')
            .join('warehouses','warehouses.id','warehouse_id')
            .select(
                'inventories.id',
                'warehouses.warehouse_name',
                'inventories.item_name',
                'inventories.description',
                'inventories.category',
                'inventories.status',
                'inventories.quantity'
            );
        res.status(200).json(inventoriesWithWarehouseName);
    } catch (error) {
        res.status(500).send(`Error fetching inventories: ${error.message}`);
    }
});

// Endpoint to get a single inventory item 
router.get('/:id', async (req,res)=>{
    try{
        const selectedInventoryItem = await knex('inventories')
            .join('warehouses','warehouses.id','warehouse_id')
            .where({ 'inventories.id':req.params.id })
            .select(
                'inventories.id',
                'warehouses.warehouse_name',
                'inventories.item_name',
                'inventories.description',
                'inventories.category',
                'inventories.status',
                'inventories.quantity'
            );

        if (selectedInventoryItem.length === 0) {
            return res.status(404).send('Error: ID was not found');
        }

        // Return the first item as an object since we expect only one item
        res.status(200).json(selectedInventoryItem[0]);
    }catch(error){
        res.status(500).send(`Error fetching single inventory item: ${error.message}`);
    }
});

module.exports = router;
