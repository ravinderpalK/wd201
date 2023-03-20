const http = require("http")
const fs = require("fs")

const args = require("minimist")(process.argv.slice(2))

let homeHtml = ""
let projectHtml = ""
let registerationHtml = ""

fs.readFile(
    "registeration.html",
    (err, data) => {
        if (err) throw err
        registerationHtml += data
    }
)

fs.readFile(
    "home.html",
    (err, home) => {
        if (err) throw err
        homeHtml += home
    })

fs.readFile(
    "project.html",
    (err, project) => {
        if (err) throw err
        projectHtml = project
    })

http.createServer(
    (req, res) => {
        let url = req.url
        res.writeHeader(200, { "Content-Type" : "text/html" });
        switch (url) {
            case "/project" :
                res.write(projectHtml);
                res.end();
                break;
            case "/registeration" :
                res.write(registerationHtml);
                res.end();
                break;
            default :
                res.write(homeHtml);
                res.end();
                break;
        }
    }
).listen(args._[0]);