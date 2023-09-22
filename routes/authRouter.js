const express = require('express');
const authRouter = express.Router();
const authController = require('../controllers/authController');
const { verifyJWT } = require('../middlewares/verifyJWT');

authRouter.post('/register', authController.handleRegister);
authRouter.post('/login', authController.handleLogin);
authRouter.post('/add-contact-info', verifyJWT, authController.addContactInfo);

module.exports = { authRouter }