# read-logs-node-js

Node.js Code for reading logs from a log file through HTTP requests

## How to run the App?

1. Clone the repo onto your machine
2. Run `npm install`
3. Rename the `.env.sample` file to `.env`
4. Rename the `example.log.sample` to `example.log`
5. Bring up MySQL Server on your local machine (Using XAMPP or LAMPP)
6. Update the values in the new **.env** file accordingly for your Database (Generally they are the same)
7. Copy the content of the [**nektar_logs.sql**](https://github.com/lokesh3097/tasks-crud-assignment-node-js/blob/main/my_tasks_db_no_data.sql)
8. You can also create the DB and then run the file to avoid any errors. Make sure that the DB name matches with the one in `.env` file
9. Bring up the Server using `node app.js`
10. You can test the API Endpoints using the [Postman Collection Export](https://github.com/lokesh3097/read-logs-node-js/blob/main/nektar-test.postman_collection.json) that I have created
