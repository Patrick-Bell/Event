// register.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('./models/user');

router.get('/', (req, res) => {
  res.render('register.ejs', { messages: req.flash('error') });
});

router.post('/', async (req, res) => {
  try {
    // Check if req.body.email and req.body.username are defined
    if (!req.body.email || !req.body.username) {
      console.log('Email:', req.body.email);
      console.log('Username:', req.body.username);
      req.flash('error', 'Email and username are required');
      return res.redirect('/register');
    }

    // Trim and convert email and username to lowercase
    const email = req.body.email.trim().toLowerCase();
    const username = req.body.username.trim().toLowerCase();

    const existingUser = await User.findOne({
      $or: [
        { email: email },
        { username: username },
      ],
    });

    if (existingUser) {
      req.flash('error', 'User with this email or username already exists');
      console.log("User already exists")
      return res.redirect('/register');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = new User({
      image: req.body.image,
      username: req.body.username,
      number: req.body.number,
      birthday: req.body.birthday,
      password: hashedPassword,
      email: req.body.email.toLowerCase(),
      joined: new Date().toLocaleString()
    });

    await newUser.save();
    console.log(`User ${req.body.email} registered successfully.`);

    res.redirect('/login');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error during registration');
    res.redirect('/register');
  }
});

module.exports = router;
