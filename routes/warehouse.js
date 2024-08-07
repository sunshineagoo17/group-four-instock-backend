const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));
const { body, validationResult } = require('express-validator');

// Utility function to sanitize search term
const cleanSearchInput = (term) => {
  return term.replace(/[^a-zA-Z0-9]/g, '');
};

// Phone number validation regex
const phoneRegex =
  /^\+?(\d{1,4})?[\s-]?(\(?\d{3}\)?)[\s-]?(\d{3})[\s-]?(\d{4})$/;

// Validation middleware for warehouse data
const validateWarehouse = [
  body('warehouse_name').notEmpty().withMessage('Warehouse name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('contact_name').notEmpty().withMessage('Contact name is required'),
  body('contact_position')
    .notEmpty()
    .withMessage('Contact position is required'),
  body('contact_phone')
    .notEmpty()
    .withMessage('Contact phone is required')
    .custom(
      (value) =>
        phoneRegex.test(value) || Promise.reject('Invalid phone number')
    ),
  body('contact_email')
    .notEmpty()
    .withMessage('Contact email is required')
    .isEmail()
    .withMessage('Invalid email address'),
];

// Custom sorting logic for contact information
const sortContactInformation = (a, b, sortOrder) => {
  const aPhone = a.contact_phone || '';
  const bPhone = b.contact_phone || '';
  const aEmail = a.contact_email || '';
  const bEmail = b.contact_email || '';

  if (aPhone < bPhone) return -1 * sortOrder;
  if (aPhone > bPhone) return 1 * sortOrder;
  if (aEmail < bEmail) return -1 * sortOrder;
  if (aEmail > bEmail) return 1 * sortOrder;
  return 0;
};

// Endpoint to get all warehouses
router.get('/', async (req, res) => {
  const { sort_by = 'warehouse_name', order_by = 'asc', s } = req.query;

  try {
    let query = knex('warehouses');

    // Add search filter
    if (s) {
      const cleanedUpTerm = cleanSearchInput(s);
      query = query.where(function () {
        this.where('warehouse_name', 'like', `%${s}%`)
          .orWhere('address', 'like', `%${s}%`)
          .orWhere('city', 'like', `%${s}%`)
          .orWhere('country', 'like', `%${s}%`)
          .orWhere('contact_name', 'like', `%${s}%`)
          .orWhere(
            knex.raw(
              "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(contact_phone, ' ', ''), '(', ''), ')', ''), '-', ''), '+', '')"
            ),
            'like',
            `%${cleanedUpTerm}%`
          )
          .orWhere('contact_email', 'like', `%${s}%`);
      });
    }

    const warehouses = await query.select('*');

    // Sort warehouses based on the provided criteria
    const sortedWarehouses = warehouses.sort((a, b) => {
      const sortOrder = order_by === 'asc' ? 1 : -1;

      if (sort_by === 'contact_information') {
        return sortContactInformation(a, b, sortOrder);
      }

      const aValue = a[sort_by] || '';
      const bValue = b[sort_by] || '';
      if (aValue < bValue) return -1 * sortOrder;
      if (aValue > bValue) return 1 * sortOrder;
      return 0;
    });

    const modifiedWarehouses = sortedWarehouses.map((warehouse) => {
      const { created_at, updated_at, ...rest } = warehouse;
      return rest;
    });

    res.json(modifiedWarehouses);
  } catch (error) {
    res.status(500).send(`Error fetching warehouses: ${error.message}`);
  }
});

// Endpoint to get a single warehouse
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const warehouse = await knex('warehouses')
      .select('*')
      .where('id', id)
      .first();
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
router.get('/:id/inventories', async (req, res) => {
  const { id } = req.params;
  const { sort_by = 'item_name', order_by = 'asc' } = req.query;

  try {
    // Check if the warehouse exists
    const warehouse = await knex('warehouses')
      .select('id')
      .where('id', id)
      .first();
    if (!warehouse) {
      return res.status(404).send('Warehouse not found');
    }
    // Get the inventories for the given warehouse ID
    const inventories = await knex('inventories')
      .select('id', 'item_name', 'category', 'status', 'quantity')
      .where('warehouse_id', id)
      .orderBy(sort_by, order_by);

    res.status(200).json(inventories);
  } catch (error) {
    res.status(500).send(`Error fetching inventory list: ${error.message}`);
  }
});

// Endpoint to create a new warehouse
router.post('/', validateWarehouse, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Get the validated data from the request body
  const warehouseData = req.body;

  try {
    const [newWarehouseId] = await knex('warehouses').insert(warehouseData);
    const newWarehouse = await knex('warehouses')
      .where({ id: newWarehouseId })
      .first();
    const { created_at, updated_at, ...responseWarehouse } = newWarehouse;

    res.status(201).json({ id: newWarehouseId, ...responseWarehouse });
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error creating new warehouse: ${error.message}` });
  }
});

// Endpoint to delete a warehouse
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the warehouse exists
    const warehouseExists = await knex('warehouses').where({ id }).first();
    if (!warehouseExists) {
      return res.status(404).send('Warehouse not found');
    }

    // Delete inventory items associated with the warehouse
    await knex('inventories').where({ warehouse_id: id }).del();

    // Delete the warehouse
    await knex('warehouses').where({ id }).del();

    res.status(204).send();
  } catch (error) {
    res.status(500).send(`Error deleting warehouse: ${error.message}`);
  }
});

// Endpoint to edit a warehouse
router.put('/:id', validateWarehouse, async (req, res) => {
  const { id } = req.params;
  const warehouseData = req.body;
  const errors = validationResult(req);

  // Check validation of edit request
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if the warehouse exists
    const warehouse = await knex('warehouses').where({ id }).first();

    if (!warehouse) {
      return res.status(404).json({ message: 'Warehouse not found' });
    }

    // Update the warehouse details in the database
    await knex('warehouses').where({ id }).update(warehouseData);

    // Return warehouse details that have been updated
    const allNewWarehouseDetails = await knex('warehouses')
      .where({ id })
      .first();
    const { created_at, updated_at, ...responseWarehouse } =
      allNewWarehouseDetails;

    res.status(200).json(responseWarehouse);
  } catch (error) {
    res.status(500).send(`Error updating new warehouse: ${error.message}`);
  }
});

module.exports = router;