const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));
const { body, validationResult } = require('express-validator');
const validator = require('validator');

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
        res.status(500).send(`Error fetching warehouses: ${error.message}`);
    }
});

// Endpoint to get a single warehouses
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
        res.status(500).send(`Error fetching warehouse: ${error.message}`);
    }
});

// Endpoint to get a list of inventories for a given warehouse
router.get('/:id/inventories', async (req,res)=>{
    const { id } = req.params;
    try {
        // Check if the warehouse exists
        const warehouse = await knex('warehouses').select('id').where('id', id).first();
        if (!warehouse) {
            return res.status(404).send('Warehouse not found');
        }
        // Get the inventories for the given warehouse ID
        const inventories = await knex('inventories')
            .select(
                'id',
                'item_name',
                'category',
                'status',
                'quantity'
            )
            .where('warehouse_id', id);

        res.status(200).json(inventories);
    } catch (error) {
        res.status(500).send(`Error fetching inventory list: ${error.message}`);
    }
});

module.exports = router;