var express = require('express');
var router = express.Router();
var Poll = require('../models/poll');

router.get('/api/polls', function(req, res){
  var query = {};

  // Filter by currently logged in users
  if (req.user && req.query.filter && req.query.filter == 'mine') {
    query._id = req.user.id;
  }

  // Get the poll with creators information
  Poll.find().populate('_creator').exec(function(error, polls){
    if (error) {
      return res.status(500).send(error);
    }

    res.json(polls.map(function(poll){
      return {
        id: poll.id,
        name: poll.name,
        choices: poll.choices,
        author: {
          username: poll._creator.github_username
        }
      }
    }));
  });
});

router.get('/api/polls/:id', function(req, res){
  // Get poll with creators information
  Poll.findById(req.params.id).populate('_creator').exec(function(error, poll){
    if (error) {
      return res.status(500).send(error);
    }

    res.json({
      id: poll.id,
      name: poll.name,
      choices: poll.choices,
      votes: poll.votes,
      author: {
        username: poll._creator.github_username
      }
    });
  });
});

router.delete('/api/polls/:id', function(req, res){
  // Check that the user is logged in
  if (!req.user) {
    return res.status(401).json({ error: 'You are not logged in' });
  }

  Poll.findById(req.params.id).populate('_creator').exec(function(error, poll){
    if (error) {
      return res.status(500).send(error);
    }

    // Check that the user owns the poll
    if (req.user.id !== poll._creator.id) {
      return res.status(403).json({ error: 'You do not own this poll' });
    }

    // Delete poll
    Poll.remove({ _id: req.params.id }, function(error){
      if (error) {
        return res.status(400).send(error);
      }

      res.json({ success: 'Poll deleted' });
    });
  });
});

router.post('/api/polls/:id/vote', function(req, res){
  Poll.findById(req.params.id, function(error, poll){
    if (error) {
      return res.status(500).send(error);
    }

    // If the user isn't logged in, use their IP
    var userIdentifier = req.user ? req.user.id : req.connection.remoteAddress;

    // Make sure the user hasn't already voted
    if (poll.voted.indexOf(userIdentifier) >= 0) {
      return res.status(400).json({ error: 'You have already voted' });
    } else {
      var choiceId = req.body.choiceId;

      // Make sure its a valid choice
      if (choiceId !== 'new' && !poll.choices.hasOwnProperty(choiceId)) {
        res.status(400).json({ error: 'Invalid choice' });
      }

      // Add new choice
      if (choiceId == 'new' && req.user) {
        // Make sure it's not a duplicate
        if (poll.choices.indexOf(req.body.newChoice) >= 0) {
          return res.status(400).json({ error: 'That choice already exists' });
        } else {
          poll.choices.push(req.body.newChoice);
          choiceId = poll.choices.indexOf(req.body.newChoice);
        }
      } else if (choiceId == 'new' && !req.new) {
        return res.status(400).json({ error: 'You must login to use a custom choice' });
      }

      // Add the user to the voted array
      poll.voted.push(userIdentifier);

      // Update votes
      if (poll.votes.hasOwnProperty(choiceId)) {
        poll.votes[choiceId]++;
      } else {
        poll.votes[choiceId] = 1;
      }

      var newData = {
        choices: poll.choices,
        votes: poll.votes,
        voted: poll.voted
      };

      // Update poll
      Poll.update({ _id: req.params.id }, { $set: newData }, {}, function(error){
        if (error) {
          return res.status(500).send(error);
        }

        res.json({
          choices: poll.choices,
          votes: poll.votes
        });
      });
    }
  });
});

router.post('/api/polls', function(req, res){
  // Make sure the user is logged in
  if (!req.user) {
    return res.status(401).json({ errors: ['You are not logged in'] });
  }

  var data = {
    name: req.body.name,
    choices: req.body.choices,
    votes: [],
    voted: {},
    _creator: req.user.id // Set creator ID, allowing us to `.populate()` it later
  };

  var poll = new Poll(data);

  Poll.create(data, function(error, poll){
    // Check validation
    if (error && error.errors) {
      var errors = Object.keys(error.errors).map(function(key){
        return error.errors[key].message;
      });

      if (errors.length) {
        return res.status(400).json({
          errors: errors
        });
      }
    }

    res.json({
      id: poll.id,
      name: poll.name,
      choices: poll.choices
    });
  });
});

module.exports = router;
