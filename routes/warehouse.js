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

module.exports = router;