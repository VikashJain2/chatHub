import bcrypt from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import util from "util";

// Promisify file system operations for better async handling
const unlinkAsync = util.promisify(fs.unlink);
const rmdirAsync = util.promisify(fs.rm);

const generateToken = (userId, email) => {
  const payload = {
    userId: userId,
    email: email,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const cacheUser = async (email, userId, password) => {
  const key = `user:email:${email}`;
  const value = JSON.stringify({ id: userId, password, email });
  
  try {
    await redisClient.setEx(key, 86400, value);
    console.log(`✅ Cached Redis data [${key}]`);
  } catch (error) {
    console.error(`❌ Failed to cache user: ${error.message}`);
    // Don't throw as caching failures shouldn't break the main flow
  }
};

// Helper function to safely release database connections
const releaseConnection = (connection) => {
  if (connection && typeof connection.release === "function") {
    connection.release();
  }
};

// Helper function to get database connection with error handling
const getDBConnection = async () => {
  try {
    return await db.getConnection();
  } catch (error) {
    console.error("Failed to get database connection:", error);
    throw new Error("Database connection failed");
  }
};

const createUser = async (req, res) => {
  let connection;
  try {
    const {
      firstName,
      password,
      lastName,
      email,
      publicKey,
      encryptedPrivateKey,
      encryption_iv,
      encryption_salt,
    } = req.body;

    // Validate required fields
    const requiredFields = [
      "firstName", "password", "lastName", "email", 
      "publicKey", "encryptedPrivateKey", "encryption_iv", "encryption_salt"
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required",
        missingFields 
      });
    }

    connection = await getDBConnection();

    // Check if user already exists
    const [existingUser] = await connection.query(
      "SELECT id FROM user WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false, 
        message: "Email Already Exists" 
      });
    }

    // Hash password and create user
    const hashPassword = await bcrypt.hash(password, 10);
    const id = uuidv4();
    
    await connection.query(
      "INSERT INTO user (id, firstName, lastName, email, password, public_key, encrypted_private_key, encryption_iv, encryption_salt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [id, firstName, lastName, email, hashPassword, publicKey, encryptedPrivateKey, encryption_iv, encryption_salt]
    );

    // Cache user and generate token
    await cacheUser(email, id, hashPassword);
    const token = generateToken(id, email);

    // Get complete user data (excluding password)
    const [fullUserData] = await connection.query(
      "SELECT id, firstName, lastName, email, public_key, encrypted_private_key, encryption_iv, encryption_salt FROM user WHERE id = ?",
      [id]
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(201)
      .json({
        success: true,
        message: "User created successfully",
        data: fullUserData[0],
      });
  } catch (error) {
    console.error("Create user error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  } finally {
    releaseConnection(connection);
  }
};

const loginUser = async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both email and password are required",
      });
    }

    connection = await getDBConnection();

    // Try to get user from cache first
    const cachedUser = await redisClient.get(`user:email:${email}`);
    
    if (cachedUser) {
      try {
        const parsedUser = JSON.parse(cachedUser);
        const isValidPassword = await bcrypt.compare(password, parsedUser.password);
        
        if (!isValidPassword) {
          return res.status(401).json({
            success: false,
            message: "Invalid credentials",
          });
        }

        // Get full user data from DB
        const [fullUserData] = await connection.query(
          "SELECT id, firstName, lastName, email, avatar, public_key, encrypted_private_key, encryption_iv, encryption_salt FROM user WHERE id = ?",
          [parsedUser.id]
        );

        if (fullUserData.length === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const token = generateToken(parsedUser.id, email);
        
        return res
          .cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 24 * 60 * 60 * 1000, // 1 day
          })
          .status(200)
          .json({
            success: true,
            message: "Login successful",
            data: fullUserData[0],
          });
      } catch (parseError) {
        console.error("Error parsing cached user:", parseError);
        // Continue to database lookup if cache parsing fails
      }
    }

    // If not in cache or cache parsing failed, check database
    const [user] = await connection.query(
      "SELECT id, password FROM user WHERE email = ? LIMIT 1",
      [email]
    );

    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Cache user for future logins
    await cacheUser(email, user[0].id, user[0].password);

    // Get full user data
    const [fullUserData] = await connection.query(
      "SELECT id, firstName, lastName, email, avatar, public_key, encrypted_private_key, encryption_iv, encryption_salt FROM user WHERE id = ?",
      [user[0].id]
    );

    const token = generateToken(user[0].id, email);
    
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
        data: fullUserData[0],
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    releaseConnection(connection);
  }
};

