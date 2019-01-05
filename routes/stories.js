const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 

const { ensureAuthenticated, ensureGuest } = require('../helpers/auth'); 

require('../models/Story'); 
require('../models/User'); 

const Story = mongoose.model('stories'); 
const User = mongoose.model('users'); 

router.get('/', (req, res) => {
    Story.find({status: 'public'})
        .populate('user')
        .sort({date: 'desc'})
        .then(stories => {
            res.render('stories/index', {
              stories: stories
            })
        })
        .catch(err => {
          console.log(error); 
        })
})

router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('stories/add');
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

// Show single story

router.get('/single/:id', (req, res) => {

    Story.findById(req.params.id)
          .populate('user')
          .populate('comments.commentUser')
          .then(story => {
              if(story.status === "public") {
                res.render('stories/single', { 
                  story: story 
                });
                  
              } else {
                // Se tiene que validar que el usuario esté loggeado para que no se trabe la aplicación
                if(req.user) {
                  if (story.user.id === req.user.id) {
                    res.render('stories/single', {
                      story: story
                    });
                  } else {
                    res.redirect('/stories');
                  }
                } else {
                  res.redirect('/stories'); 
                }
                
              }
          })
          .catch(err => {
            console.log(err); 
          })
});

// Edit Story Get 

router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Story.findById(req.params.id)
    .then(story => {
      if (story.user != req.user.id) {
        res.redirect('/dashboard')
      } else {
        res.render('stories/edit', {
          story: story
        });
      } 
    })
    .catch(err => {
      console.log(err);
    })
  
});

// Edit Story Put 

router.put('/:id', ensureAuthenticated, (req, res) => {
    let allowComments;
    let errors = [];

    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    // Edit a Story 
    if (!req.body.title) {
      errors.push({ text: 'Please add a title for your story' });
    } else if (!req.body.body) {
      errors.push({ text: 'Please add a body for your story' });
    }

    Story.findOne({
      _id: req.params.id
    }).then(story => {
      story.title = req.body.title;
      story.status = req.body.status;
      story.allowComments = allowComments;
      story.body = req.body.body; 
      story.save()
            .then(story => {
              res.redirect(`/dashboard`);
            })
    }).catch(err => {
      console.log('error', err); 
    })
});

// Delete Story

router.delete('/:id', ensureAuthenticated, (req, res) => {
  Story.deleteOne({
    _id: req.params.id
  }).then(() => {
      res.redirect('/dashboard'); 
  }).catch(err => {
      console.log(err); 
  })
})

// Add a comment 

router.post('/comment/:id', ensureAuthenticated, (req, res) => {
  let errors = [];

  if(!req.body.comment) {
    errors.push({text: "You can not add an empty comment"})
  }

    Story.findOne({
      _id: req.params.id
    }).then(story => {

        const newComment = {
          commentBody: req.body.comment,
          commentUser: req.user.id
        }
        story.comments.unshift(newComment)
        story.save()
             .then(story => {
               let id = story.id
               res.redirect(`/stories/single/${id}`);
             })
             .catch(err => {
               console.log(err)
             })
    }).catch(err => {
        console.log(err)
    })
});

// Filtrado de historias por autor

router.get('/user/:id', (req, res) => {
  Story.find({ 
    status: 'public',
    user: req.params.id
  })
    .populate('user')
    .sort({ date: 'desc' })
    .then(stories => {
      res.render('stories/user', {
        stories: stories
      })
    })
    .catch(err => {
      console.log(error);
    })
})

// historias del usuario 

router.get('/my', ensureAuthenticated, (req, res) => {

  Story.find({
    user: req.user.id
  })
    .populate('user')
    .sort({ date: 'desc' })
    .then(stories => {
      res.render('stories/my', {
        stories: stories
      })
    })
    .catch(err => {
      console.log(error);
    })

}); 

module.exports = router; 