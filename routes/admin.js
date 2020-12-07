const express = require('express');
const route = express.Router();
const admin = require('../controllers/admin');


route.post('/login', admin.postLogin);

route.post('/register', admin.postRegister);

route.put('/forgotpassword', admin.postForgotPassword);

route.put('/resetpassword', admin.postResetPassword);

module.exports = route;