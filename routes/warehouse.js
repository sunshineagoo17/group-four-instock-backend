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
        console.error('Error fetching warehouses:', error);
        res.status(500).send('Error fetching warehouses');
    }
});
//Endpoint to get a single warehouses
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
//Endpoint to get a list of inventories for a given warehouse
router.get('/:id/inventories', async (req,res)=>{
    try{
        const { id } = req.params;
        const inventorySearch = await knex('warehouses')
        .select('*')
        .where('id',id)
        .first();
        if(inventorySearch){
        const inventory = await knex('inventories')
        .select('id','item_name','category','status','quantity')
        .where('warehouse_id',id)
            res.status(200).json(inventory);
        }else{
            res.status(404).send('Error: Warehouse ID was not found');
        }
    }catch(error){
        res.status(500).send('Error fetching inventory list');
    }
});

// This regular expression handles phone numbers in various formats
const phoneRegex = /^\+?(\d{1,4})?[\s-]?(\(?\d{3}\)?)[\s-]?(\d{3})[\s-]?(\d{4})$/;

// Endpoint to post/create a new warehouse
router.post(
    '/',
    [
        // Validate request body fields
        body('warehouse_name').notEmpty().withMessage('Warehouse name is required'),
        body('address').notEmpty().withMessage('Address is required'),
        body('city').notEmpty().withMessage('City is required'),
        body('country').notEmpty().withMessage('Country is required'),
        body('contact_name').notEmpty().withMessage('Contact name is required'),
        body('contact_position').notEmpty().withMessage('Contact position is required'),
        // Validate that contact_phone is not empty and is a valid phone number
        body('contact_phone').notEmpty().withMessage('Contact phone is required') 
            .custom(value => phoneRegex.test(value) || Promise.reject('Invalid phone number')), 
        // Validate that contact_email is not empty and is a valid email address    
        body('contact_email').notEmpty().withMessage('Contact email is required')
            .isEmail().withMessage('Invalid email address')
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return 400 status code with error messages if validation fails
            return res.status(400).json({ errors: errors.array() });
        }

        // Get the validated data from the request body
        const warehouseData = req.body;

        try {          
            const [newWarehouseId] = await knex('warehouses').insert(warehouseData); // Insert the new warehouse
            const newWarehouse = await knex('warehouses').where({ id: newWarehouseId }).first(); // Retrieve the newly inserted warehouse by its ID
            const { created_at, updated_at, ...responseWarehouse } = newWarehouse; // Exclude created_at and updated_at from the response
            
            res.status(201).json(responseWarehouse); // Return 201 status code with the newly created warehouse data
        } catch (error) {
            res.status(500).json({ message: `Error creating new warehouse: ${error.message}` }); // Return 500 status code with error message if database insertion fails
        }
    }
);

module.exports = router;