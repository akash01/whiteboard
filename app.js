/**
 * Module dependencies.
 */
var express = require('express')
  ,  app = express()
  , http = require('http')
  , server = http.createServer(app)
  , io = require('socket.io').listen(server);

var port = process.env.PORT || 8080;
server.listen(port);
// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.methodOverride());
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

var currentID = 0;

io.sockets.on('connection', function (socket) {
	socket.userID = ++currentID;
	socket.emit('user count', currentID - 1);
	socket.broadcast.emit('user joined', socket.userID);
	
	socket.on('start drawing', function(xCoord, yCoord, color){
		socket.broadcast.emit('start drawing', xCoord, yCoord, color, socket.userID);
	});
	socket.on('stop drawing', function(){
		socket.broadcast.emit('stop drawing', socket.userID);
	});
	
	socket.on('drawing', function(xCoord, yCoord, color){
	  socket.broadcast.emit('drawing', xCoord, yCoord, color, socket.userID);	
	});
	
	socket.on('disconnect', function() {
	})
});

console.log("Express server listening on port %d in %s mode", server.address().port,app.settings.env);
