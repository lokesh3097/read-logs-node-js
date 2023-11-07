const fs = require('fs');
const readline = require('readline');

const logsService = require('../services/logs.service');

const logFilePath = './example.log';
let cacheBuff = 0;

async function getNextLogs(req, res, next) {
    try {
        const timestamp = req.query.timestamp;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 10;

        // console.log("TS FROM REQ: ", timestamp);

        const logsRes = await logsService.getClosestLowerTimestamp(timestamp);
        // console.log("LOGS RES: ", logsRes);

        if (logsRes.length !== 0) {
            cacheBuff = logsRes[0]['bytes'];
            // console.log("CacheBuff from DB: ", cacheBuff);
        } else {
            cacheBuff = 0;
        }

        // console.log("Cache Buff before update: ", cacheBuff);
        const fileStream = fs.createReadStream(logFilePath, {start: cacheBuff});

        const rl = readline.createInterface({ input: fileStream });

        let result = [];
        let lineNumber = 0;

        let sumLength = 0;
        let totalLineCount = 0;

        let limitReached = false;

        let lastTimestamp = '';

        let prevTimestamp = '';
        let prevBytes = 0;

        let found = false;

        let lengthSum = 0;

        fileStream.on('error', (err) => {
            console.error('Error reading the log file:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        });

        rl.on('line', async (line) => {

            if (limitReached) {
                // console.log("IN LIMIT REACHED");
                return;
            }

            if (line.trim() === '') return;

            // console.log("LINE: ", line);
            ++totalLineCount;

            const len = Buffer.byteLength(line);
            const stringLength = line.length;
            sumLength = sumLength + len;
            lengthSum = lengthSum + stringLength;
            
            const firstSpaceIndex = line.indexOf(' ');
            const lineTimestamp = line.substring(0, firstSpaceIndex);
            const lineText = line.substring(firstSpaceIndex+1);

            if (timestamp && lineTimestamp < timestamp) {
                prevTimestamp = lineTimestamp;
                prevBytes = sumLength + 2*totalLineCount; // 2x because there seems to be a space at the start of the line too
                // console.log("SUM LENGTH: ", sumLength);
                // console.log("PREV BYTES: ", prevBytes);
                // console.log("TOTAL LINE COUNT: ", totalLineCount);
                // console.log("LENGTH SUM: ", lengthSum);
                return;
            }

            if (!found && prevBytes !== 0) {
                found = true;
                logsService.insertIntoCache(prevTimestamp, prevBytes);
            }

            // console.log("LINE: ", line);
            if (lineNumber >= offset && result.length < limit) {
                const tempString = lineTimestamp + ' ' + lineText;
                result.push(tempString);
            }

            if (result.length >= limit) {
                // console.log("SUM LENGTH: ", sumLength);
                // console.log("PREV BYTES: ", prevBytes);
                // console.log("TOTAL LINE COUNT: ", totalLineCount);
                // console.log("LENGTH SUM: ", lengthSum);
                limitReached = true;
                lastTimestamp = lineTimestamp;
                cacheBuff = cacheBuff + sumLength + 2*totalLineCount; // 2x because there seems to be a space at the start of the line too
                fileStream.destroy();
            }

            lineNumber++;
        });

        fileStream.on('close', async () => {
            // console.log("Ended the file stream, Sum: ", sumLength);
            // console.log("Cahche Buff: ", cacheBuff);
            await logsService.insertIntoCache(lastTimestamp, cacheBuff);
            res.setHeader('Content-Type', 'text/plain');
            res.send(result.join('\n'));

            // console.log("FILE CLOSED");
        });

    } catch (err) {
        console.error('Error while getting logs', err.message);
        next(err);
    }
};

module.exports = {
    getNextLogs
};
