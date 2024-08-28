var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');  

var indexRouter = require('./routes/index');
var tenantRouter = require('./routes/tenant');
var tenantStructRouter = require('./routes/tenantStruct');
var projectRouter = require('./routes/project');
var stuffRouter = require('./routes/stuff');

var app = express();

// 设置 Mongoose 连接
const mongoose = require("mongoose");
const mongoDB = "You database url here";
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB 连接错误："));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors()); // 使用 CORS 中间件

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/tenant', tenantRouter);
app.use('/struct', tenantStructRouter);
app.use('/project', projectRouter);
app.use('/stuff', stuffRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
