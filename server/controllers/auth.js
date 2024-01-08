/*
Refactoring Description:
Extracted Helper Functions:

Extracted helper functions (generateRandomNumber, hashPassword, createNewUser) for better organization and 
readability.
Replaced Magic Values:

Replaced hardcoded magic values with functions for generating random numbers.
Improved Variable Naming:

Improved variable naming for better code comprehension.
Separated Database Interaction:

Separated database interaction logic into a createNewUser function.
Removed Direct Modification of User Object:

Instead of deleting the password property, a new object is created (userWithoutPassword) to exclude 
sensitive information.

Input Validation:
While not explicitly shown in the refactoring, input validation should be added to ensure the correctness 
and security of user data during registration.
*/


import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateRandomNumber = () => Math.floor(Math.random() * 10000);

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const createNewUser = async (userData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    picturePath,
    friends,
    location,
    occupation,
  } = userData;

  const passwordHash = await hashPassword(password);

  return new User({
    firstName,
    lastName,
    email,
    password: passwordHash,
    picturePath,
    friends,
    location,
    occupation,
    viewedProfile: generateRandomNumber(),
    impressions: generateRandomNumber(),
  });
};

/* REGISTER USER */
export const register = async (req, res) => {
  try {
    const newUser = await createNewUser(req.body);
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ msg: "User does not exist." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials." });

    // eslint-disable-next-line no-undef
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    const userWithoutPassword = { ...user.toObject(), password: undefined };

    res.status(200).json({ token, user: userWithoutPassword });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
