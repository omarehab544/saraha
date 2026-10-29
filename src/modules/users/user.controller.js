import { Router } from 'express';
import { getProfile, shareProfile, signIn, signUp, signUpWithGmail,updatePassword,updateProfile,logout, confirmEmail, reSendOtp, forgetPassword, resetPassword } from './user.service.js';
import { authentication } from '../../common/middleware/authentication.js';
import { authorization } from '../../common/middleware/autoritation.js';
import { RoleEnum } from '../../common/enum/user.enum.js';
import { Validation } from '../../common/middleware/validation.js';
import { signInSchema, signUpSchema, shareProfileSchema,updateProfileSchema,updatePasswordSchema, confirmEmailSchema } from './user.validation.js';
import { multerLocal } from '../../common/middleware/multer.js';
import messageRouter from '../messages/message.controller.js';

const userRouter = Router({strict:true,caseSensitive:true});

userRouter.use("/:userId/messages", messageRouter)

userRouter.post(
  "/signup",
  multerLocal({customPath:"admins",customTypes:['image/webp','image/jpeg']}).fields([
    {name:"attachment",max:1},
    {name:"attachments",max:2},

  ]),
  Validation(signUpSchema),
  signUp
);
userRouter.post('/signin',
  Validation(signInSchema),
   signIn);
userRouter.post('/signup/gmail', signUpWithGmail);
userRouter.get('/profile',authentication,authorization([RoleEnum.user]),getProfile);
userRouter.get('/share-profile/:id',Validation(shareProfileSchema), shareProfile);
userRouter.patch('/update-profile',authentication,Validation(updateProfileSchema), updateProfile);updatePassword
userRouter.patch('/update-password',authentication,Validation(updatePasswordSchema), updatePassword);
userRouter.patch('/confirmEmail',Validation(confirmEmailSchema), confirmEmail);
userRouter.patch('/resendOtp', reSendOtp);
userRouter.patch('/forgetPassword' , forgetPassword);
userRouter.patch('/resetPassword' , resetPassword);
userRouter.patch('/logout',authentication, logout);

export default userRouter;