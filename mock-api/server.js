/**
 * Local SaaS / e-commerce style REST API for Newman / Postman tests.
 * Mirrors FakeStoreAPI-style routes so collections run offline and CI stays deterministic.
 */
'use strict';

const express = require('express');

const PORT = Number(process.env.PORT) || 34567;
const VALID_USERNAME = 'mor_2314';
const VALID_PASSWORD = '83r5^_';

/** @type {Set<string>} */
const issuedTokens = new Set();

function issueToken() {
  const t = `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify({ sub: VALID_USERNAME, iat: Date.now() })).toString('base64url')}.mock-signature-${Date.now()}`;
  issuedTokens.add(t);
  return t;
}

function bearerToken(req) {
  const h = req.headers.authorization || '';
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : '';
}

function requireAuth(req, res, next) {
  const t = bearerToken(req);
  if (!t || !issuedTokens.has(t)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

const categories = ['electronics', 'jewelery', "men's clothing", "women's clothing"];

/** @type {object[]} */
let users = [
  {
    id: 1,
    email: 'john@gmail.com',
    username: 'johnd',
    password: 'm38rmF$',
    name: { firstname: 'John', lastname: 'Doe' },
    phone: '1-570-236-7033',
    address: {
      city: 'kilcoole',
      street: '7835 new road',
      number: 3,
      zipcode: '12926-3874',
      geolocation: { lat: '-37.3159', long: '81.1496' },
    },
  },
  {
    id: 2,
    email: 'morrison@gmail.com',
    username: 'mor_2314',
    password: '83r5^_',
    name: { firstname: 'david', lastname: 'morrison' },
    phone: '1-570-236-7033',
    address: {
      city: 'el paso',
      street: '866 johnston st',
      number: 2,
      zipcode: '12345',
      geolocation: { lat: '30.2478', long: '-97.7431' },
    },
  },
  {
    id: 3,
    email: 'kevin@gmail.com',
    username: 'kevinryan',
    password: 'kev02937@',
    name: { firstname: 'kevin', lastname: 'ryan' },
    phone: '1-567-094-1349',
    address: {
      city: 'san Antonio',
      street: '995 lincoln st',
      number: 3,
      zipcode: '78234',
      geolocation: { lat: '25.8574', long: '-97.5022' },
    },
  },
];

/** @type {object[]} */
let products = [
  {
    id: 1,
    title: 'Fjallraven Backpack',
    price: 109.95,
    description: 'Your perfect pack for everyday use and walks in the forest.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
    rating: { rate: 3.9, count: 120 },
  },
  {
    id: 2,
    title: 'Mens Casual Premium Slim Fit T-Shirts',
    price: 22.3,
    description: 'Slim-fitting style.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
    rating: { rate: 4.1, count: 259 },
  },
  {
    id: 3,
    title: 'Mens Cotton Jacket',
    price: 55.99,
    description: 'Great outerwear jackets for Spring/Autumn/Winter.',
    category: 'electronics',
    image: 'https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_.jpg',
    rating: { rate: 4.7, count: 500 },
  },
  {
    id: 4,
    title: 'Mens Casual Slim Fit',
    price: 15.99,
    description: 'The color could be slightly different between on the screen and in practice.',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/71YXzeO-uIL._AC_UX679_.jpg',
    rating: { rate: 2.1, count: 430 },
  },
  {
    id: 5,
    title: "John Hardy Women's Legends Naga Gold Bracelet",
    price: 695,
    description: 'From our Legends Collection.',
    category: 'jewelery',
    image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_FMwebp_QL65_.jpg',
    rating: { rate: 4.6, count: 400 },
  },
];

/** @type {object[]} */
let carts = [
  {
    id: 1,
    userId: 1,
    date: '2020-10-10',
    products: [{ productId: 1, quantity: 2 }],
  },
  {
    id: 2,
    userId: 1,
    date: '2021-06-15',
    products: [
      { productId: 2, quantity: 1 },
      { productId: 3, quantity: 3 },
    ],
  },
  {
    id: 3,
    userId: 2,
    date: '2022-01-20',
    products: [{ productId: 4, quantity: 1 }],
  },
];

let nextUserId = users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
let nextProductId = products.reduce((m, p) => Math.max(m, p.id), 0) + 1;
let nextCartId = carts.reduce((m, c) => Math.max(m, c.id), 0) + 1;

const app = express();
app.use(express.json());

// Simple rate-limit simulation header (optional visibility for tests)
let requestCount = 0;
app.use((req, res, next) => {
  requestCount += 1;
  res.setHeader('X-Request-Id', String(requestCount));
  next();
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-saas-api' });
});

app.post('/auth/login', (req, res) => {
  const body = req.body || {};
  const { username, password } = body;

  if (!username && !password) {
    return res.status(400).json({ message: 'username and password required' });
  }
  if (!username) {
    return res.status(400).json({ message: 'username required' });
  }
  if (!password) {
    return res.status(400).json({ message: 'password required' });
  }
  if (username === VALID_USERNAME && password === VALID_PASSWORD) {
    const token = issueToken();
    return res.json({ token });
  }
  return res.status(401).json({ message: 'Invalid credentials' });
});

function publicUser(u) {
  if (!u) return u;
  const { password: _p, ...rest } = u;
  return rest;
}

app.get('/users', (req, res) => {
  let list = users.map(publicUser);
  const lim = req.query.limit ? parseInt(String(req.query.limit), 10) : null;
  if (lim && lim > 0) {
    list = list.slice(0, lim);
  }
  res.json(list);
});

app.get('/users/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const u = users.find((x) => x.id === id);
  if (!u) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(publicUser(u));
});

app.post('/users', requireAuth, (req, res) => {
  const body = req.body;
  const nu = {
    id: nextUserId++,
    email: body.email,
    username: body.username,
    password: body.password || 'x',
    name: body.name || { firstname: 'T', lastname: 'U' },
    phone: body.phone || '',
    address: body.address || {
      city: '',
      street: '',
      number: 0,
      zipcode: '',
      geolocation: { lat: '0', long: '0' },
    },
  };
  users.push(nu);
  res.status(201).json({ id: nu.id });
});

app.put('/users/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = users.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  users[idx] = { ...users[idx], ...req.body, id };
  res.json(publicUser(users[idx]));
});

