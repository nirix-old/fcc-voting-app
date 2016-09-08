
var Link = window.ReactRouter.Link;
var NavLink = window.NavLink;

// Main navigation bar
window.NavBar = React.createClass({
  render: function(){
    return (
      <div className="navbar navbar-default navbar-static-top">
        <div className="container">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">Voting App</Link>
          </div>
          <div className="navbar-left">
            <ul className="nav navbar-nav">
              <NavLink to="/polls">
                Polls
              </NavLink>
            </ul>
          </div>
          <div className="navbar-right">
            <UserNav user={this.props.user} />
          </div>
        </div>
      </div>
    );
  }
});

// The user specific navbar section.
var UserNav = React.createClass({
  render: function(){
    if (!this.props.user) {
      return (
        <ul className="nav navbar-nav">
          <li>
            <a href="/auth/github" title="Login With GitHub">
              <i className="fa fa-sign-in"></i> Login
            </a>
          </li>
        </ul>
      );
    } else {
      return (
        <ul className="nav navbar-nav">
          <NavLink to="/new">
            <i className="fa fa-fw fa-plus"></i> New Poll
          </NavLink>
          <NavLink to="/my-polls">
            <i className="fa fa-fw fa-bar-chart"></i> My Polls
          </NavLink>
          <li>
            <span className="navbar-text">{this.props.user.username}</span>
          </li>
          <li>
            <a href="/logout" title="Logout">
              <i className="fa fa-fw fa-sign-out"></i> Logout
            </a>
          </li>
        </ul>
      );
    }
  }
});
