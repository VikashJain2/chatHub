import bcrypt from "bcryptjs";
import db from "../config/db.js";
import jwt from "jsonwebtoken";
import { redisClient } from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";
import fs from 'fs'
import path from 'path'
import {v4 as uuidv4, v4 } from 'uuid'
const generateToken = (userId) => {
  console.log("userId in generate Token--->",userId);

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
    let id = uuidv4()
    const [insertedUser] = await connection.query(
      "insert into user (id,firstName, lastName, email, password) values (?,?,?,?,?)",
      [id,firstName, lastName, email, hashPassword]
    );

    await cacheUser(email, id, hashPassword);

    const token = generateToken(id);
    
    const [fullUserData] = await connection.query(
      "SELECT id, firstName, lastName, email FROM user WHERE id = ?",
      [id]
    );
    connection.release();
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
        data: fullUserData[0],
      });
  } catch (error) {
    if (connection) connection.release();
   
    return res
      .status(500)
      .json({ success: false, error: error.message || error });
  }finally{
    if(connection) connection.release()
  }
};

const loginUser = async (req, res) => {
  let connection;
  try {
    // const io = req.app.get("io")
   
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Both Fields Are Required",
      });
    }

    connection = await db.getConnection();

    const cachedUser = await redisClient.get(`user:email:${email}`);
    if (cachedUser) {
      const parsedUser = JSON.parse(cachedUser);

      const isValidPassword = await bcrypt.compare(password, parsedUser.password);
      if (!isValidPassword) {
        return res.status(400).json({
          success: false,
          message: "Invalid Credentials",
        });
      }

      // Return full user (excluding password)
      const [fullUserData] = await connection.query(
        "SELECT id, firstName, lastName, email, avatar FROM user WHERE id = ?",
        [parsedUser.id]
      );


      const token = generateToken(parsedUser.id);
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
          data: fullUserData[0],
        });
    }

    const [user] = await connection.query(
      "SELECT id, password FROM user WHERE email = ? LIMIT 1",
      [email]
    );

    if (!user.length) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    const checkPassword = await bcrypt.compare(password, user[0].password);
    if (!checkPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }

    await cacheUser(email, user[0].id, user[0].password);

    const [fullUserData] = await connection.query(
      "SELECT id, firstName, lastName, email,avatar FROM user WHERE id = ?",
      [user[0].id]
    );

    console.log("userId in Login-->",user[0].id)
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
        data: fullUserData[0],
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

    const avatarPath = await cloudinary.uploader.upload(req.file.path,{
      folder: "chatHub"
    })

    fs.unlinkSync(req.file.path)

       const uploadDir = path.dirname(req.file.path);
    try {
      fs.rmdirSync(uploadDir, { recursive: true });
    } catch (folderErr) {
      console.warn("Failed to remove upload folder:", folderErr.message);
    }
    connection = await db.getConnection();

    await connection.query("UPDATE user SET avatar = ? WHERE id = ?", [
      avatarPath.secure_url,
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

const updateProfile = async(req,res)=>{
  let connection;
  try{
    const userId = req.user.userId
    const {firstName, lastName, email} = req.body;
    if(!userId){
      return res.status(400).json({success: false, message: "UnAuthorized"})
    }

    if(!firstName || !lastName || !email){
      return res.status(400).json({success: false, message: "All Fields Are Required"})
    }

    connection = await db.getConnection()

    await connection.query("UPDATE user SET firstName = ?, lastName = ? , email = ?WHERE id = ?",[firstName, lastName,email, userId])

    const [updatedUser] = await connection.query("SELECT * FROM user WHERE id=?",[userId])

    return res.status(200).json({success:true, user: updatedUser[0]})

  }catch(error){
    return res.status(500).json({success: false, message: error.message || error})
  }
}

const getAllUsersList = async (req, res) => {
  let connection;
  try {
    connection = await db.getConnection();

    const user = req.user;

    let searchQuery = req.query.search;
    let searchPattern = `%${searchQuery}%`;

    const cacheKey = `usersList:${searchQuery}`;

    const cacheData = await redisClient.get(cacheKey);

    if (cacheData) {
      return res.status(200).json({ success: true, data: cacheData });
    }
    const result = await connection.query(
      "SELECT * FROM user WHERE (firstName LIKE ? OR lastName LIKE ? OR email LIKE ?) AND id NOT LIKE ?",
      [searchPattern, searchPattern, searchPattern, user.userId]
    );

    return res.status(200).json({ success: true, data: result[0] });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: error.message || error });
  }finally{
    if (connection) connection.release();
  }
};

export { createUser, loginUser, logoutUser, uploadAvatar, getAllUsersList,updateProfile };
