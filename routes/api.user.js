'use strict'

module.exports = (router) => {
    //requiring-api-auth-file-for-authetication
    const auth = require('../helpers/api-auth');

    const UserVal=require("../helpers/joi_validator");

    const UsrCtrl=require('../controllers/controller.user');

    const UsrUpld = require('../helpers/common-service');

    //Login 
    router.post('/login', auth.isAuthenticated, UsrCtrl.Login);

    //Signup
    router.post('/register', auth.isAuthenticated, UsrCtrl.Registration);

    //ReferUser

    router.post('/refer-user', auth.isAuthenticated,auth.checkToken,UsrCtrl.ReferUser);

    //Parent List


    router.get('/parent-list', auth.isAuthenticated,auth.checkToken,UsrCtrl.ParentList);

    //Child List

    router.get('/child-list', auth.isAuthenticated,auth.checkToken,UsrCtrl.ChildList);



    return router;
}