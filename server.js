var http         = require('http'),
    url          = require('url'),
    fs           = require('fs'),
    io           = require('socket.io'),
    qs           = require('querystring'),
    userManager  = require('./models/user_manager.js'),
    spaceManager = require('./models/space_manager.js'),
    cradle       = require('cradle'),
    db           = new(cradle.Connection)().database('spaces'),
    //mailer       = require('./models/mailer.js'),
    server,
    send404;

db.exists(function (err, exists) {
    console.log(arguments);
});


server = http.createServer(function (req, res) {
    // your normal server code
    var path = url.parse(req.url).pathname;
    switch (path) {
    case '/':
        sendStatic({file: '/index.html'}, res);
        break;
    case '/wdpro-logo.png':
        sendStatic({file: path}, res);
        break;

    default: send404(res);
    }
});

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};

var merge = function () {
    var obj = {}, l = arguments.length, i, prop;
    for (i=0; (donor = arguments[i++]); ) {
        for (prop in donor) {
            obj[prop] = donor[prop];
        }
    }
    return obj;
};

var md5 = function (input) {
    return require('crypto').createHash('md5').update(input).digest('hex');
};

var sendStatic = function (args, res) {
    var defaults = {
        code: 200,
        contentType: 'text/html',
        encoding: 'utf8',
        directory: '/static'            
    };

    args = merge(defaults, args);

    fs.readFile(__dirname + args.directory + args.file, function(err, data){
        if (err) return send404(res);
        res.writeHead(args.code, {'Content-Type': args.contentType})
        res.write(data, args.encoding);
        res.end();
    });
};

server.listen(8080);

io = io.listen(server);
  
io.on('connection', function(client){
    var user;
    client.send({event: 'who-are-you'});

    client.on('message', function (comm) {
        console.log('Client event: ' + JSON.stringify(comm));
        if (comm.event) {
            switch (comm.event) {
            
            case 'login':
                comm.name = comm['login-name'];
                user = userManager.login(comm, client.sessionId);
                if (!user || user.error) {
                    client.send({event: 'login-failure', error: user.error});
                } else {
                    client.send(merge(
                        {spaces: spaceManager.spacesFor(user)},
                        {users: userManager.users},
                        {event: 'you-are', user: user}
                    ));
                    io.broadcast({event: 'new-user', user: user});
                }
                break;
                
            case 'i-am':
                user = userManager.login(comm.from, client.sessionId);
                if (!user || user.error) {
                    client.send({event: 'i-am-failure'});
                } else {
                    client.send(merge(
                        {spaces: spaceManager.spacesFor(user)},
                        {users: userManager.users},
                        {event: 'you-are', user: user}
                    ));
                    io.broadcast({event: 'new-user', user: user});
                }
                break;
            
            case 'create-space':
                var space = spaceManager.add(comm);
                if (!space || space.error) {
                    client.send({event: 'create-space-failure', error: space.error});
                } else {
                    client.send({event: 'create-space-success', space: space});
                    if (space.access === 'hidden') {
                        client.send({event: 'new-space', space: space});
                    } else {
                        io.broadcast({event: 'new-space', space: space});
                    }
                }
                break;
            
            case 'load-space':
                var spaceData = spaceManager.data[comm.space.id];
                if (spaceData) {
                    client.send(merge({event: 'load-space-success'}, {space: comm.space}, spaceData));
                } else {
                    client.send({event: 'load-space-failure'});
                }
                break;
            
            case 'get-edit-space':
                var spaceData = spaceManager.data[comm.space.id];
                if (spaceData) {
                    client.send(merge({event: 'get-edit-space-success'}, {space: comm.space}, spaceData));
                } else {
                    client.send({event: 'get-edit-space-failure'});
                }
                break;
            
            case 'submit-edited-space':
                var spaceData = spaceManager.data[comm.editSpaceId];
                if (spaceData) {
			spaceData.js = comm.spaceJS;
			spaceData.html = comm.spaceHTML;
                    client.send({event: 'submit-edit-space-success'});
                    spaceManager.persist();
                } else {
                    client.send({event: 'submit-edit-space-failure'});
                }
                break;

                
            default:
                io.broadcast(comm);
            }
        }
    });

    client.on('disconnect', function(){
	io.broadcast({event: 'user-disconnect', user: user});
        if (user && user.sessionId) delete user.sessionId;
    });
});
// WDPRO.Spaces@gmail.com
// WDPRO-D1sn3y!



console.log('Server running at http://127.0.0.1:8080/');
