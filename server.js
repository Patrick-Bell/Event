const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/user'); // Importing the User model
const EventModel = require('./models/event')
const ReviewModel = require('./models/review')
const registerRouter = require('./register');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const { updateEventStatus, sendEmailReminder, sendWeeklyReport } = require('./event-handle');
const MongoDBStore = require('connect-mongodb-session')(session);
const nodemailer = require('nodemailer')
const cron = require('node-cron')


const bodyParser = require('body-parser')

const app = express();

const initializePassport = require('./passport-config');
const reviewModel = require('./models/review');
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

app.set('view-engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.json());
app.use(flash());

const store = new MongoDBStore({
  uri: process.env.MONGO_URI,
  collection: 'sessions' // Specify the collection name for session storage
});

app.use(
  session({
    secret: "sessionSecret",
    resave: false,
    saveUninitialized: false,
    store: store
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


app.get('/api/events', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await EventModel.find({ createdBy: userId });
    res.status(200).json(events)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Server Error'})
  }
})

app.get('/api/past-events', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await EventModel.find({ createdBy: userId, status: 'past' });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/future-events', checkAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const events = await EventModel.find({ createdBy: userId, status: 'future' });
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await ReviewModel.find()
    res.status(200).json(reviews)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Error'})
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
    res.redirect('/');
  });
});

app.post('/api/reviews', checkAuthenticated, async (req, res) => {
  try {
    const createdBy = req.user._id;
    const name = req.user.username;
    const image = req.user.image;
    const joined = req.user.joined
    const {id, reviewTitle, reviewText, reviewRating, dateSubmitted } = req.body

    console.log('Recieved Review', req.body)

    const newReview = new ReviewModel({
      id,
      name,
      image,
      createdBy,
      joined,
      reviewTitle,
      reviewText,
      reviewRating,
      dateSubmitted
    })
    console.log(newReview)
    const saveReview = await newReview.save()
    res.status(201).json(saveReview)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal Error'})
  }
})

app.post('/api/events', checkAuthenticated, async (req, res) => {
  try {
    const createdBy = req.user._id;
    const createdByUser = req.user.username
    const createdByEmail = req.user.email
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
      createdByUser,
      createdByEmail,
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

app.delete('/api/events/:id', checkAuthenticated, async (req, res) => {
  const eventId = req.params.id
  console.log('recieved this event to delete', eventId)
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

cron.schedule('5 0 * * *', () => {
  sendEmailReminder();
  console.log('emails?')
});

cron.schedule('0 12 * * 1', () => {
  sendWeeklyReport()
})

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
