const express = require('express');
const path = require('path');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const sequelize = require('./db/config');
const Page = require('./db/models/Page');

const app = express();
const PORT = process.env.PORT || 8080;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride('_method'));

// Session middleware using Railway's DATABASE_URL
app.use(session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }),
  secret: process.env.SESSION_SECRET || 'default-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

// Routes
app.get('/', async (req, res) => {
  try {
    const page = await Page.findOne({ where: { slug: 'home' } });
    if (!page) {
      // Create default home page if it doesn't exist
      const defaultPage = await Page.create({
        slug: 'home',
        title: 'Welcome to our Website',
        content: '<h1>Welcome</h1><p>This is your homepage. Click edit to modify this content.</p>'
      });
      return res.render('page', { page: defaultPage, isEditing: false });
    }
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

// Database sync and server start
sequelize.sync()
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Unable to sync database:', err);
    process.exit(1);
  });
