const express = require('express');
const router = express.Router();
const knex = require('knex')(require('../knexfile'));

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await knex('categories').select('*');
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching categories: ${error.message}` });
  }
});

// GET a single category by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await knex('categories').where({ id }).first();
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error fetching category: ${error.message}` });
  }
});

// POST a new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const [newCategoryId] = await knex('categories').insert({ name });
    const newCategory = await knex('categories')
      .where({ id: newCategoryId })
      .first();
    res.status(201).json(newCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error creating category: ${error.message}` });
  }
});

// PUT to update a category
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    await knex('categories').where({ id }).update({ name });
    const updatedCategory = await knex('categories').where({ id }).first();
    res.json(updatedCategory);
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error updating category: ${error.message}` });
  }
});

// DELETE a category
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await knex('categories').where({ id }).del();
    res.status(204).end();
  } catch (error) {
    res
      .status(500)
      .json({ message: `Error deleting category: ${error.message}` });
  }
});

module.exports = router;