const logoutUser = async (req, res) => {
  try {
    if (req.user && req.user.email) {
      const redisKey = `user:email:${req.user.email}`;
      await redisClient.del(redisKey).catch(err => 
        console.error("Failed to delete Redis key:", err)
      );
    }
    
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    
    return res.status(200).json({ 
      success: true, 
      message: "User logged out successfully" 
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
};

const uploadAvatar = async (req, res) => {
  let connection;
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file uploaded" 
      });
    }

    // Upload to Cloudinary
    const avatarResult = await cloudinary.uploader.upload(req.file.path, {
      folder: "chatHub",
    });

    // Clean up uploaded file
    try {
      await unlinkAsync(req.file.path);
      const uploadDir = path.dirname(req.file.path);
      await rmdirAsync(uploadDir, { recursive: true });
    } catch (cleanupError) {
      console.warn("File cleanup warning:", cleanupError.message);
    }

    connection = await getDBConnection();

    // Update user avatar in database
    await connection.query(
      "UPDATE user SET avatar = ? WHERE id = ?",
      [avatarResult.secure_url, userId]
    );

    // Get updated user info
    const [updatedUserRows] = await connection.query(
      "SELECT id AS friendId, CONCAT(firstName, ' ', lastName) AS userName, email, avatar FROM user WHERE id = ?",
      [userId]
    );
    
    if (updatedUserRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const updatedUser = updatedUserRows[0];

    // Update all friends' caches
    const [friendIds] = await connection.query(
      "SELECT user_id FROM user_friends WHERE friend_id = ?",
      [userId]
    );

    // Process cache updates in parallel
    const cacheUpdatePromises = friendIds.map(async ({ user_id: friendId }) => {
      const friendCacheKey = `user:friends:${friendId}`;
      try {
        const cache = await redisClient.get(friendCacheKey);
        if (cache) {
          const friends = JSON.parse(cache);
          const updatedFriends = friends.map(friend => 
            friend.friendId === userId ? updatedUser : friend
          );
          await redisClient.setEx(
            friendCacheKey,
            300,
            JSON.stringify(updatedFriends)
          );
        }
      } catch (cacheError) {
        console.error(`Cache update failed for ${friendCacheKey}:`, cacheError);
      }
    });

    await Promise.allSettled(cacheUpdatePromises);

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: avatarResult.secure_url,
    });
  } catch (error) {
    console.error("Upload avatar error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  } finally {
    releaseConnection(connection);
  }
};

