const express = require('express');
const route = express.Router();
const admin = require('../controllers/admin');
const message = require('../controllers/message');

//admin
route.post('/login', admin.postLogin);

route.post('/register', admin.postRegister);

route.put('/forgotpassword', admin.postForgotPassword);

route.put('/resetpassword', admin.postResetPassword);

route.get('/', admin.getAllConversation);

route.get('/message', message.getMessageByConversation);

module.exports = route;