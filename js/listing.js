const paths = require("path");
const fs = require("fs");
const swal = require('sweetalert2');
const {shell} = require('electron');
const clipboardy = require('clipboardy');

// ---------------------------- LISTE DES FICHIERS -----------------------------
$(document).ready(function () {
    document.getElementById("filepicker").addEventListener("change", function (event) {
        var path = null;
        let files = event.target.files;
        var os = detectOs();
        // Récupération du path sans le fichier selon l'os
        if (os == 'Mac OS' || os == 'iOS' || os == 'Linux' || os == 'Android') {
            path = files[0].path.substr(0, files[0].path.lastIndexOf("/"));
        } else {
            path = files[0].path.substr(0, files[0].path.lastIndexOf("'\'"));
        }
        readDirectory(path);
    }, false);

});

function readDirectory(directoryPath) {
    $('#inputPath').val(directoryPath);
    var t = $('#table_id').DataTable();
    t.clear().draw();
    // Lecture du dossier
    fs.readdir(directoryPath, function (err, files) {
        if (err) {
            swal.fire({
                title: 'Erreur !',
                text: 'Impossible de lire le contenu du dossier',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        } else {
            // Création d'une ligne pour chaque fichier et dossier présent
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
                    var trash = '<td><span name-file="' + file + '" class="deleteFile material-icons" style="color: red; cursor: pointer;">\n' +
                        'delete\n' +
                        '</span>' +
                        '<span name-file="' + file + '" class="copyFile material-icons" style="color: red; cursor: pointer;">\n' +
                        'file_copy\n' +
                        '</span></td></tr>'
                    if (stats.isDirectory()) {
                        icon = '<span class="material-icons" style="color: gold;">\n' +
                            'folder\n' +
                            '</span>';
                        column1 = '<tr id="' + file + '"><td>' + icon + '</td>';
                        column2 = '<td><a id="nameDirectory" onclick="changeDirectory(event)">' + file + '</a></td>';
                        column3 = '<td>' + date.toLocaleString() + '</td>';
                        column4 = '<td></td></tr>'
                        t.row.add([column1, column2, column3, column4]).draw(false);
                    } else {
                        column1 = '<tr id="' + file + '"><td>' + icon + '</td>';
                        column2 = '<td><a id="nameFile" onclick="openFile(event)" class="drag">' + file + '</a></td>';
                        column3 = '<td>' + date.toLocaleString() + '</td>';
                        t.row.add([column1, column2, column3, trash]).draw(false);
                    }
                })
            })
        }
    })
}

// ---------------------------- NAVIGATION -----------------------------

$('#backPath').click(function () {
    var path = null;
    let lastPath = $('#inputPath').val();
    var os = detectOs();
    if (os == 'Mac OS' || os == 'iOS' || os == 'Linux' || os == 'Android') {
        path = lastPath.substr(0, lastPath.lastIndexOf("/"));
    } else {
        path = lastPath.substr(0, lastPath.lastIndexOf("'\'"));
    }
    readDirectory(path);
});

function changeDirectory(event) {
    var value = $("#inputPath").val();
    var path = paths.join(value, event.target.innerText);
    readDirectory(path);
}

// ---------------------------- OUVERTURE FICHIER -----------------------------

function openFile(event) {
    var value = $("#inputPath").val();
    var filePath = paths.join(value, event.target.innerText);
    // Ouverture du fichier via le programme par défaut
    shell.openPath(filePath);
}

// ---------------------------- NOUVELLE FENETRE -----------------------------

$('#newTab').click(function () {
    window.open('./index.html', '_blank', 'nodeIntegration=yes')
})

// ---------------------------- COPIE/COLLE FICHIER -----------------------------

$(document).on('click', '.copyFile', function () {
    var name = $(this).attr('name-file');
    var path = paths.join($("#inputPath").val(), name)
    // Copie du path du fichier dans le clipboard
    clipboardy.write(path)
    $('#pasteFile').css('display', 'inline-block');
    swal.fire({
        title: 'Succès !',
        text: 'Enregistrement du fichier à copier effectué ! Veuillez le coller dans le dossier voulu',
        icon: 'success',
        confirmButtonText: 'Ok'
    })
});

$(document).on('click', '#pasteFile', function () {
    var path = $("#inputPath").val();
    // Récupération du path copié précedemment
    clipboardy.read().then(function (result) {
        if (result) {
            // Récupération du non du fichier
            var os = detectOs();
            if (os == 'Mac OS' || os == 'iOS' || os == 'Linux' || os == 'Android') {
                var name = result.slice(result.lastIndexOf('/') + 1);
            } else {
                var name = result.slice(result.lastIndexOf("'\'") + 1);
            }
            var filePath = paths.join(path, name);
            // On colle le nouveau fichier dans le path de destination
            fs.copyFile(result, filePath, (err) => {
                if (err) {
                    swal.fire({
                        title: 'Erreur !',
                        text: 'Erreur lors de la copie du fichier',
                        icon: 'error',
                        confirmButtonText: 'Ok'
                    })
                }
                swal.fire({
                    title: 'Succès !',
                    text: 'Le fichier a bien été copié !',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                })
                readDirectory(path);
            });
        }
    });
});

// ---------------------------- SUPPRESSION FICHIER -----------------------------

$(document).on('click', '.deleteFile', function () {
    var name = $(this).attr('name-file');
    var path = $("#inputPath").val();
    var filePath = paths.join(path, name)
    // Suppression du fichier
    fs.unlink(filePath, function (err) {
        if (err) {
            swal.fire({
                title: 'Erreur !',
                text: 'Erreur dans la suppression du fichier',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
        var line = document.getElementById(name);
        $(line).remove();
        swal.fire({
            title: 'Succès !',
            text: 'Le fichier a bien été supprimé',
            icon: 'success',
            confirmButtonText: 'Ok'
        })
        readDirectory(path)
    });
});

// ---------------------------- DETECTION DU OS -----------------------------

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
