const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

// Endpoint to get all warehouses - added here for testing purposes
router.get('/', async (req, res) => {
    try {
        const warehouses = await knex('warehouses').select('*');
        res.json(warehouses);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).send('Error fetching warehouses');
    }
});

// GET endpoint to fetch all warehouses brotha
router.get('/warehouses', async (req, res) => {
    try {
        const warehouses = await knex('warehouses').select('*');
        res.status(200).json(warehouses);
    } catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).send('Error fetching warehouses');
    }
});


module.exports = router;