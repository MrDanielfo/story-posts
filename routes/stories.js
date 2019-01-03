const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 

const { ensureAuthenticated, ensureGuest } = require('../helpers/auth'); 

require('../models/Story'); 
require('../models/User'); 

const Story = mongoose.model('stories'); 
const User = mongoose.model('users'); 

router.get('/', (req, res) => {
    res.render('stories/index');
})

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
});

router.get('/edit', ensureAuthenticated, (req, res) => {
    res.render('stories/edit');
});

/* post stories */ 

router.post('/', ensureAuthenticated, (req, res) => {
  // Validando el checkin
  let allowComments;
  let errors = [];

  if(req.body.allowComments) {
      allowComments = true;
  } else {
    allowComments = false; 
  }

  // Create a Story 
  if (!req.body.title) {
    errors.push({ text: 'Please add a title for your story' });
  } else if (!req.body.body) {
    errors.push({ text: 'Please add a body for your story' });
  } 

  if (errors.length > 0) {
    res.render('stories/add', {
      errors: errors,
      title: req.body.title,
      body: req.body.body
    });
  } else {
    const newStory = {
      title: req.body.title,
      body: req.body.body,
      status: req.body.status,
      allowComments: allowComments,
      user: req.user.id
    }

    new Story(newStory).save().then(story => {
      let id = story.id
      res.redirect(`/stories/single/${id}`);
    });
  }

});

router.get('/single/:id', (req, res) => {

    Story.findById(req.params.id, (err, story) => {
      User.findById(story.user, function (err, user) {
        if (err) {
          console.log(err);
        } else {
          res.render('stories/single', {
            story: story,
            author: user.firstName
          });
        }
      })

    });

});

module.exports = router; 