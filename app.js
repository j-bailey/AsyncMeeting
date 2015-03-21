var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var fs = require('fs');


var app = express();

var models_path = __dirname + '/server/models';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));  // TODO pull out of code
app.use(passport.initialize());
app.use(passport.session());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// uncomment after placing your favicon in /static
//app.use(favicon(__dirname + '/static/favicon.ico'));
app.use(logger('dev'));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'static')));
//app.use(express.static(path.join(__dirname, 'assets')));

// Initialize Passport
var initPassport = require('./server/passport/init');
initPassport(passport);
var routes = require('./server/routes/index');
app.use('/', routes);



//app.use( require('./server/controllers'))



//app.use('/', require('./routes/index'));
//app.use(require('./controllers/static'));
//
//app.use( require('./auth'));
//app.use('/users', require('./routes/users'));
//app.use('/api/posts', require('./controllers/api/posts'));
//
//
//app.use('/api/sessions', require('./controllers/api/sessions'));
//app.use('/api/users', require('./controllers/api/users'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') { // TODO confirm this works and document in the README
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;
