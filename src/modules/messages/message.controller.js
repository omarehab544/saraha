import { Router } from 'express';
import { multerLocal } from '../../common/middleware/multer.js';
import { Multer_Enum } from '../../common/enum/multer.enum.js';
import { Validation } from '../../common/middleware/validation.js';
import { createMessageSchema } from './message.validation.js';
import { createMessage, getMessageById, getMessages } from './message.service.js';
import { authentication } from '../../common/middleware/authentication.js';

const messageRouter = Router({strict:true,caseSensitive:true,mergeParams:true});


messageRouter.post("/createMessage",multerLocal({customPath: "messages",customTypes: Multer_Enum.images}).array("attachments", 3),Validation(createMessageSchema),createMessage)

messageRouter.get("/getMessage",authentication,getMessages)
messageRouter.get("/getMessageById/:id", authentication, getMessageById)

export default messageRouter;