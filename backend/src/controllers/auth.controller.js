const User = require('../models/User.model');
const { generateToken } = require('../middleware/auth.middleware');

/**
 * Authentication Controller
 * Handles user registration, login, and authentication
 */

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: userExists.email === email 
          ? 'Email already registered' 
          : 'Username already taken'
      });
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          gamesPlayed: user.gamesPlayed,
          totalWagered: user.totalWagered,
          totalWon: user.totalWon
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email (include password for comparison)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          gamesPlayed: user.gamesPlayed,
          totalWagered: user.totalWagered,
          totalWon: user.totalWon
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          balance: user.balance,
          gamesPlayed: user.gamesPlayed,
          totalWagered: user.totalWagered,
          totalWon: user.totalWon,
          serverSeedHash: user.serverSeedHash,
          clientSeed: user.clientSeed,
          nonce: user.nonce
        }
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

/**
 * @route   POST /api/auth/update-seeds
 * @desc    Update client seed or rotate server seed
 * @access  Private
 */
const updateSeeds = async (req, res) => {
  try {
    const { clientSeed, rotateServerSeed } = req.body;
    const user = await User.findById(req.user.id);

    if (clientSeed) {
      user.clientSeed = clientSeed;
    }

    if (rotateServerSeed) {
      const newServerSeedHash = user.rotateServerSeed();
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Seeds updated successfully',
      data: {
        clientSeed: user.clientSeed,
        serverSeedHash: user.serverSeedHash,
        nonce: user.nonce
      }
    });
  } catch (error) {
    console.error('Update seeds error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating seeds',
      error: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateSeeds
};
