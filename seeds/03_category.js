/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    // Deletes ALL existing entries
    await knex('categories').del();
    await knex('categories').insert([
      { id: 1, name: 'Electronics' },
      { id: 2, name: 'Gear' },
      { id: 3, name: 'Apparel' },
      { id: 4, name: 'Accessories' },
      { id: 5, name: 'Health' },
    ]);
  };
  