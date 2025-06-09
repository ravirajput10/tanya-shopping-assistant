const express = require("express");
const router = express.Router();

const { login, getCustomerInfoById , customerAddAddress, signUp} = require("../controllers/accountController");

router.post("/customers/login", async (req, res) => {
    try {
        const result = await login(req); 
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error, error: error });
    }
});

router.get("/customers/:customerId", async (req, res) => {
    try {
        const result = await getCustomerInfoById(req); 
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error, error: error });
    }
});

router.post("/address/:customerId/:emailId", async (req, res) => {
    try {
        const result = await customerAddAddress(req); 
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error, error: error });
    }
});

router.post("/customers/signin", async (req, res) => {
    try {
        const result = await signUp(req); 
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error, error: error });
    }
});

module.exports = router;