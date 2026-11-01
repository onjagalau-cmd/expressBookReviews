const express = require('express');
const axios = require('axios');
const books = require('./booksdb');
const { isValid, users } = require('./auth_users');

const public_users = express.Router();

public_users.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
  if (isValid(username)) return res.status(409).json({ message: 'Username already exists' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User registered successfully' });
});

public_users.get('/', (req, res) => res.json(books));
public_users.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found' });
});
public_users.get('/author/:author', (req, res) => res.json(Object.fromEntries(
  Object.entries(books).filter(([, book]) => book.author.toLowerCase() === req.params.author.toLowerCase()))));
public_users.get('/title/:title', (req, res) => res.json(Object.fromEntries(
  Object.entries(books).filter(([, book]) => book.title.toLowerCase() === req.params.title.toLowerCase()))));
public_users.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found' });
});

// Tasks 10–13: perform the same four public lookups with asynchronous Axios calls.
const getAllBooks = async () => (await axios.get('http://localhost:5000/')).data;
const getBookByISBN = async (isbn) => (await axios.get(`http://localhost:5000/isbn/${encodeURIComponent(isbn)}`)).data;
const getBooksByAuthor = async (author) => (await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`)).data;
const getBooksByTitle = async (title) => (await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)).data;

module.exports = { general: public_users, getAllBooks, getBookByISBN, getBooksByAuthor, getBooksByTitle };
