/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.table('inventories', function (table) {
    table.string('status').notNullable().defaultTo('In Stock');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table('inventories', function (table) {
    table.dropColumn('status');
  });
};
