import mongoose from 'mongoose';
import { userSchema } from '../models/userModel';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const User = mongoose.model('User', userSchema);

export const registerUser = (req, res) => {
  if (!req.body.name || !req.body.email || !req.body.password) {
    return res.status(400).json({
      message: 'Missing form parameters! Requires name, email, and password.',
    });
  }

  User.find({ email: req.body.email }, (err, userExist) => {
    if (err) return res.status(500).json({ message: 'Registration failed!' });
    if (userExist.length > 0)
      return res.status(409).json({ message: 'User already exists!' });
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    let newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      admin: false,
    });
    newUser.save((err, user) => {
      if (err)
        return res.status(500).json({ message: 'User registration failed!' });
      const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET);
      user.token = token;
      user.save();
      res.status(200).json({ auth: true, token: newUser.token });
    });
  });
};

export const checkUser = (req, res) => {
  User.findById(req.userId, { password: 0, __v: 0, token: 0 }, (err, user) => {
    if (err) return res.status(500).json({ message: 'There was a problem!' });
    if (!user) return res.status(404).send({ message: 'User does not exist!' });

    res.status(200).send(user);
  });
};

export const loginUser = (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) return res.status(500).json({ message: 'Login failed!' });
    if (!user) return res.status(404).json({ message: 'User does not exist!' });

    const passwordValid = bcrypt.compareSync(req.body.password, user.password);
    if (!passwordValid)
      return res.status(401).json({ auth: false, token: null });

    if (!user.token) {
      const token = jwt.sign({ id: user._id }, process.env.AUTH_SECRET);
      user.token = token;
      user.save();
    }
    res.status(200).json({ auth: true, token: user.token });
  });
};

export const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'];
  if (!token)
    return res.status(403).send({ auth: false, message: 'No token provided.' });
  jwt.verify(token, process.env.AUTH_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(500)
        .send({ auth: false, message: 'Failed to authenticate token!' });
    }
    req.userId = decoded.id;
    next();
  });
};

export const verifyAdmin = (req, res, next) => {
  if (!req.userId)
    return res.status(500).json({ message: 'Authentication Error' });
  User.findById(req.userId, (err, user) => {
    if (err) return res.status(500).send({ message: 'Authentication Error' });
    if (!user.admin) return res.status(401).json({ message: 'Unauthorized!' });
    next();
  });
};
