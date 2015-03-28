var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var cookieParser = require('cookie-parser');
var mongoose = require('mongoose');
var fs = require('fs');

var app = module.exports = express();

// Load models
var models_path = __dirname + '/server/models';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Static content paths - ensure it comes before session middleware, otherwise sessions will be created for each static
// file request if user a is not logged in.
app.use(express.static(__dirname + '/../../assets'));

// Cookie-Parser Note: ensure cookie secret is the same as session secret
app.use(cookieParser("b1bce56042e44bb7c491e03d4142b652"));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
app.use(expressSession({
    store: new MongoStore({mongooseConnection: mongoose.connection}),
    secret: 'b1bce56042e44bb7c491e03d4142b652',
    resave: false,
    rolling: true,
    saveUninitialized: false,
    name: 'asm.sid',
    cookie : { httpOnly: true, maxAge: 1800000 }
}));
app.use(passport.initialize());
app.use(passport.session());

// Using the flash middleware provided by connect-flash to store messages in session
// and displaying in templates
var flash = require('connect-flash');
app.use(flash());

// uncomment after placing your favicon in /static
//app.use(favicon(__dirname + '/static/favicon.ico'));

// Setup logger using Winston and Morgan.
var logger = require("./server/utils/logger");
if (app.get('env') === 'development') {
    app.use(require('morgan')("dev", { stream: {write: function(str) {logger.info(str)}}}));
}
else {
    app.use(require('morgan')("combined", {stream: {write: function(str) {logger.info(str)}}}));
}
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));
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
// To set to "env" to "production" use "export NODE_ENV=production", default is development.
if (app.get('env') === 'development') {
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
