import jwt from "jsonwebtoken";
export function protect(req,res,next){
  const header=req.headers.authorization;
  if(!header?.startsWith("Bearer ")) return res.status(401).json({success:false,message:"Authentication required."});
  try { req.user=jwt.verify(header.split(" ")[1],process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({success:false,message:"Invalid or expired authentication token."}); }
}
