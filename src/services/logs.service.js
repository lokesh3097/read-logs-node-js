const db = require('./db.service');

async function insertIntoCache(logTime, bytes) {
    const sql = "INSERT IGNORE INTO logs_cache (log_time, bytes) VALUES (?, ?);";
    let status = "FAILED";
    try {
        const result = await db.query(sql, [logTime, bytes]);
        if (result.affectedRows) {
            status = "OK";
        }
    } catch (error) {
        console.log("ERROR IN INSERT: ", error.message);
    }
    
    return {
        status: status
    };
}

async function getClosestLowerTimestamp(timestamp) {
    const sql = "SELECT * FROM logs_cache WHERE DATE_FORMAT(log_time, '%Y-%m-%dT%H:%i:%s') <= STR_TO_DATE(?, '%Y-%m-%dT%H:%i:%s') ORDER BY log_time DESC LIMIT 1;";
    const rows = await db.query(sql, [timestamp]);

    return rows;
}

module.exports = {
    insertIntoCache,
    getClosestLowerTimestamp
}