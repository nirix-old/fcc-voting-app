var express = require('express');
var router = express.Router();
var passport = require('passport');

router.get('/auth/github', passport.authenticate('github'));

router.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), function(req, res){
  res.redirect('/');
});

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

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
