const express = require('express');
const userController = require('../controllers/userControllers');


// creating router instance or sub-app that is use as a specific domain for specefic urls
// it is create to modelize the app routes
const usersRouter =  express.Router();

// users
usersRouter.route('').get(userController.getUsers)   // get users
usersRouter.route('').post(userController.addUser);   //add a user

usersRouter.route('/:id').patch(userController.updateUser)   // update a user
usersRouter.route('/:id').delete(userController.deleteUser)  // delete a user
usersRouter.route('/:id').get(userController.getUser);       // get a user

module.exports = usersRouter;
