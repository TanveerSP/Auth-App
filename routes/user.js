const express = require('express')
const router = express.Router();

const { login, signup } = require("../Controller/Auth");
const { auth, isAdmin, isStudent } = require("../middleware/auth")

router.post("/signup", signup);
router.post("/login", login);

// testing protected router for single middleware
router.get("/test", auth, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the protected for Student',
    })
})

// Protected Router
router.get("/student", auth, isStudent, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the protected for Student',
    })
})

router.get("/Admin", auth, isAdmin, (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to the protected for Admin',
    })
})

module.exports = router;