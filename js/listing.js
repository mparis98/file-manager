const paths = require("path")
const fs = require("fs")
const swal = require('sweetalert2');
const { shell } = require('electron')

$(document).ready(function () {
    document.getElementById("filepicker").addEventListener("change", function (event) {
        var path = null;
        let files = event.target.files;
        var os = detectOs();
        if (os == 'Mac OS' || os == 'iOS' || os == 'Linux' || os == 'Android'){
            path = files[0].path.substr(0, files[0].path.lastIndexOf("/"));
        } else{
            path = files[0].path.substr(0, files[0].path.lastIndexOf("'\'"));
        }
        readDirectory(path);
    }, false);

});

function readDirectory(directoryPath) {
    $('#inputPath').val(directoryPath);
    var t = $('#table_id').DataTable();
    t.clear().draw();
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            console.log("Error getting directory information.")
            swal.fire({
                    title: 'Erreur !',
                    text: 'Impossible de lire le contenu du dossier',
                    icon: 'error',
                    confirmButtonText: 'Ok'
                })
        } else {
            files.forEach(function (file) {
                fs.stat(directoryPath + `/${file}`, function (err, stats) {
                    var column1 = null;
                    var column2 = null;
                    var column3 = null;
                    var column4 = null;
                    var date = new Date(stats.atime);
                    var icon = '<span class="material-icons" style="color: blue;">\n' +
                        'description\n' +
                        '</span>';
                    var trash = '<span name-file="'+file+'" class="deleteFile material-icons" style="color: red; cursor: pointer;">\n' +
                        'delete\n' +
                        '</span>'
                    if (stats.isDirectory()) {
                        icon = '<span class="material-icons" style="color: gold;">\n' +
                            'folder\n' +
                            '</span>';
                        column1 = '<tr id="'+file+'"><td>' + icon + '</td>';
                        column2 = '<td><a id="nameDirectory" onclick="changeDirectory(event)">' + file + '</a></td>';
                        column3 = '<td>' + date.toLocaleString() + '</td>';
                        column4 = '<td></td></tr>'
                        t.row.add([column1, column2, column3, column4]).draw( false );
                        // console.log(t.row.add([column1.innerHTML, column2.innerHTML, column3.innerHTML]).draw( false ));
                        // $("#bodyTable").append('<tr id="'+file+'"><td>' + icon + '</td><td><a id="nameDirectory" onclick="changeDirectory(event)">' + file + '</a></td><td>' + date.toLocaleString() + '</td></tr>')
                    } else {
                        column1 = '<tr id="'+file+'"><td>' + icon + '</td>';
                        column2 = '<td><a id="nameFile" onclick="openFile(event)">' + file + '</a></td>';
                        column3 = '<td>' + date.toLocaleString() + '</td>';
                        // $("#bodyTable").append('<tr id="'+file+'"><td>' + icon + '</td><td><a id="nameFile" onclick="openFile(event)">' + file + '</a></td><td>' + date.toLocaleString() + '</td><td>' + trash + '</td></tr>')
                        t.row.add([column1, column2, column3, trash]).draw( false );
                    }
                })
            })
        }
    })
}

$('#backPath').click(function () {
    var path = null;
    let lastPath = $('#inputPath').val();
    var os = detectOs();
    if (os == 'Mac OS' || os == 'iOS' || os == 'Linux' || os == 'Android'){
        path = lastPath.substr(0, lastPath.lastIndexOf("/"));
    } else{
        path = lastPath.substr(0, lastPath.lastIndexOf("'\'"));
    }
    readDirectory(path);
});

function openFile(event) {
    var value = $("#inputPath").val();
    var filePath = paths.join(value,event.target.innerText);
    var ext = filePath.substr(filePath.lastIndexOf('.') + 1);
    shell.openPath(filePath);
}

$('#newTab').click(function () {
    window.open('./index.html', '_blank', 'nodeIntegration=yes')
})

function changeDirectory(event) {
    var value = $("#inputPath").val();
    var path = paths.join(value,event.target.innerText);
    readDirectory(path);
}

$(document).on('click','.deleteFile',function(){
    var name = $(this).attr('name-file');
    var path = paths.join($("#inputPath").val(),name)
    fs.unlink(path, function (err) {
        if (err) throw err;
        // if no error, file has been deleted successfully
        console.log('File deleted!');
        var line = document.getElementById(name);
        $(line).remove();
        swal.fire({
            title: 'Succès !',
            text: 'Le fichier a bien été supprimé',
            icon: 'success',
            confirmButtonText: 'Ok'
        })
    });
});

function detectOs() {
    var userAgent = window.navigator.userAgent,
        platform = window.navigator.platform,
        macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
        windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'],
        iosPlatforms = ['iPhone', 'iPad', 'iPod'],
        os = null;

    if (macosPlatforms.indexOf(platform) !== -1) {
        os = 'Mac OS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        os = 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        os = 'Windows';
    } else if (/Android/.test(userAgent)) {
        os = 'Android';
    } else if (!os && /Linux/.test(platform)) {
        os = 'Linux';
    }
    return os;
}
