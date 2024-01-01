const fs = require("fs");
const path = require("path");

class Logger{
    log(message){
        const currentDate = new Date();
        // console.log(`{${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}} ${text} `);

        const timestamp = `[${currentDate.toLocaleDateString('en-US', {
            timeZone: "America/Chicago",
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })} ${currentDate.toLocaleTimeString('en-US', {
            timeZone: "America/Chicago",
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        })}]`;

        message = `${timestamp} ${message}\n`;

        const file_path = path.join(__dirname, "log.txt");
        fs.writeFile(file_path, message, { flag: "a+" }, err => {});

    }
}

const logger = new Logger();

module.exports = {
    logger
}
