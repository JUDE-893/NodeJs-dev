const express = require('express');
const userController = require('../controllers/userControllers');
const authController = require('../controllers/authControllers');


// creating router instance or sub-app that is use as a specific domain for specefic urls
// it is create to modelize the app routes
const usersRouter =  express.Router();

// users
usersRouter.route('').get(userController.getUsers)   // get users

//protected routes
usersRouter.use(authController.protect)

usersRouter.route('').post(userController.addUser);   //add a user
usersRouter.route('/update-user').patch(userController.updateUser)   // update a user
usersRouter.route('/password-update').patch(userController.updateUserPassword)   // update user password
usersRouter.route('/delete-user').delete(userController.deleteUser)  // delete a user
usersRouter.route('/delete-user-immidiatly').delete(authController.restrict('admin'), userController.deleteImmidiatly)  // delete a user immidatly
usersRouter.route('/:id').get(userController.userIdInject, userController.getUser);       // get the user profile
usersRouter.route('/profile').get(userController.getUser);       // get a user profile

module.exports = usersRouter;
