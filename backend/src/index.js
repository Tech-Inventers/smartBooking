const app = require("./app");
const db = require("./models");
 
const PORT = process.env.PORT || 3000;
 
(async () => {
  try {
    // Creates tables in DB based on models
    await db.sequelize.sync({ alter: true });
 
    console.log("All models synced with the database.");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start:", err);
  }
})();