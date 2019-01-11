const express = require('express');
const mysql = require('mysql');

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'root',
	database: 'db_mka'
});

const app = express();

db.connect((error) => {
	if (error)
		console.log(error);
	else
		console.log("Connection established");
});


app.get('/', (req, res) => {
	const rows_per_page = 30;
	let page = req.query.page - 1;
	let p = page * rows_per_page
	let query = 
	`SELECT p.* FROM posts AS p
	INNER JOIN (
		SELECT post_id, MAX(date_scraped) AS date_scraped
		FROM posts
		GROUP BY post_id
	) AS tp
	ON p.post_id = tp.post_id AND tp.date_scraped = p.date_scraped 
	WHERE 1=1 `;
	if (req.query.SearchId)
		query += `AND p.search_id = ${req.query.SearchId} `;
	if (req.query.sfig == true)
		query += `AND p.salary_text REGEXP '[0-9]{3},*[0-9]{3}' `;
	if (req.query.ez == true)
		query += `AND p.ez_apply != '0' `;
	query += `LIMIT ${p}, ${rows_per_page};`;
	db.query(query, (error, results) => {
		if (error)
			return res.send(error);
		else {
			return res.json({
				data:results,
			})
		}
	});
});

app.get('/getPost', (req, res) => {
	let query = `SELECT IF(p.ez_apply="0", "", p.ez_apply) AS ez_apply, p.id, p.post_id, p.title, p.company, p.location, IF(p.salary_text="0", "", p.salary_text) AS salary_text, IF(p.date_posted_text="0", "", p.date_posted_text) AS date_posted_text, p.date_scraped, p.url, p.body, p.search_id, sc.job_desc, sc.location FROM posts AS p LEFT JOIN search_criteria AS sc ON p.search_id = sc.id WHERE p.id = ${req.query.id}`;
	db.query(query, (error, results) => {
		if (error)
			return res.send(error);
		else {
			return res.json({
				data:results,
			})
		}
	});
});

app.get('/getSearches', (req, res) => {
	let query = `SELECT sc.* FROM search_criteria AS sc WHERE sc.active = 1;`;
	db.query(query, (error, results) => {
		if (error)
			return res.send(error);
		else {
			return res.json({
				data:results,
			})
		}
	});
});

app.listen('8889', () => {
	console.log("Server started on port 8889");
});
