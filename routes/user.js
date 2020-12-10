const express = require('express');
const route = express.Router();
const user = require('../controllers/user');

//user
route.post('/googlelogin', user.postLoginGoogle);
route.post('/facebooklogin', user.postLoginFacebook);




//admin
route.post('/admin/login', user.postLogin);

route.post('/admin/register', user.postRegister);

route.put('/admin/forgotpassword', user.postForgotPassword);

route.put('/admin/resetpassword', user.postResetPassword);

module.exports = route;