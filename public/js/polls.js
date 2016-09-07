
var Link = window.ReactRouter.Link;
var History = window.ReactRouter.History;

window.ErrorsAlert = window.ErrorsAlert;

window.Polls = React.createClass({
  getInitialState: function(){
    return {
        data: []
    };
  },
  loadPollsFromServer: function(){
    $.ajax({
      url: '/api/polls',
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({ data: data });
      }.bind(this),
      error: function(xhr, status, err){
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  componentWillMount: function(){
    this.loadPollsFromServer();
    // setInterval(this.loadPollsFromServer, 5000);
  },
  render: function() {
    var pollNodes = this.state.data.map(function(poll){
      return (
        <Link to={`/polls/${poll.id}`} className="list-group-item" key={poll.id}>
          <span className="poll-name">{poll.name}</span> by <span className="author-name">{poll.author.username}</span>
        </Link>
      );
    });

    return (
      <div id="polls">
        <h2 className="page-header">Polls</h2>
        <div className="well">
          <div className="list-group poll-list-group">
            {pollNodes}
          </div>
        </div>
      </div>
    );
  }
});

window.NewPoll = React.createClass({
  mixins: [
    History
  ],
  getInitialState: function(){
    return {
      data: {
        name: '',
        // Polls require at least two choices, this adds the inputs so the user
        // doesn't have to.
        choices: [
          '',
          ''
        ]
      },
      errors: []
    }
  },
  componentWillMount: function(){
    if (!this.props.user) {
      return this.history.pushState(null, '/');
    }
  },
  updateName: function(event){
    var data = this.state.data;
    data.name = event.target.value;
    this.setState(data);
  },
  updateChoice: function(event){
    var id = event.target.getAttribute('data-id');
    var data = this.state.data;
    data.choices[id] = event.target.value;

    this.setState(data);
  },
  addChoice: function(event){
    var data = this.state.data;
    data.choices.push('');
    this.setState(data);
  },
  removeChoice: function(event){
    var data = this.state.data;
    data.choices.splice(event.target.getAttribute('data-id'), 1);
    this.setState(data);
  },
  handleSubmit: function(e) {
    e.preventDefault();

    $.ajax({
      url: '/api/polls',
      method: 'post',
      dataType: 'json',
      data: {
        name: this.state.data.name,
        choices: this.state.data.choices
      },
      cache: false,
      success: function(data){
        this.history.pushState(null, '/polls/' + data.id);
      }.bind(this),
      error: function(xhr, status, err){
        if (xhr.responseJSON.errors.length > 0) {
          this.setState({ errors: xhr.responseJSON.errors });
        }
      }.bind(this)
    });
  },
  render: function(){
    var choiceNodes = this.state.data.choices.map(function(choice, id){
      return (
        <li key={id}>
          <div className="row">
            <div className="col-xs-11">
              <input type="text" name="choice[]" required className="form-control" data-id={id} value={choice} onChange={this.updateChoice} />
            </div>
            <div className="col-xs-1">
              <button type="button" className="btn btn-app-flat" data-id={id} onClick={this.removeChoice}><i className="fa fa-times"></i></button>
            </div>
          </div>
        </li>
      );
    }.bind(this));

    return (
      <div>
        <h2 className="page-header">New Poll</h2>
        <form className="form-horizontal" onSubmit={this.handleSubmit}>
          <ErrorsAlert errors={this.state.errors} />
          <div className="well">
            <div className="form-group">
              <label htmlFor="name" className="col-md-3 control-label">Name</label>
              <div className="col-md-9">
                <input type="text" name="name" id="name" required className="form-control" value={this.state.data.name} onChange={this.updateName} />
              </div>
            </div>
            <div className="form-group">
              <label className="col-md-3 control-label">Choices</label>
              <div className="col-md-9">
                <ul className="form-poll-choices">
                  {choiceNodes}
                </ul>
                <button type="button" className="btn btn-sm btn-app-flat" onClick={this.addChoice}>Add Choice</button>
              </div>
            </div>
          </div>
          <div className="text-center">
            <button type="submit" className="btn btn-app">Create Poll</button>
          </div>
        </form>
      </div>
    );
  }
});

var NewPollChoice = React.createClass({
  render: function(){
    if (window.loggedIn) {
      return (
        <label className="list-group-item">
          <input name="choice" value="new" type="radio" /> <input type="text" onChange={this.setNewChoice} />
        </label>
      );
    } else {
      return null;
    }
  }
});

window.Poll = React.createClass({
  getInitialState: function(){
    return {
      data: {
        choices: [],
        votes: []
      },
      voteChoiceId: null,
      newChoice: null,
      errors: []
    }
  },
  componentWillMount: function(){
    $.ajax({
      url: '/api/polls/' + this.props.params.id,
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({ data: data });
      }.bind(this),
      error: function(xhr, status, err){
        console.error('get poll data', status, err.toString());
      }.bind(this)
    });
  },
  createChart: function(){
    google.charts.setOnLoadCallback(function(){
      // if (this.state.data.votes.length > 0) {
        var array = this.state.data.choices.map(function(choice, id){
          var votes = this.state.data.votes.hasOwnProperty(id) ? this.state.data.votes[id] : 0;
          return [choice, votes];
        }.bind(this));

        var chartData = google.visualization.arrayToDataTable([['Choice', 'Votes']].concat(array));

        var options = {
          // is3D: true,
          // title: this.state.data.name,
          titleTextStyle: {
            color: $('body').css('color')
          },
          backgroundColor: $('.well').css('background-color'),
          legend: {
            textStyle: {
              color: $('body').css('color')
            }
          },
          chartArea: {
            height: '90%'
          }
        };

        var chart = new google.visualization.PieChart(document.getElementById('chart'));
        chart.draw(chartData, options);
      // }
    }.bind(this));
  },
  setVoteChoiceId: function(event){
    this.setState({ voteChoiceId: event.target.value });
  },
  handleVote: function(event){
    event.preventDefault();

    var choiceId = this.state.voteChoiceId;

    if (!choiceId) {
      return;
    }

    var data = {
      choiceId: this.state.voteChoiceId
    };

    if (this.state.voteChoiceId == 'new') {
      data.newChoice = this.state.newChoice;
    }

    $.ajax({
      url: '/api/polls/' + this.state.data.id + '/vote',
      method: 'post',
      dataType: 'json',
      data: data,
      cache: false,
      success: function(data){
        var poll = this.state.data;
        poll.choices = data.choices;
        poll.votes = data.votes;

        this.setState({ data: poll });
      }.bind(this),
      error: function(xhr, status, err){
        if (xhr.status == 400) {
          this.setState({ errors: [xhr.responseJSON.error] });
        } else {
          console.error('get poll data', status, err.toString());
        }
      }.bind(this)
    });
  },
  useNewChoice: function(event){
    this.setState({
      voteChoiceId: 'new'
    });
  },
  setNewChoice: function(event){
    this.setState({
      errors: [],
      newChoice: event.target.value
    });
  },
  openShareWindow: function(url){
    window.open(url, 'Share Poll', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=600,width=600');
  },
  shareWithTwitter: function(){
    this.openShareWindow(
      'https://twitter.com/intent/tweet?related=freecodecamp&text=' + encodeURI(this.state.data.name + ': ' + window.location),
    );
  },
  shareWithGooglePlus: function(){
    this.openShareWindow(
      'https://plus.google.com/share?url=' + encodeURI(this.state.data.name + ': ' + window.location),
    );
  },
  shareWithFacebook: function(){
    this.openShareWindow(
      'https://www.facebook.com/sharer/sharer.php?u=' + encodeURI(window.location),
    );
  },
  shareWithLinkedIn: function(){
    this.openShareWindow(
      'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURI(window.location) + '&title=' + encodeURI(this.state.data.name)
    );
  },
  render: function(){
    if (this.state.data.votes.length) {
      this.createChart();
    }

    var choiceNodes = this.state.data.choices.map(function(choice, id){
      return (
        <label className="list-group-item" key={id}>
          <input name="choice" value={id} type="radio" onChange={this.setVoteChoiceId} /> <span>{choice}</span>
        </label>
      );
    }.bind(this));

    if (this.props.user) {
      choiceNodes.push((
          <div className="list-group-item" key="new">
            <label>
              <input name="choice" value="-1" type="radio" onChange={this.useNewChoice} /> <span>Custom Choice</span>
            </label>
            <input type="text" name="new" className="form-control" onChange={this.setNewChoice} />
          </div>
      ));
    }

    return (
      <div>
        <h2 className="page-header">{this.state.data.name}</h2>
        <div className="well">
          <div className="row">
            <div className="col-md-4">
              <form id="poll-choices-form" onSubmit={this.handleVote}>
                <ErrorsAlert errors={this.state.errors} />
                <div className="list-group">
                  {choiceNodes}
                </div>
                <button type="submit" disabled={this.state.voteChoiceId == null} className="btn btn-block btn-app-flat">Cast Vote</button>
              </form>
              <hr/>
              <div className="text-center">
                <div className="btn-group">
                  <button type="button" className="btn btn-app-flat" onClick={this.shareWithTwitter}><i className="fa fa-fw fa-twitter"></i></button>
                  <button type="button" className="btn btn-app-flat" onClick={this.shareWithGooglePlus}><i className="fa fa-fw fa-google-plus"></i></button>
                  <button type="button" className="btn btn-app-flat" onClick={this.shareWithFacebook}><i className="fa fa-fw fa-facebook"></i></button>
                  <button type="button" className="btn btn-app-flat" onClick={this.shareWithLinkedIn}><i className="fa fa-fw fa-linkedin"></i></button>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div id="chart"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

window.MyPolls = React.createClass({
  mixins: [
    History
  ],
  getInitialState: function(){
    return {
      polls: []
    };
  },
  componentWillMount: function(){
    if (!this.props.user) {
      return this.history.pushState(null, '/');
    }

    $.ajax({
      url: '/api/polls?filter=mine',
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({ polls: data });
      }.bind(this),
      error: function(xhr, status, err){
        console.error('get my polls', status, err.toString());
      }.bind(this)
    });
  },
  deletePoll: function(event){
    var pollId = event.target.getAttribute('data-poll-id');

    $.ajax({
      url: '/api/polls/' + pollId,
      method: 'delete',
      dataType: 'json',
      cache: false,
      success: function(data){
        var polls = this.state.polls.filter(function(poll){
          return poll.id !== pollId
        });

        this.setState({ polls: polls });
      }.bind(this),
      error: function(xhr, status, err){
        console.error('delete poll data', status, err.toString());
      }.bind(this)
    });
  },
  render: function(){
    var pollNodes = this.state.polls.map(function(poll){
      return (
        <li className="list-group-item" key={poll.id}>
          <div className="row">
            <div className="col-sm-11">
              {poll.name}
            </div>
            <div className="col-sm-1 text-right">
              <button type="button" className="btn btn-xs btn-danger" title="Delete" data-poll-id={poll.id} onClick={this.deletePoll}>
                <i className="fa fa-times"></i> <span className="sr-only">Delete</span>
              </button>
            </div>
          </div>
        </li>
      );
    }.bind(this));

    return (
      <div>
        <h2 className="page-header">My Polls</h2>
        <div className="well">
          <ul className="list-group poll-list-group">
            {pollNodes}
          </ul>
        </div>
      </div>
    );
  }
});