app.patch('/users/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = users.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  users[idx] = { ...users[idx], ...req.body, id };
  res.json(publicUser(users[idx]));
});

app.delete('/users/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = users.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  users.splice(idx, 1);
  res.json({ id });
});

app.get('/products', (req, res) => {
  let list = [...products];
  if (req.query.sort === 'desc') {
    list.sort((a, b) => b.id - a.id);
  }
  res.json(list);
});

app.get('/products/categories', (req, res) => {
  res.json(categories);
});

app.get('/products/category/:name', (req, res) => {
  const name = req.params.name;
  const list = products.filter((p) => p.category === name);
  res.json(list);
});

app.get('/products/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const p = products.find((x) => x.id === id);
  if (!p) {
    return res.status(404).json({ message: 'Not found' });
  }
  res.json(p);
});

app.post('/products', requireAuth, (req, res) => {
  const body = req.body;
  const p = {
    id: nextProductId++,
    title: body.title,
    price: Number(body.price),
    description: body.description || '',
    category: body.category || 'electronics',
    image: body.image || 'https://fakestoreapi.com/img/placeholder.jpg',
    rating: { rate: 4.5, count: 1 },
  };
  products.push(p);
  res.status(201).json(p);
});

app.put('/products/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = products.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  products[idx] = { ...products[idx], ...req.body, id };
  res.json(products[idx]);
});

app.delete('/products/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = products.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  products.splice(idx, 1);
  res.json({ id });
});

app.get('/carts', (req, res) => {
  let list = [...carts];
  const sd = req.query.startdate;
  const ed = req.query.enddate;
  if (sd && ed) {
    list = list.filter((c) => c.date >= sd && c.date <= ed);
  }
  res.json(list);
});

app.get('/carts/user/:userId', (req, res) => {
  const t = bearerToken(req);
  if (t && !issuedTokens.has(t)) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const uid = parseInt(req.params.userId, 10);
  const list = carts.filter((c) => c.userId === uid);
  res.json(list);
});

app.get('/carts/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const c = carts.find((x) => x.id === id);
  if (!c) {
    return res.status(404).json({ message: 'Cart not found' });
  }
  res.json(c);
});

app.post('/carts', requireAuth, (req, res) => {
  const body = req.body || {};
  const productsLine = body.products || [];
  const bad = productsLine.some(
    (line) =>
      line.quantity <= 0 ||
      line.productId < 1 ||
      !products.some((p) => p.id === line.productId)
  );
  if (bad) {
    return res.status(400).json({ message: 'Invalid product or quantity' });
  }
  const c = {
    id: nextCartId++,
    userId: body.userId,
    date: body.date || new Date().toISOString().split('T')[0],
    products: productsLine,
  };
  carts.push(c);
  res.status(201).json(c);
});

app.put('/carts/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = carts.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  carts[idx] = { ...carts[idx], ...req.body, id };
  res.json(carts[idx]);
});

app.delete('/carts/:id', requireAuth, (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = carts.findIndex((x) => x.id === id);
  if (idx === -1) {
    return res.status(404).json({ message: 'Not found' });
  }
  carts.splice(idx, 1);
  res.json({ id });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found', path: req.path });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock SaaS API listening on http://127.0.0.1:${PORT}`);
});
