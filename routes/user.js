var express = require('express');
var router = express.Router();
var passport = require('passport');

// Authenticate with GitHub
router.get('/auth/github', passport.authenticate('github'));

// And we're back
router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res){
  res.redirect('/');
});

// Now we're gone
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// What's my username again?
// This is actually used by the front end to check that the user is authenticated.
router.get('/api/user-info', function(req, res){
  if (req.user) {
    res.json({
      username: req.user.github_username
    });
  } else {
    res.json(null);
  }
});

module.exports = router;
