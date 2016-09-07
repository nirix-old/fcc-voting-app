//
// FCC Voting App
// Copyright (C) 2016 Nirix
//
require('dotenv').config();
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var githubStrategy = require('passport-github2').Strategy;

var app = express();
var User = require('./models/user');
var Poll = require('./models/poll');

// Configuration options
var config = {
  base_url: process.env.BASE_URL || ('http://localhost:' + (process.env.PORT || 3000)),
  session_secret: process.env.SESSION_SECRET || 'mudkips',
  mongo: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/fcc-voting-app',
    options: {
      db: {
        safe: true
      }
    }
  },
  github: {
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET
  }
};

// Configure mongoose
mongoose.connect(config.mongo.uri, config.mongo.options);
mongoose.connection.on('error', function(err){
  console.log('Exiting due to MongoDB connection error: ' + err);
  process.exit(-1);
});

// Configure express
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: config.session_secret,
  cookie: {
    maxAge: (2 * 24 * 60 * 60) * 1000
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  }),
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

// Configure passport
passport.use(new githubStrategy(
  {
    clientID: config.github.client_id,
    clientSecret: config.github.client_secret,
    callbackURL: config.base_url + '/auth/github/callback'
  },
  function(accessToken, refreshToken, profile, cb){
    User.findOrCreate({ github_id: profile.id }, function (err, user) {
      User.update({ github_id: user.github_id }, { github_username: profile.username }, {}, function(){
        return cb(err, user);
      });
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

// Routes
app.get('/', function(req, res){
  res.render('index');
});

app.use('/', require('./routes/user'));
app.use('/', require('./routes/polls'));

// Catch 404 route and render the index, React will take care of the rest.
app.use(function(req, res, next){
  res.render('index');
});

app.listen(process.env.PORT || 3000, function(){
  console.log('Server listening on port', process.env.PORT || 3000);
});
