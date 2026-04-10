const User = require("../models/users.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const { sendPasskeyEmail } = require("../utils/mailer");

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role = "member" } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      _id: user._id,
      token: generateToken(user._id),
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    res.json({
      _id: user._id,
      token: generateToken(user._id),
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Return 200 even if user not found for security purposes
      return res.status(200).json({ message: "If that email exists, a passkey has been sent." });
    }

    // Generate random 4-digit code
    const passkey = Math.floor(1000 + Math.random() * 9000).toString();

    // Store directly in this prototype, or hashed if preferred (stored directly here per simplicity)
    user.resetPasskey = passkey;
    // 10 minutes expiry
    user.resetPasskeyExpiry = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendPasskeyEmail(email, passkey);

    res.status(200).json({ message: "If that email exists, a passkey has been sent." });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, passkey, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid request." });
    }

    if (!user.resetPasskey || user.resetPasskey !== passkey) {
      return res.status(400).json({ message: "Invalid or expired passkey." });
    }

    if (!user.resetPasskeyExpiry || user.resetPasskeyExpiry < Date.now()) {
      return res.status(400).json({ message: "Passkey has expired." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear passkey fields
    user.resetPasskey = null;
    user.resetPasskeyExpiry = null;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { registerUser, loginUser, forgotPassword, resetPassword };
