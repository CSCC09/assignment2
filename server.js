var PORT = 41101;
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var storage = require('node-persist');

// Initializing storage
storage.initSync();

// Get the votes of a specific video, if the video is not on the database, we insert it
function getVotes(id) {

    votes = storage.getItem(id);
    if (votes == undefined) {
        storage.setItem(id, 0);
        return 0;
    } 
    return votes;
}

// Vote for a specific video
function vote(id) {

    votes = getVotes(id);
    storage.setItem(id, votes + 1);
    return votes + 1;

}


// Creates a HTTP server.
http.createServer(function(request, response) {  

    var pathname = url.parse(request.url).pathname; // Getting the path
    var param = querystring.parse(request.url.replace(pathname + "?", "")); // Getting the parameters, if there are any
    var votes;
    response.writeHead(200, {'Content-Type': 'application/json'});

    // Getting the style.css
    if(request.url.indexOf('.js') != -1){
      fs.readFile(__dirname + '/jquery.lazyload.js', function (err, data) {
        if (err) console.log(err);
        response.writeHead(200, {'Content-Type': 'text/js'});
        response.write(data);
        response.end();
      });
    }

    if (request.method == 'GET') {
        // Loading index.html
        if (pathname == '/') {
            response.writeHead(200, {'Content-Type': 'text/html'});
            fs.readFile(__dirname + '/video.html', function(err, data) {
                response.write(data);
                response.end();
            });
        } else if (pathname == '/votes') {
            votes = getVotes(param.id);
            response.end(JSON.stringify({"votes" : votes}));
        } else if (pathname == '/vote') {
            votes = vote(param.id);
            response.end(JSON.stringify({"votes" : votes}));
        }
    }
}).listen(PORT); // Server starts to listen on port 4321.

// Writes info on Node's console. 
console.log('Server running at http://127.0.0.1:' + PORT + '/');
