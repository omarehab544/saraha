import { Decrypt, Encrypt } from "../../common/security/encrypt.js"
import { CompareHash, Hash } from "../../common/security/hash.js";
import { create, find, findById, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../DB/service/db.service.js"
import userModel from "../../DB/models/user.model.js"
import messageModel from "../../DB/models/messages.model.js";



// ==================== createMessage ====================

 export const createMessage = async (req, res, next) => {
    
    const { content, userId } = req.body

    if (!content && !req.files.length) throw new Error("content is required")

    const userExist = await findById({
        model: userModel,
        id: userId
    })
    if (!userExist) throw new Error("user not exist");

    let urls = []
    if (req?.files?.length) {
        for (const file of req?.files) {
            urls.push(file.path)
        }
    }

    const message = await create({
        model: messageModel,
        data: {
            content,
            attachments: urls,
            userId
        }
    })

    return res.status(201).json({ message: "Done", message })
}

// ==================== getMessage ====================

export const getMessages = async (req, res, next) => {
    

    const messages = await find({
        model: messageModel,
        data: {
            userId:req.user._id
        }
    })

    return res.status(201).json({ message: "Done", messages })
}


// ==================== getMessageById ====================

export const getMessageById = async (req, res, next) => {
    const message = await findOne({
        model: messageModel,
        filter: {
            _id: req.params.id,
            userId: req.user._id
        }
    })

    return res.status(200).json({ message: "Done", data: message })
}