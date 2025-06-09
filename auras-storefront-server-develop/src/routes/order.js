const express = require("express");
const router = express.Router();

const { getOrderById } = require("../controllers/orderController");

router.get("/order/:customerId", async (req, res) => {
    try {
        const result = await getOrderById(req); 
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error, error: error });
    }
});

module.exports = router;