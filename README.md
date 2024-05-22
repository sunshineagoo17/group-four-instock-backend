## Create Database
Before running the migrations, you need to set up your environment variables and create your database in your local repository.

1. **Environmental Variables**: Create an `.env` file in the root directory of your project and add the following variables:
    PORT=8080
    CORS_ORIGIN=http://localhost:3000
    DB_HOST=127.0.0.1
    DB_LOCAL_DBNAME=instock
    DB_LOCAL_USER=root
    DB_LOCAL_PASSWORD=<yourpassword>

2. **Database Name**: To keep things simple, we'll go with 'instock'.

3. **Using Command Line**:
   - If you're using MySQL, you can create the database using the following command:
     mysql -u root -p
     CREATE DATABASE instock;
     USE instock;

4. ** Run Migrations and Seeds**:
Once the database is created, you'll need to run the database migrations to set up the necessary tables and schema.

a. **Run Migrations**: npx knex migrate:latest
b. **Run Seeds**: npx knex seed:run

These commands will execute the migration and seed files located in the `migrations` and `seeds` folders of your project, respectively, and set up the database with initial data.