const updateProfile = async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { firstName, lastName, email } = req.body.userDetails;

    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    connection = await getDBConnection();

    // Update user profile
    await connection.query(
      "UPDATE user SET firstName = ?, lastName = ?, email = ? WHERE id = ?",
      [firstName, lastName, email, userId]
    );

    // Get updated user info
    const [updatedUserRows] = await connection.query(
      "SELECT id AS friendId, CONCAT(firstName, ' ', lastName) AS userName, email, avatar FROM user WHERE id = ?",
      [userId]
    );
    
    if (updatedUserRows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    const updatedUser = updatedUserRows[0];

    // Get complete user details for response
    const [updatedUserDetails] = await connection.query(
      "SELECT * FROM user WHERE id = ?",
      [userId]
    );

    // Update all friends' caches
    const [friendIds] = await connection.query(
      "SELECT user_id FROM user_friends WHERE friend_id = ?",
      [userId]
    );

    // Process cache updates in parallel
    const cacheUpdatePromises = friendIds.map(async ({ user_id: friendId }) => {
      const cacheKey = `user:friends:${friendId}`;
      try {
        const cache = await redisClient.get(cacheKey);
        if (cache) {
          const friends = JSON.parse(cache);
          const updatedFriends = friends.map(friend => 
            friend.friendId === userId ? updatedUser : friend
          );
          await redisClient.setEx(
            cacheKey,
            300,
            JSON.stringify(updatedFriends)
          );
        }
      } catch (cacheError) {
        console.error(`Cache update failed for ${cacheKey}:`, cacheError);
      }
    });

    await Promise.allSettled(cacheUpdatePromises);

    return res.status(200).json({
      success: true,
      user: updatedUserDetails[0],
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  } finally {
    releaseConnection(connection);
  }
};

const getAllUsersList = async (req, res) => {
  let connection;
  try {
    const user = req.user;
    const searchQuery = req.query.search || "";
    const searchPattern = `%${searchQuery}%`;
    const cacheKey = `usersList:${searchQuery}`;

    // Try to get from cache first
    const cacheData = await redisClient.get(cacheKey);
    if (cacheData) {
      return res.status(200).json({ 
        success: true, 
        data: JSON.parse(cacheData) 
      });
    }

    connection = await getDBConnection();

    const [result] = await connection.query(
      "SELECT id, firstName, lastName, email, avatar FROM user WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?) AND id != ?",
      [searchPattern, searchPattern, searchPattern, user.userId]
    );

    // Cache the result for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(result));

    return res.status(200).json({ 
      success: true, 
      data: result 
    });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  } finally {
    releaseConnection(connection);
  }
};

const fetchUserDetails = async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    const cacheKey = `user:${userId}`;
    
    // Try to get from cache first
    const cacheUser = await redisClient.get(cacheKey);
    if (cacheUser) {
      return res.status(200).json({ 
        success: true, 
        user: JSON.parse(cacheUser) 
      });
    }

    connection = await getDBConnection();

    const [user] = await connection.query(
      "SELECT id, firstName, lastName, email, avatar FROM user WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User does not exist" 
      });
    }

    // Cache user details for 1 minute
    await redisClient.setEx(cacheKey, 60, JSON.stringify(user[0]));

    return res.status(200).json({ 
      success: true, 
      user: user[0] 
    });
  } catch (error) {
    console.error("Fetch user details error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  } finally {
    releaseConnection(connection);
  }
};

const fetchFriends = async (req, res) => {
  let connection;
  try {
    const { userId } = req.user;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const cacheKey = `user:friends:${userId}`;

    // Try to get from cache first
    const cachedFriends = await redisClient.get(cacheKey);
    if (cachedFriends) {
      return res.status(200).json({
        success: true,
        friends: JSON.parse(cachedFriends),
        cached: true,
      });
    }

    connection = await getDBConnection();

    const [userFriends] = await connection.query(
      `SELECT 
        u.id AS friendId,
        CONCAT(u.firstName, ' ', u.lastName) AS userName,
        u.email,
        u.avatar
      FROM user_friends f
      JOIN user u ON u.id = f.friend_id
      WHERE f.user_id = ?`,
      [userId]
    );

    // Cache friends list for 5 minutes
    await redisClient.setEx(cacheKey, 300, JSON.stringify(userFriends));

    return res.status(200).json({
      success: true,
      friends: userFriends,
      cached: false,
    });
  } catch (error) {
    console.error("Fetch friends error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    releaseConnection(connection);
  }
};

const getUsersPublicKeyAndPrivateKey = async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Not authenticated" 
      });
    }

    connection = await getDBConnection();

    const [user] = await connection.query(
      "SELECT public_key, encrypted_private_key, encryption_iv, encryption_salt FROM user WHERE id = ?",
      [userId]
    );

    if (user.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      data: user[0] 
    });
  } catch (error) {
    console.error("Get user keys error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    releaseConnection(connection);
  }
};

const getFriendsPublicKey = async (req, res) => {
  let connection;
  try {
    const { friendId } = req.params;
    if (!friendId) {
      return res.status(400).json({ 
        success: false, 
        message: "Friend ID is required" 
      });
    }

    connection = await getDBConnection();

    const [friendPublicKey] = await connection.query(
      "SELECT public_key FROM user WHERE id = ?",
      [friendId]
    );

    if (friendPublicKey.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: "Friend not found" 
      });
    }

    return res.status(200).json({ 
      success: true, 
      publicKey: friendPublicKey[0].public_key 
    });
  } catch (error) {
    console.error("Get friend public key error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    releaseConnection(connection);
  }
};

export {
  createUser,
  loginUser,
  logoutUser,
  uploadAvatar,
  getAllUsersList,
  updateProfile,
  fetchUserDetails,
  fetchFriends,
  getUsersPublicKeyAndPrivateKey,
  getFriendsPublicKey,
};