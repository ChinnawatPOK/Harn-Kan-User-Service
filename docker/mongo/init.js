const database = process.env.MONGO_DATABASE;
const username = process.env.MONGO_APP_USERNAME;
const password = process.env.MONGO_APP_PASSWORD;

db = db.getSiblingDB(database);

db.createUser({
  user: username,
  pwd: password,

  roles: [
    {
      role: "readWrite",
      db: database,
    },
  ],
});
