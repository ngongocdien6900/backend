const express = require('express');
const route = express.Router();
const admin = require('../controllers/admin');


//admin
route.post('/login', admin.postLogin);

route.post('/register', admin.postRegister);

route.put('/forgotpassword', admin.postForgotPassword);

route.put('/resetpassword', admin.postResetPassword);

route.get('/', admin.getAllConversation);

module.exports = route;