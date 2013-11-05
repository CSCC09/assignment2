var PORT = 41101;
var http = require('http');
var url = require('url');
var querystring = require('querystring');
var fs = require('fs');
var sqlite3 = require("sqlite3").verbose();
var file = "database.db3";
var db = new sqlite3.Database(file);

// Creating the table if it doesn't exist
var query = "CREATE TABLE IF NOT EXISTS Votes (";
query = query + "id integer PRIMARY KEY AUTOINCREMENT, "
query = query + "video_id VARCHAR(50), ";
query = query + "votes int default 0)";
db.run(query);

// Get the votes of a specific video, if the video is not on the database, we insert it
function getVotes(id) {

    var query = "SELECT votes FROM Votes WHERE video_id = '" + id + "'";
    var votes = -1;    

    db.each(query, function(err, row) {
        votes = row.votes;
    });

    if (votes == -1) {
        query = "INSERT INTO Votes (video_id) VALUES ('" + id + "')";
        votes = 0;
    }

    return votes;

}

// Vote for a specific video
function vote(id) {

    var query = "SELECT votes FROM Votes WHERE id = '" + id + "'";
    var votes;

    db.each(query, function(err, row) {
        votes = row.votes + 1;
    });

    query = "UPDATE Votes SET votes = " + votes + " WHERE video_id = '" + id + "'";
    db.run(query);

}


// Creates a HTTP server.
http.createServer(function(request, response) {  

    var pathname = url.parse(request.url).pathname; // Getting the path
    var param = querystring.parse(request.url.replace(pathname + "?", "")); // Getting the parameters, if there are any
    var votes;
    response.writeHead(200, {'Content-Type': 'application/json'});

    if (request.method == 'GET') {
        // Loading index.html
        if (pathname == '/') {
            response.writeHead(200, {'Content-Type': 'text/html'});
            fs.readFile(__dirname + '/index.html', function(err, data) {
                response.write(data);
                response.end();
            });
        } else if (pathname == '/votes') {            
            votes = getVotes(param[0]);
            response.end(JSON.stringify({"votes" : votes}));
        } 
    } else if (request.method == 'POST') {
        if (pathname == '/vote') {
            vote(param[0]);
        }
    }
}).listen(PORT); // Server starts to listen on port 4321.

// Writes info on Node's console. 
console.log('Server running at http://127.0.0.1:' + PORT + '/');
