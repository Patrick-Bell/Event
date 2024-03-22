const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user'); // Importing the User model
const EventModel = require('./models/event')
const registerRouter = require('./register');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const updateEventStatus = require('./event-handle');
const RedisStore = require('connect-redis')(session); // Import connect-redis and pass the session module to it
const redis = require('redis');

const bodyParser = require('body-parser')

const app = express();

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  async (email) => {
    try {
      const user = await User.findOne({ email: email });
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  },
  async (id) => {
    try {
      const user = await User.findById(id);
      return user;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))



app.set('view-engine', 'ejs');
app.use(flash());

const redisClient = redis.createClient();


app.use(
  session({
    store: new RedisStore({ client: redisClient }), // Pass the Redis client to the RedisStore constructor
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));


const uri = process.env.MONGO_URI

mongoose.connect(uri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB database');
});

app.get('/events', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user
    const username = user.username
    res.render('events.ejs', {username})
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/profile', checkAuthenticated, async (req, res) => {
  try {
    const user = await req.user;
    const username = user.username
    const email = user.email
    const number = user.number
    const birthday = user.birthday
    const joined = user.joined
    const image = user.image
    res.render('profile.ejs', {username, email, number, birthday, joined, image})
  } catch (error) {
    console.error('Error', error)
    res.status(500).json({error: 'error'})
  }
})


app.get('/api/events', async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await EventModel.find({ createdBy: userId });
    res.status(200).json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

app.get('/api/past-events', async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await EventModel.find({ createdBy: userId, status: 'past' });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/future-events', async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await EventModel.find({ createdBy: userId, status: 'future' });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs');
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/events',
  failureRedirect: '/login',
  failureFlash: true,
}), (req, res, next) => {
  // This callback will be called after authentication is successful
  // You can use req.user here
  console.log('Authenticated User:', req.user);

  // Continue with the next middleware
  next();
});


app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs');
});

app.use('/register', registerRouter);


app.delete('/logout', checkAuthenticated, (req, res) => {
  console.log("logging out")
  // Use a callback function as required by req.logout
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});


app.post('/api/events', async (req, res) => {
  try {
    const createdBy = req.user._id;
    const { id, title, subtitle, date, days, color, status } = req.body;
  
      console.log('Creating event:', req.body); // Log the event object before saving

      const newEvent = new EventModel({
      id,
      title,
      subtitle,
      date,
      days,
      color,
      createdBy,
      status
      })
      // Save the event to the database
      const savedEvent = await newEvent.save()
      console.log('Event saved successfully:', savedEvent); // Log the saved event
      updateEventStatus()
      res.status(201).json(savedEvent);
  } catch (error) {
      console.error('Error creating event:', error); // Log any errors that occur
      res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;
  try {
    const result = await EventModel.deleteOne({ id: eventId})
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Event not found'})
    }
    return res.status(200).json({ message: 'Event Deleted'})
  } catch (error) {
    console.error('Error', error)
  }
})




function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  next();
}

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
