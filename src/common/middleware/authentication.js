import jwt from "jsonwebtoken"
import { findOne } from "../../DB/service/db.service.js"
import userModel from "../../DB/models/user.model.js"
import { ttl } from "../../DB/service/redis.service.js"
import { ACCESS_TOKEN_SIGNITURE } from "../../../config/config.service.js"

export const authentication =async(req,res,next)=>{

    const {token}=req.headers

    if (!token){
        throw new Error("token not exist ",{cause:400})
    }

    const decode =jwt.verify(token,ACCESS_TOKEN_SIGNITURE)

    if (!decode?.id){
        throw new Error("Invalid token ",{cause:400})
    }

    const user= await findOne({
        model:userModel,
        filter:{
            _id: decode.id
        }
    })
    if(!user){
       throw new Error ("email not exists , signIn first",{cause:500})
    }

    if(!user?.isConfirmed)throw new Error("user not confirmed yet")
        


   
if ( user?.changeCredentialAT?.getTime() > decode?.iat * 1000) {
   throw new Error("Token expired u must login again", { cause: 400 })
}


if (await ttl(`revoke_token::${user._id}::${decode.jti}`) > 0) {
    throw new Error("InValid revoked token, you should login again")
}

   
   req.user = user;
req.decode = decode; 
next();
 

}