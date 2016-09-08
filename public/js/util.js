
var Link = window.ReactRouter.Link;

// This allows us to add the active class to the Bootstrap navbar `<li>` elements.
window.NavLink = React.createClass({
  contextTypes: {
    router: React.PropTypes.object
  },
  render: function(){
    var className = this.context.router.isActive(this.props.to, true) ? 'active' : '';

    return (
      <li className={className}>
        <Link {...this.props}>
          {this.props.children}
        </Link>
      </li>
    );
  }
});

// Easily render form errors.
window.ErrorsAlert = React.createClass({
  render: function(){
    if (this.props.errors.length > 0) {
      var errorNodes = this.props.errors.map(function(msg, id){
        return (
          <li key={id}>
            {msg}
          </li>
        );
      });

      return (
        <div className="alert alert-danger">
          <ul>
            {errorNodes}
          </ul>
        </div>
      );
    } else {
      return null;
    }
  }
});
