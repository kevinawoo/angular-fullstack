'use strict';

var express = require('express'),
    favicon = require('static-favicon'),
    morgan = require('morgan'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    errorHandler = require('errorhandler'),
    path = require('path'),
    config = require('./config'),
    passport = require('passport'),
    mongoStore = require('connect-mongo')(session),
    swig = require('swig'),
    _ = require('underscore');

/**
 * Express configuration
 */
module.exports = function(app) {
    var env = app.get('env'),
        swigConfig = {
            varControls: ['<%=', '%>'],
            tagControls: ['<%', '%>'],
            cmtControls: ['<#', '#>']
        };

    if ('development' === env) {
        app.use(require('connect-livereload')());

        // Disable caching of scripts for easier testing
        app.use(function noCache(req, res, next) {
            if (req.url.indexOf('/scripts/') === 0) {
                res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
                res.header('Pragma', 'no-cache');
                res.header('Expires', 0);
            }
            next();
        });

        app.use(express.static(path.join(config.root, '.tmp')));
        app.use(express.static(path.join(config.root, 'app')));
        app.set('views', config.root + '/app/views');

        // Swig will cache templates for you, but you can disable
        // that and use Express's caching instead, if you like:
        app.set('view cache', false);
        // To disable Swig's cache, do the following:
        _.extend(swigConfig, {
            cache: false
        });
        // NOTE: You should always cache templates in a production environment.
        // Don't leave both of these to `false` in production!
    }

    if ('production' === env) {
        app.use(compression());
        app.use(favicon(path.join(config.root, 'public', 'favicon.ico')));
        app.use(express.static(path.join(config.root, 'public')));
        app.set('views', config.root + '/views');
    }

    app.engine('html', swig.renderFile);
    swig.setDefaults(swigConfig);
    app.set('view engine', 'html');
    app.use(morgan('dev'));
    app.use(bodyParser());
    app.use(methodOverride());
    app.use(cookieParser());

    // Persist sessions with mongoStore
    app.use(session({
        secret: 'angular-fullstack secret',
        store: new mongoStore({
            url: config.mongo.uri,
            collection: 'sessions'
        }, function() {
            console.log('db connection open');
        })
    }));

    // Use passport session
    app.use(passport.initialize());
    app.use(passport.session());

    // Error handler - has to be last
    if ('development' === app.get('env')) {
        app.use(errorHandler());
    }
};
