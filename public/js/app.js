
var Router = window.ReactRouter.Router;
var Route = window.ReactRouter.Route;
var IndexRoute = window.ReactRouter.IndexRoute;
var browserHistory = window.ReactRouter.browserHistory;
var Link = window.ReactRouter.Link;

var NavLink = window.NavLink;
var NavBar = window.NavBar;
var Polls = window.Polls;
var Poll = window.Poll;
var NewPoll = window.NewPoll;
var MyPolls = window.MyPolls;

// Load google charts
google.charts.load('current', {'packages':['corechart']});

// Main application
var App = React.createClass({
  getInitialState: function(){
    return {
      user: null
    }
  },
  getUserInfo: function(){
    $.ajax({
      url: '/api/user-info',
      dataType: 'json',
      cache: false,
      success: function(data){
        this.setState({ user: data });
        window.loggedIn = this.state.user ? true : false;
      }.bind(this),
      error: function(xhr, status, err){
        console.error('get user info', status, err.toString());
      }.bind(this)
    });
  },
  componentWillMount: function(){
    this.getUserInfo();
    setInterval(this.getUserInfo, 10000);
  },
  render: function() {
    return (
      <div>
        <NavBar user={this.state.user} />
        <main className="container">
          {this.props.children && React.cloneElement(this.props.children, { user: this.state.user })}
        </main>
        <footer>
          &copy; 2016 <a href="https://nirix.net">Nirix</a>
        </footer>
      </div>
    );
  }
});

// The basic index page
var Index = React.createClass({
  render: function(){
    return (
      <div className="jumbotron">
        <div className="text-center">
          <h1>Voting App</h1>
          <p>
            Check out the <Link to="/polls">polls</Link> or <Link to="/auth/github">login with your
            GitHub account</Link> and create your own.
          </p>
        </div>
      </div>
    );
  }
});

// Routes + render the app
ReactDOM.render((
  <Router history={browserHistory}>
    <Route name="root" path="/" component={App}>
      <IndexRoute component={Index} />
      <Route name="new-poll" path="new" component={NewPoll} />
      <Route name="my-polls" path="my-polls" component={MyPolls} />
      <Route name="polls" path="polls" component={Polls} />
      <Route name="poll" path="/polls/:id" component={Poll} />
    </Route>
  </Router>
), document.getElementById('app-main'));
