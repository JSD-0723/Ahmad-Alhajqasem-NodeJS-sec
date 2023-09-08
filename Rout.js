const express = require('express');
const fs = require('fs').promises; // Use 'promises' for async file operations
const path = require('path');
const bodyParser = require('body-parser');
const pug = require('pug');

const app = express();
const port = 3000;
const host = 'localhost'
app.set('view engine', 'pug'); // Correct the setting name to 'view engine'
app.set('views', path.resolve('./views')); // Correct the setting name to 'views'

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const booksFilePath = path.resolve('./books.json');

// Helper function to load books from the JSON file
async function loadBooks() {
    try {
        const data = await fs.readFile(booksFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (err) {
        return []; // Return an empty array if the file doesn't exist or is empty
    }
}

// Helper function to save books to the JSON file
async function saveBooks(books) {
    await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2), 'utf8');
}


////////////////////////////////////////////////////first Api//////////////////////////////////
app.get('/books', async (req, res,next) => { // Make the route handler async
    try{
    const books = await loadBooks(); // Await the result of loadBooks()
    res.render('books.pug', { books }); // Use res.render() to render the Pug template}
    }catch(err){
next(err)
    }
});


///////////////////////////////////////////////////seconde api/////////////////////////////////
app.get('/books/:id', async (req, res,next) => {
    try{
    let books = await loadBooks();
    const bookId = parseInt(req.params.id);
    let foundBook = null;

    for (let i = 0; i < books.length; i++) {
        if (parseInt(books[i].id) === bookId) {
            foundBook = books[i];
            break; // Stop the loop once the book is found
        }
    }
    books = []
    books.push(foundBook)
    if (!books) {
        return res.status(404).send('Book not found.');
    }

    res.render('books.pug', { books });}
    catch(err){
        next(err)
    }
});



//////////////////////////////////////////////////////third api ////////////////////////////////////
app.post('/books', async (req, res,next) => {
    try{ // Make the route handler async
    const books = await loadBooks(); // Await the result of loadBooks()
    const newBook = req.body;

    if (!newBook || !newBook.id || !newBook.name) {
        return res.status(400).send('Invalid book details.');
    }

    books.push(newBook);
    await saveBooks(books); // Await the result of saveBooks()

    res.send('Book added successfully.');}
    catch(err){
        next(err)
    }
});

app.use((req, res) => {
    res.status(404).send('Invalid endpoint.');
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong.');
});

app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
