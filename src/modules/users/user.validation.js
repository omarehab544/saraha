import joi from "joi"
import { generalRules } from "../../common/utils/generalRules.js"

export const signUpSchema= {

    body:joi.object({
    fName:joi.string().required(),
    lName:joi.string().required(),
    email:generalRules.email.required(),
    password:generalRules.password.required(),
    age:joi.number().required().max(60).min(18),
    gender:joi.string().valid("male","female").required(),
    phone:joi.string()
   
    
    
}).required(),

files:joi.object({
    attachment :joi.array().items(generalRules.file.required()),
    attachments :joi.array().items(generalRules.file.required())
}).required()
  
}

    
    

export const signInSchema= {

    body:joi.object({
    
    email:generalRules.email.required(),
    password:generalRules.password.required(),
    
    
}).required()

}

export const shareProfileSchema= {

    params:joi.object({
    
    id:generalRules.id.required()
    
}).required()

}


export const updateProfileSchema= {

    body:joi.object({
    fName:joi.string(),
    lName:joi.string(),
    age:joi.number().max(60).min(18),
    gender:joi.string().valid("male","female"),
    phone:joi.string()
   
    
    
}).required()
}

export const confirmEmailSchema = {
    body: joi.object({
        email: joi.string().required(),
        otp: joi.string().pattern(/^[0-9]{6}$/).required()
    }).required()
}

export const updatePasswordSchema= {

    body:joi.object({
    oldPassword:generalRules.password.required(),
    newPassword:generalRules.password.required(),
    cPassword: joi.string().valid(joi.ref('newPassword')).required()
    
    
}).required()
}