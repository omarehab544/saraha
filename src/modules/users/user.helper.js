import { Hash } from "../../common/security/hash.js"
import { generate_otp, sendEmail } from "../../common/service/sendEmail.js"
import { emailTemplate } from "../../common/utils/email.template.js"
import { eventEmitter } from "../../common/utils/event.js"
import userModel from "../../DB/models/user.model.js"
import { getValue, incr, setValue, ttl } from "../../DB/service/redis.service.js"

export const sendEmailOtp=async({email,isConfirmed, subject="Confirm Email" }={})=>{
     const isBlocked = await ttl(`otp::block::${email}`)
    if (isBlocked > 0) throw new Error(`you blocked ,you can resSend otp after ${isBlocked} seconds`)

    const ttlOtp = await ttl(`otp::${email}`)

    if (ttlOtp > 0) throw new Error(`you can ressend otp after ${ttlOtp} seconds`)

    const max_otp = await getValue(`otp::max::${email}`)

    if (max_otp >= 3) {
        await setValue({
            key: `otp::block::${email}`,
            value: "1",
            ttl: 60 * 5
        })
        throw new Error("you have exceeded the maximum number of tries")
    }

    
    const user = await userModel.findOne({
        email: email.toLowerCase(),
        isConfirmed: isConfirmed
    })
    if (!user) throw new Error("email not exist or already confirmed")

    const otp = await generate_otp();
    const hashOtp = await Hash(otp ? otp.toString() : "", 12);

    await setValue({
        key: `otp::${email}`,
        value: hashOtp,
        ttl: 2 * 60
    })


    eventEmitter.emit("confirm-email", async () => {
        await sendEmail({
            to: email,
            subject,
            html: emailTemplate(otp)
        })
    })

    await incr(`otp::max::${email}`)
}