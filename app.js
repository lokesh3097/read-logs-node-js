const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const logsRouter = require('./src/routes/logs.route');

app.use(bodyParser.json());
app.use(
	bodyParser.urlencoded({
		extended: true,
	})
);

app.use('/logs', logsRouter);

app.get('/', (req, res) => {
  	res.json({'message': 'ok'});
});

/* Error handler middleware */
app.use((err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	console.error(err.message, err.stack);
	res.status(statusCode).json({'message': err.message});
	
	return;
});

app.listen(port, () => {
  	console.log(`read-logs listening at http://localhost:${port}`)
});