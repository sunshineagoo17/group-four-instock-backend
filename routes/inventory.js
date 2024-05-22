const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));
const { body, validationResult } = require('express-validator');

// Validation middleware for inventory data
const validateInventory = [
  body('warehouse_id')
    .notEmpty()
    .withMessage('Warehouse ID is required')
    .isInt()
    .withMessage('Warehouse ID must be an integer'),
  body('item_name').notEmpty().withMessage('Item name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['In Stock', 'Out of Stock'])
    .withMessage('Invalid status value'),
  body('quantity').custom((value, { req }) => {
    if (req.body.status === 'In Stock') {
      if (value === undefined || value === null) {
        throw new Error('Quantity is required when status is "In Stock"');
      }
      if (!Number.isInteger(value) || value < 0) {
        throw new Error('Quantity must be a non-negative integer');
      }
    }
    return true;
  }),
];

// Endpoint to get the entire inventory list or filter by warehouse ID
router.get('/', async (req, res) => {
  const {
    warehouse_id,
    sort_by = 'item_name',
    order_by = 'asc',
    s,
  } = req.query;

  try {
    // Build the base query with sorting
    let query = knex('inventories')
      .join('warehouses', 'warehouses.id', 'warehouse_id')
      .select(
        'inventories.id',
        'warehouses.warehouse_name',
        'inventories.item_name',
        'inventories.description',
        'inventories.category',
        'inventories.status',
        'inventories.quantity'
      )
      .orderBy(sort_by, order_by);

    // Add warehouse_id filter
    if (warehouse_id) {
      query = query.where('warehouse_id', warehouse_id);
    }

    // Add search filter
    if (s) {
      query = query.where(function () {
        this.where('item_name', 'like', `%${s}%`)
          .orWhere('category', 'like', `%${s}%`)
          .orWhere('warehouses.warehouse_name', 'like', `%${s}%`)
          .orWhere('status', 'like', `%${s}%`)
          .orWhere('quantity', 'like', `%${s}%`);
      });
    }

    const inventoriesWithWarehouseName = await query;
    res.status(200).json(inventoriesWithWarehouseName);
  } catch (error) {
    res.status(500).send(`Error fetching inventories: ${error.message}`);
  }
});

// Endpoint to get a single inventory item
router.get('/:id', async (req, res) => {
  try {
    const selectedInventoryItem = await knex('inventories')
      .join('warehouses', 'warehouses.id', 'warehouse_id')
      .where({ 'inventories.id': req.params.id })
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
      return res.status(404).send('Inventory item not found');
    }

    res.status(200).json(selectedInventoryItem[0]);
  } catch (error) {
    res.status(500).send(`Error fetching inventory item: ${error.message}`);
  }
});

// Endpoint to delete a single inventory item
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const idExists = await knex('inventories')
      .select('id')
      .where({ id })
      .first();
    if (!idExists) {
      return res.status(404).send('Inventory item not found');
    }
    await knex('inventories').where({ id }).del();
    res.status(204).end();
  } catch (error) {
    res.status(500).send(`Error deleting inventory item: ${error.message}`);
  }
});

// Endpoint to add a new inventory item
router.post('/', validateInventory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { warehouse_id, item_name, description, category, status, quantity } =
    req.body;

  try {
    // Check if warehouse_id exists
    const warehouseExists = await knex('warehouses')
      .where({ id: warehouse_id })
      .first();
    if (!warehouseExists) {
      return res.status(400).json({ message: 'Invalid warehouse_id' });
    }

    // Insert new inventory item
    await knex('inventories').insert({
      warehouse_id,
      item_name,
      description,
      category,
      status,
      quantity: status === 'In Stock' ? quantity : 0,
    });
    res.status(201).json({ message: 'Inventory item created successfully' });
  } catch (error) {
    res.status(500).send(`Error adding inventory item: ${error.message}`);
  }
});

// Endpoint to update an inventory item
router.put('/:id', validateInventory, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { warehouse_id, item_name, description, category, status, quantity } =
    req.body;

  try {
    // Check if inventory ID exists
    const inventoryExists = await knex('inventories').where({ id }).first();
    if (!inventoryExists) {
      return res.status(404).send('Inventory item not found');
    }

    // Check if warehouse_id exists
    const warehouseExists = await knex('warehouses')
      .where({ id: warehouse_id })
      .first();
    if (!warehouseExists) {
      return res.status(400).send('Invalid warehouse_id');
    }

    // Update the inventory item
    await knex('inventories')
      .where({ id })
      .update({
        warehouse_id,
        item_name,
        description,
        category,
        status,
        quantity: status === 'In Stock' ? quantity : 0,
      });

    // Fetch the updated inventory item
    const updatedInventory = await knex('inventories')
      .join('warehouses', 'warehouses.id', 'warehouse_id')
      .where({ 'inventories.id': id })
      .select(
        'inventories.id',
        'warehouses.warehouse_name',
        'inventories.item_name',
        'inventories.description',
        'inventories.category',
        'inventories.status',
        'inventories.quantity'
      )
      .first();

    res.status(200).json(updatedInventory);
  } catch (error) {
    res.status(500).send(`Error updating inventory item: ${error.message}`);
  }
});

module.exports = router;