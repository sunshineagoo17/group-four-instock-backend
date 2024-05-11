const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

// Endpoint to get all inventory - added here for testing purposes
router.get('/', async (req, res) => {
    try {
        const inventories = await knex('inventories').select('*');
        res.json(inventories);
    } catch (error) {
        console.error('Error fetching inventories:', error);
        res.status(500).send('Error fetching inventories');
    }
});

module.exports = router;