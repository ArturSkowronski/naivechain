const express = require("express");
const bodyParser = require('body-parser');

const http_port = process.env.HTTP_PORT || 3001;

module.exports.HttpServer = class {
    constructor(routees) {
        const app = express();
        app.use(bodyParser.json());
        routees(app);
        app.listen(http_port, () => console.log('Listening http on port: ' + http_port));
    }
};

