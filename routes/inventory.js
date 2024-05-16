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

//test it please, I did and I deleted id 70 ups
router.delete('/:id', async (req, res) =>{
    const{id} = req.params;

    try{
        const idExists = await knex('inventories').select('id').where({id}).first();
        if(!idExists){
            return res.status(404).send('Inventory not found');
        }
        await knex('inventories').where({id}).del();
        res.status(204).end();
    } catch(error){
        res.status(500).send('Error deliting inventory')
    }
})
module.exports = router;


