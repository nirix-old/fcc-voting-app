var mongoose = require('mongoose');

var Poll = new mongoose.Schema({
  _creator: {
    type: String,
    ref: 'User'
  },
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  choices: {
    type: Array,
    required: [true, 'You didn\'t specify any choices'],
    validate: {
      validator: function(v) {
        // Remove empty and duplicate choices
        var choices = v.filter(function(choice, index){
          return choice !== '' && v.indexOf(choice) == index;
        });

        return choices.length > 1;
      },
      message: 'You must have at least two unique choices'
    }
  },
  votes: Array,
  voted: Array
});

module.exports = mongoose.model('Poll', Poll);
