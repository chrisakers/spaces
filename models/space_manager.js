var fs = require('fs'),
    Space = require('./space.js'),
    smPath = '/../data/space_manager.json',
    dataPath = '/../data/space_data.json',
    id = 1,
    timer,
    sm = {
        spaces: [],
        data: {}
    },
    
    persist = function () {
        //throttle saving (waits until no write requests have occurred in the last 5 seconds)
        clearTimeout(timer);
        timer = setTimeout(function () {
            fs.writeFile(__dirname + smPath, JSON.stringify({id: id, spaces: sm.spaces}), 'binary', function (err) {
                if (err) throw err;
            });
            fs.writeFile(__dirname + dataPath, JSON.stringify(sm.data), 'binary', function (err) {
                if (err) throw err;
            });
        }, 5000);
    },
    
    loadJSON = function (path, callback) {
        if (!callback) callback = function () {};
        require('path').exists(path, function (exists) {
            if (!exists) {
                console.log("file does not exist: " + filename);
                callback(false);
                return;  
            }
      
            fs.readFile(path, "binary", function (err, file) {
                if (err) {
                    console.log("Could not read file at " + filename);
                    callback(false);
                    return;
                }
      
                var dataObj = JSON.parse(file);
                if (dataObj) {
                    callback(dataObj);
                } else {
                    callback(false);
                }
            });  
        });  
    },
    
    load = function (callback) {
        if (!callback) callback = function () {};
    
        loadJSON(__dirname + smPath, function (data) {
            if (!data) {
                callback(false);
                return;
            }
            
            if (data.spaces) sm.spaces = data.spaces;
            if (data.id) id = data.id;
            
            callback(sm.spaces);
        });
    
        loadJSON(__dirname + dataPath, function (data) {
            if (!data) {
                callback(false);
                return;
            }
            
            sm.data = data
            
            callback(sm.data);
        });
    },
    
    add = function (args) {
        if (!args) return false;
        if (!args.spaceName) return {error: 'Please enter a name for the Space.', args: args};
        
        var i, space;
        
        for (i=0; (space = sm.spaces[i++]); ) {
            if (args.spaceName === space.name) {
                return {error: 'There is already a Space with that name.'};
            }
        }
        
        space = new Space(id++, args.spaceName, args.spacePrivacy, args.from);
        sm.spaces.push(space);
        
        createDefaults(space);
        
        persist();
        return space;
    },
    
    spacesFor = function (user) {
        var spaces = [], i, memberId;
        sm.spaces.forEach(function (space) {
            if (space.access === 'public') {
                spaces.push(space);
            } else if (space.owner && space.owner.id === user.id) {
                spaces.push(space);
            } else {
                for (i=0; (memberId = space.members[i++]);) {
                    if (memberId === user.id) {
                        spaces.push(space);
                        break;
                    }
                }
            }
        });
        return spaces;
    },
    
    createDefaults = function (space) {
        sm.data[space.id] = sm.data.defaults;
    };

load();

sm.persist = persist;
sm.load = load;
sm.add = add;
sm.spacesFor = spacesFor;

module.exports = sm;
