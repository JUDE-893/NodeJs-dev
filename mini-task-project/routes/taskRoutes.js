const express = require('express');
const taskControllers = require('../controllers/taskControllers');
const authControllers = require('../controllers/authControllers');
const reviewsRouter = require('./reviewRoutes');


// creating router instance or sub-app that is use as a specific domain for specefic urls
// it is create to modelize the app routes
const router =  express.Router();

// router.param('id',taskControllers.checkID)

// nesting review routes
router.use('/:taskId/reviews', reviewsRouter);

// principal routes
// public routes
router.route('')
  .get(taskControllers.getTasks);

router.route('/:id') // get a task
  .get(taskControllers.getTask);

// protected routes & reserved to the admin and lead guid only
router.use(authControllers.protect, authControllers.restrict("admin","manager"))

router.route('/:id')
  .patch(taskControllers.updateTask);   // update a task

router.route('')
  .post(taskControllers.addTask);  //add a task

router.route('/:id')
  .delete(taskControllers.deleteTask);  // delete a task


module.exports = router;
