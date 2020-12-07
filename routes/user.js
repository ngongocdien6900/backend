const express = require('express');
const route = express.Router();
const user = require('../controllers/user');

route.post('/googlelogin', user.postLoginGoogle);
route.post('/facebooklogin', user.postLoginFacebook);

route.put('/forgotpassword', user.postForgotPassword);
route.put('/resetpassword', user.postResetPassword);

module.exports = route;