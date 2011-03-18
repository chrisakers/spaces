var fs = require('fs'),
    path = require('path'),
    User = require('./user.js'),
    filepath = '/../data/user_manager.json',
    id = 1,
    timer,
    um = {
        users: []
    },
    
    persist = function (callback) {
        fs.writeFile(__dirname + filepath, JSON.stringify({id: id, users: um.users}), 'binary', function (err) {
            if (err) throw err;
            if (callback) callback(true);
        });
    },
    
    load = function (callback) {
        var filename = __dirname + filepath;
        path.exists(filename, function (exists) {
            if (!exists) {  
                // no users file
                console.log("No users file exists at " + filename);
                return;  
            }  
      
            fs.readFile(filename, "binary", function (err, file) {
                if (err) {
                    console.log("Could not read file at " + filename);
                    return;
                }
      
                var dataObj = JSON.parse(file);
                if (dataObj) {
                    um.users = dataObj.users;
                    id = dataObj.id;
                }
                
                if (callback) callback(users);
            });  
        });  
    },
    
    add = function (name, sessionId) {
        clearTimeout(timer);
        var user = new User(id++, name);
        user.sessionId = sessionId;
        um.users.push(user);
        timer = setTimeout(persist, 5000);
        return user;
    },
    
    getUsers = function () {
        return um.users;
    },
    
    login = function (sentUser, sessionId) {
        if (!sentUser) return {error: 'No data received.'};
        if (!sentUser.name && !sentUser.id) return {error: 'Please enter a user name.'};
        
        var i, user;
        
        if (sentUser.id) {
            for (i=0; (user = um.users[i++]); ) {
                if (sentUser.id === user.id) {
                    user.sessionId = sessionId;
                    return user;
                }
            }
        }
        
        if (sentUser.name) {
            for (i=0; (user = um.users[i++]); ) {
                if (sentUser.name === user.name) {
                    user.sessionId = sessionId;
                    return user;
                }
            }
        }
        
        return add(sentUser.name, sessionId);
    };

load();

um.persist = persist;
um.load = load;
um.add = add;
um.login = login;

module.exports = um;
