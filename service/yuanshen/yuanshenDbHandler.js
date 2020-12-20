var sqlite3 = require('sqlite3').verbose();

const DBSOURCE = './service/yuanshen/data/yuanshen.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
        // Cannot open database
        console.error(err.message);
        throw err;
    } else {
        console.log('Connecting to the SQLite database...');
        db.run('SELECT *  FROM Figure',
            (err) => {
                if (err) {
                // Table missing
                    console.log('Cant access SQLite database');
                }
            });
    }
});

// wrapper for access sqlite
const executeQuery = (sql, params, callback) => {
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.log(err.message);
            return;
        }
        callback(rows);
    });
};

const executeQueryForSingleEntry = (sql, params, callback) => {
    const singleCallback = function (entry) {
        if (entry == null) {
            callback(null);
        } else {
            if (entry.length > 0) {
                //console.log(entry[0]);
                callback(entry[0]);
            }
        }
    };
    executeQuery(sql, params, singleCallback);
};

module.exports = {
    executeQuery,
    executeQueryForSingleEntry
};
