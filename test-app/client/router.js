// Tests an initital redirect
Router.route('/', function() {
  Router.go('/login');
});

Router.route('/login', function () {
  this.render('login');
});
