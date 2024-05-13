const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

// Endpoint to get all warehouses - 
router.get('/', async (req, res) => {
    try {
        const warehouses = await knex('warehouses').select('*');
        res.json(warehouses);
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
            res.status(200).json(warehouse);
        } else {
            res.status(404).send('Warehouse not found');
        }
    } catch (error) {
        console.error('Error fetching warehouse:', error);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;