// modules
const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/codes');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const path = require('path');
const express = require('express');
const session = require('express-session');
const Line = require('./scriptrunner/line');
const line = new Line();
line.loadJob();

const app = express();
module.exports = app;
app.line = line;

// set session
app.use(session({
    secret: 'jkasmhkn',
    resave: true,
    saveUninitialized: false,
    rolling: true,
    cookie: { maxAge: 3600 * 1000 }
}));

//Don't move bot router below body parser

app.use('/bot', require('./routes/bot'));
app.set('env', 'development');
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//express router
app.use('/', require('./routes/user'));
app.use('/', require('./routes/code'));

// proxy to Angular
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'dist/index.html')); });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use(function(err, req, res, next) {
  if (req.app.get('env') === 'development')
    console.log(err);
  let messag = err.message;
  let status = err.status || 500;
  res.status(status).json({ 'error': messag }).end();
});

