require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const sequelize = require('./db/config');
const Page = require('./db/models/Page');

// Verify required environment variables
if (!process.env.DATABASE_URL) {
  console.error('Missing required environment variable: DATABASE_URL');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Session middleware
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// Routes
app.get('/', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { slug: 'home' } });
    res.render('page', { page, isEditing: false });
  } catch (error) {
    console.error('Error loading page:', error);
    res.status(500).send('Error loading page');
  }
});

app.get('/edit/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { slug: req.params.slug } });
    if (!page) {
      return res.status(404).render('404');
    }
    res.render('page', { page, isEditing: true });
  } catch (error) {
    console.error('Error loading page:', error);
    res.status(500).send('Error loading page');
  }
});

app.put('/page/:slug', async (req, res) => {
  try {
    const { title, content } = req.body;
    await Page.update(
      { title, content, lastModified: new Date() },
      { where: { slug: req.params.slug } }
    );
    res.redirect('/');
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).send('Error updating page');
  }
});

// Error handling
app.use((req, res) => {
  res.status(404).render('404');
});

// Start server
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}/`);
    });
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });
