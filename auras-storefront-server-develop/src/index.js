const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/auth.js");
const tanyaShoppingAssistant = require("./routes/tanyaShoppingAssistant.js");
const searchRoutes = require("./routes/search.js");
const category = require("./routes/category.js");
const fetchingLogo= require("./routes/fetchingLogo.js");
const account= require("./routes/account.js");
const order= require("./routes/order.js");
const productRoute = require("./routes/product.js")


dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Server is running" });
});
app.use("/api", authRoutes);
app.use("/api", tanyaShoppingAssistant);
app.use("/api", searchRoutes);
app.use("/api", category);
app.use("/api", fetchingLogo );
app.use("/api", account );
app.use("/api", order );
app.use("/api", productRoute );

const PORT = process.env.PORT || 4001;
app.listen(PORT, () =>
  console.log(`Server running on port http://localhost:${PORT}`)
);