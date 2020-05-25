const path = require("path")
const fs = require("fs")
const http = require('http');

$(document).ready(function () {
    document.getElementById("filepicker").addEventListener("change", function (event) {
        let files = event.target.files;
        var path = files[0].path.substr(0, files[0].path.lastIndexOf("/"));
        readDirectory(path);
    }, false);
})

function readDirectory(directoryPath) {
    $('#inputPath').val(directoryPath);
    $("#bodyTable").find('tr').remove();
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            console.log("Error getting directory information.")
        } else {
            files.forEach(function (file) {
                fs.stat(directoryPath + `/${file}`, function (err, stats) {
                    console.log(file, stats)
                    var date = new Date(stats.atime);
                    var icon = '<span class="material-icons" style="color: blue;">\n' +
                        'description\n' +
                        '</span>'
                    if (stats.isDirectory()) {
                        icon = '<span class="material-icons" style="color: gold;">\n' +
                            'folder\n' +
                            '</span>';
                        $("#bodyTable").append('<tr><td>' + icon + '</td><td><a id="nameDirectory" onclick="changeDirectory(event)">' + file + '</a></td><td>' + date.toLocaleString() + '</td></tr>')
                    } else {
                        $("#bodyTable").append('<tr><td>' + icon + '</td><td><a id="nameFile" onclick="openFile(event)">' + file + '</a></td><td>' + date.toLocaleString() + '</td></tr>')
                    }
                })
            })
        }
    })
}

$('#backPath').click(function () {
    let lastPath = $('#inputPath').val();
    var path = lastPath.substr(0, lastPath.lastIndexOf("/"));
    readDirectory(path);
});

function openFile(event) {
    var value = $("#inputPath").val();
    var filePath = value + '/' + event.target.innerText;
    var ext = filePath.substr(filePath.lastIndexOf('.') + 1);
    // if (ext == 'png' || ext == 'jpg' || ext == 'jpeg' || ext == 'pdf') {
        fs.readFile(filePath, function (err, data) {
            if (err) throw err // Fail if the file can't be read.
             window.open(filePath);
            // http.createServer(function (req, res) {
            //     res.writeHead(200, {'Content-Type': 'image/'+ext})
            //     res.end(data) // Send the file data to the browser.
            // }).listen(8124)
            // console.log('Server running at http://localhost:8124/')
            // window.open('http://localhost:8124/');
            // process.on('exit', function(code) {
            //     console.log('server exit', code);
            // });
        })
    // }
}

function changeDirectory(event) {
    var value = $("#inputPath").val();
    var path = value + '/' + event.target.innerText;
    readDirectory(path);
}
