"use strict";

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var db = require('./server/db');
var fs = require('fs');
var nconf = require('nconf');

//var favicon = require('serve-favicon');

var app = module.exports = express();

// Load models)
var models_path = __dirname + '/server/models';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')){ /* jshint ignore:line */
        require(models_path + '/' + file);
    }
});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Static content paths - ensure it comes before session middleware, otherwise sessions will be created for each static
// file request if user a is not logged in.
app.use(express.static(__dirname + '/assets'));

// Cookie-Parser Note: ensure cookie secret is the same as session secret
app.use(cookieParser(nconf.get('session:secret')));

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
app.use(expressSession({
    store: new MongoStore({ mongooseConnection: db.sessionConnection }),
    secret: nconf.get('session:secret'),
    resave: false,
    //rolling: true, // TODO: See if this can work somehow even though angular is single page.
    saveUninitialized: false,
    name: nconf.get('session:sessionIdName')
    //cookie : { maxAge: 1800000 }
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
app.use(require('morgan')(nconf.get('log:morganLogFormat'), { stream: { write: function(str) {logger.info(str);} } }));

// Initialize Passport
var initPassport = require('./server/passport/init');
initPassport(passport);
var routes = require('./server/routes/index');
app.use('/', routes);


module.exports = app;
