import jwt from 'jsonwebtoken'
const verifyToken = async(req,res,next)=>{
    try {   
        
         const { token } = req.cookies || req.headers.authorization?.split(' ')[1];;

         if(!token){
            return res.status(403).json({success: false, message: "Not Authenticated"})
         }

         const decodeToken = await jwt.verify(token, process.env.JWT_SECRET)
         req.user = decodeToken
     //     console.log("req.user-->", req.user)
         next()
    } catch (error) {
         console.error(error);
    res.status(403).json({ success: false, message: "Invalid token!" });
    return;
    }
}

export default verifyToken