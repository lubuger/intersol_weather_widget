// Requires
var express = require('express');
var expressSession = require('express-session');
var redis = require('redis');
var frontend = require('./widget_frontend.js');
var mysql      = require('mysql');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('express-flash');

var port = 3000;
var hostUrl = 'http://localhost/intersol';
var nodeUrl = 'http://localhost:' + port;


// Configs
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'admin',
    password : 'admin',
    database : 'weather'
});

var app = express();
var client = redis.createClient();

var widgetCounter = 0;
var widgetList = [];


// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


// Express configs
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(session({
    secret: 'secret cat',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


// Mysql configs
connection.connect(function(err) {
    if (err) {
        console.error('error connecting to mysql: ' + err.stack);
        return;
    }

    console.log('connected to mysql as id ' + connection.threadId);
});


// Passport js configs
function loggedIn(req, res, next)
{
    if (req.user) {
        next();
    } else {
        res.redirect( hostUrl );
    }
}

function widgetConnected( req, res, next )
{
    if (req.user) {

        var widgetId = 'widget' + req.query.id;

        connection.query('SELECT * FROM user_widgets WHERE username="' + req.user + '" AND widget="' + widgetId + '"; ', function (error, results, fields) {

            if(results.length > 0)
                next();
            else
                res.redirect( hostUrl );

        });

    } else {
        res.redirect( hostUrl );
    }
}

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy({
        passReqToCallback : true
    },
    function( req, password, username, done ) {

        var query = req.body;
        var username = query.username;
        var password = query.password;
        var loggedInTrigger = false;

        connection.query('SELECT * FROM users WHERE username="' + username + '" AND password="' + password + '"; ', function (error, results, fields) {
            if (error) throw error;

            if( results.length > 0 )
                loggedInTrigger = true;

            if(loggedInTrigger)
                return done(null, username);
            else
                return done(null, false, { message: 'Incorrect credentials.' });
        });

    }
));



// Widget core
var widget = {};

widget.create = function( city, days, pos, username )
{
    widgetCounter += 1;

    connection.query('INSERT INTO user_widgets (username, widget) VALUES ("' + username + '" , "' + 'widget' + widgetCounter + '"); ', function (error, results, fields) {
        if (error) throw error;

        client.hset('widget' + widgetCounter, 'name', 'widget' + widgetCounter );
        client.hset('widget' + widgetCounter, 'city', city );
        client.hset('widget' + widgetCounter, 'days', days );
        client.hset('widget' + widgetCounter, 'pos', pos );
    });
};

widget.update = function( city, days, pos, username, id )
{

    connection.query('UPDATE user_widgets SET username="' + username + '" WHERE widget="WIDGET' + id + '"; ', function (error, results, fields) {
        if (error) throw error;

        client.hset('widget' + id, 'city', city );
        client.hset('widget' + id, 'days', days );
        client.hset('widget' + id, 'pos', pos );
    });



};

widget.get = function( id, callback )
{
    client.hgetall('widget' + id, function( err, obj ) {

        var html = frontend.generateHTML( obj.days, obj.city, obj.pos );

        callback( obj, html );

    });
};

widget.list = function( callback )
{
    var counter = 0;
    widgetList = [];

    client.keys("widget*", function(err, replies) {

        widgetCounter = replies.length;

        replies.forEach(function( reply, i ) {

            client.hgetall(reply, function( err, obj ) {

                var username = '-';

                connection.query('SELECT * FROM user_widgets WHERE widget="' + reply + '"; ', function (error, results, fields) {
                    if (error) throw error;

                    if( results.length > 0 )
                        username = results[0].username;

                    widgetList[i] = {
                        "name" : reply,
                        "host" : obj.host,
                        "city" : obj.city,
                        "days" : obj.days,
                        "pos"  : obj.pos,
                        "user" : username
                    };

                    counter++;

                    if( counter === widgetCounter )
                        callback();


                });



            });

        });

    });
}



// Routes
app.get('/create', loggedIn, function (req, res) {

    client = redis.createClient();

    var query = req.query;
    var city = query.city;
    var pos = query.pos;
    var days = query.days;
    var username = query.username;

    widget.create( city, days, pos, username );

    res.send('OK');
});

app.get('/update', loggedIn, function (req, res) {

    var query = req.query;
    var city = query.city;
    var pos = query.pos;
    var days = query.days;
    var username = query.user;
    var id = query.id;

    widget.update( city, days, pos, username, id );

    res.send('OK');
});

app.get('/list', loggedIn, function(req, res) {

    widget.list( function() {
        res.send( widgetList );
    });

});

app.get('/get', widgetConnected, function(req, res) {

    var query = req.query;
    var id    = query.id;

    client.hset('widget' + id, 'host', req.hostname );

    widget.get( id, function( data, html ) {

        res.send( html );

    } );

});

app.get('/users', loggedIn, function(req, res) {
    connection.query('SELECT * FROM users; ', function (error, results, fields) {
        if (error) throw error;

        res.send( results );
    });
});

app.post('/login',
    passport.authenticate('local', { successRedirect: nodeUrl + '/panel',
        failureRedirect: hostUrl,
        failureFlash: true })
);

app.post('/register', function(req, res) {

    var query = req.body;
    var username = query.username;
    var password = query.password;

    connection.query('INSERT INTO users (username, password) VALUES ("' + username + '" , "' + password + '"); ', function (error, results, fields) {
        if (error) throw error;

        req.login(username, function(err) {
            if (err) {
                console.log(err);
            }
            return res.redirect( nodeUrl + '/panel' );
        });
    });

});

app.get('/panel', loggedIn, function(req, res) {
    res.sendFile('/panel.html', { root: __dirname });
});

// Express server
app.listen(port, function () {
    console.log('Example app listening on port 3000!');

});

client.on('error', function(err) {
    console.log(' Redis Error: ' + err);
});