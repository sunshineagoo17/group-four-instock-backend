const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

// Endpoint to get all warehouses 
router.get('/', async (req, res) => {
    try {
        const warehouses = await knex('warehouses').select('*');
        const modifiedWarehouses = warehouses.map(warehouse => {
            
            const { created_at, updated_at, ...rest } = warehouse;
            return rest; // only include necessary fields
        });
        res.json(modifiedWarehouses);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).send('Error fetching warehouses');
    }
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const warehouse = await knex('warehouses').select('*').where('id', id).first();
        if (warehouse) {
            
            const { created_at, updated_at, ...responseWarehouse } = warehouse;
            res.status(200).json(responseWarehouse);
        } else {
            res.status(404).send('Warehouse not found');
        }
    } catch (error) {
        console.error('Error fetching warehouse:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/:id/inventories', async (req,res)=>{

    try{
    const { id } = req.params
    const inventory = await knex('warehouses')
    .select('inventories.id','item_name','category','status','quantity')
    .join('inventories','warehouses.id','warehouse_id')
    .where('warehouse_id',id);
    if(inventory.length === 0){
        res.status(404).send(`Error: Warehouse ID was not found`);
    }else{
        res.status(200).json(inventory);
    }
    }catch(error){
        res.status(500).send(`Error fetching inventory list`);
}
    
})

module.exports = router;