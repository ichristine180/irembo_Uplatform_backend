# Irembo_Uplatform_backend

## Built With
- Node.js
- Express.js
- PostgreSQL
- Sequelize
- Redis

## Getting Started
To get a local copy up and running, follow these simple steps:

1. Clone this repo: `https://github.com/ichristine180/irembo_Uplatform_backend.git`
2. Navigate into the project directory.
3. Create a file called `.env` and copy the variables from `.env-template`. Initialize all the environment variables.
4. Install Redis on your system by following the official Redis installation instructions for your operating system. Visit the Redis website at: https://redis.io/
5. Run `npm install` or `yarn install` to install all the required packages.
6. If the packages are installed successfully, run `node dbSync.js` to create all the tables.
7. Start the Redis server.
8. Finally, run `npm start` to start the server.

## Usage
You can now use any API development tool like Postman to test the endpoints.

NOTE: The server will be running on port 3000 if you didn't specify it in the `.env` file as mentioned above.

Make sure to have Redis installed and running before starting the server. Redis is used for caching or other purposes in this project, and it's required for proper functionality.

