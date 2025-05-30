import bcrypt from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
const generateToken = (userId) => {
  // console.log(userId);

  let payload = {
    userId: userId,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });

  return token;
};

const cacheUser = async (email, userId, password) => {
  const key = `user:email:${email}`;
  const value = JSON.stringify({ id: userId, password, email });

  await redisClient.setEx(key, 86400, value);

  const stored = await redisClient.get(key);
  console.log(`✅ Cached Redis data [${key}]:`, stored);
};

const createUser = async (req, res) => {
  let connection;
  try {
    const { firstName, password, lastName, email } = req.body;

    if (!firstName || !password || !lastName || !email) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    connection = await db.getConnection();

    const [existingUser] = await connection.query(
      "select id from user where email = ? LIMIT 1",
      [email]
    );

    if (existingUser.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email Already Exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const [insertedUser] = await connection.query(
      "insert into user (firstName, lastName, email, password) values (?,?,?,?)",
      [firstName, lastName, email, hashPassword]
    );

    await cacheUser(email, insertedUser.insertId, hashPassword);

    connection.release();
    const token = generateToken(insertedUser.insertId);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "User created successfully",
        userId: insertedUser.insertId,
      });
  } catch (error) {
    if (connection) connection.release();
    console.log(error);
    return res
      .status(500)
      .json({ success: false, error: error.message || error });
  }
};

const loginUser = async (req, res) => {
  let connection;
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both Fields Are Required",
      });
    }

    connection = await db.getConnection();

    // Check Redis cache first
    const cachedUser = await redisClient.get(`user:email:${email}`);
    if (cachedUser) {
      console.log(
        `🟢 [Cache Hit] User data retrieved from Redis for email: ${email}`
      );
      const parseUser = JSON.parse(cachedUser);

      const isValidPassword = await bcrypt.compare(
        password,
        parseUser.password
      );
      if (!isValidPassword) {
        console.log(
          `🔴 [Auth Failed] Invalid password attempt for cached user: ${email}`
        );
        return res.status(400).json({
          success: false,
          message: "Invalid Credentials",
        });
      }

      console.log(
        `🟢 [Auth Success] Cached user login: ${email} (ID: ${parseUser.id})`
      );
      const token = generateToken(parseUser.id);

      return res
        .cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
        })
        .status(200)
        .json({
          success: true,
          message: "Login successful",
        });
    }
    console.log(`🔵 [Cache Miss] Querying database for email: ${email}`);
    const [user] = await connection.query(
      "SELECT id, password FROM user WHERE email = ? LIMIT 1",
      [email]
    );

    if (!user.length) {
      console.log(
        `🔴 [Auth Failed] No user found in database for email: ${email}`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const checkPassword = await bcrypt.compare(password, user[0].password);
    if (!checkPassword) {
      console.log(
        `🔴 [Auth Failed] Password mismatch for user: ${email} (ID: ${user[0].id})`
      );
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    console.log(
      `🟢 [Auth Success] Database user login: ${email} (ID: ${user[0].id})`
    );
    console.log(`🔵 [Cache Update] Caching user data for email: ${email}`);
    await cacheUser(email, user[0].id, user[0].password);

    const token = generateToken(user[0].id);
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
      });
  } catch (error) {
    console.error(`⛔ [Login Error] ${error.message}`, error.stack);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    if (connection) connection.release();
  }
};

const logoutUser = async (req, res) => {
  try {
    const redisKey = `user:email:${req.user.email}`;
    await redisClient.del(redisKey);
    await res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    return res
      .status(200)
      .json({ success: true, message: "User loggedout successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  }
};

const uploadAvatar = async (req, res) => {
  let connection;
  try {
    const userId = req?.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    connection = await db.getConnection();

    await connection.query("UPDATE user SET avatar = ? WHERE = ?", [
      avatarPath,
      userId,
    ]);

    connection.release();

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      avatarUrl: avatarPath,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  } finally {
    if (connection) connection.release();
  }
};

const getAllUsersList = async(req,res)=>{
  let connection;
  try{
    connection = await db.getConnection()

    const user = req.user
    console.log("user", user)
    // let query = 'SELECT * FROM user';
    let searchQuery = req.query.search;
    let searchPattern = `%${searchQuery}%`

    const cacheKey = `usersList:${searchQuery}`

  const cacheData = await redisClient.get(cacheKey)

  if(cacheData){
    return res.status(200).json({success: true,data:cacheData})
  }
    const result = await connection.query("SELECT * FROM user WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?) AND id NOT LIKE ?",[searchPattern,searchPattern,searchPattern,user.userId])

    return res.status(200).json({success:true, data: result[0]})
  }catch(error){
    return res.status(500).json({success: false, message: error.message || error})
  }
}

export { createUser, loginUser, logoutUser,uploadAvatar,getAllUsersList };
