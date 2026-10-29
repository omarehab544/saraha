import { Decrypt, Encrypt } from "../../common/security/encrypt.js"
import { CompareHash, Hash } from "../../common/security/hash.js";
import { create, findById, findByIdAndUpdate, findOne, findOneAndUpdate } from "../../DB/service/db.service.js"
import userModel from "../../DB/models/user.model.js"
import jwt from "jsonwebtoken"
import { OAuth2Client } from "google-auth-library"
import { ProviderEnum } from "../../common/enum/user.enum.js";
import { randomUUID } from "crypto";
import { deleteKey, getValue, incr, setValue, ttl } from "../../DB/service/redis.service.js";
import { generate_otp, sendEmail } from "../../common/service/sendEmail.js";
import { eventEmitter } from "../../common/utils/event.js";
import { emailTemplate } from "../../common/utils/email.template.js";
import { sendEmailOtp } from "./user.helper.js";
import { ACCESS_TOKEN_SIGNITURE, EXPIRATIONDATE, REFRESH_TOKEN_SIGNITURE } from "../../../config/config.service.js";
import { success_response } from "../../common/utils/success.response.js";

const client = new OAuth2Client();

//===============================signUp==========================================

export const signUp = async (req, res, next) => {
    const { fName, lName, email, password, age, gender, phone } = req.body;

    console.log(req.files);
    const paths = [];
    if (req.files?.attachments) {
        for (const file of req.files.attachments) {
            paths.push(file.path);
        }
    }

    const normalizedEmail = email.toLowerCase();

    if (await userModel.findOne({ email: normalizedEmail })) {
        throw new Error("email already exist");
    }

    const otp = await generate_otp();
    const otpHash = await Hash(otp);

    await setValue({
        key: `otp::${normalizedEmail}`,
        value: otpHash,
        ttl: 60 * 1
    });

    await setValue({
        key: `otp::max::${normalizedEmail}`,
        value: 1,
        ttl: 60 * 5
    });

    eventEmitter.emit("confirm-email", async () => {
        await sendEmail({
            to: normalizedEmail,
            subject: "Confirm Email",
            html: emailTemplate(otp)
        });
    });

    const user = await create({
        model: userModel,
        data: {
            fName,
            lName,
            email: normalizedEmail,
            password: await Hash(password),
            age,
            gender,
            phone: Encrypt(phone),
            profileImage: req.files?.attachment?.[0]?.path || "",
            coverImages: paths
        }
    });

    success_response({ res, statusCode: 201, data: user });
};

//===============================confirmEmail==========================================

export const confirmEmail = async (req, res, next) => {
    const { email, otp } = req.body;

    const otpValue = await getValue(`otp::${email}`);

    if (!otpValue) {
        throw new Error("otp expired", { cause: 400 });
    }
    if (!CompareHash(otp, otpValue)) {
        throw new Error("InValid otp", { cause: 400 });
    }
    const user = await findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            isConfirmed: false
        },
        update: {
            isConfirmed: true
        }
    });
    if (!user) {
        throw new Error("user not exist or already confirmed", { cause: 400 });
    }
   
    await deleteKey(`otp::${email}`);
    success_response({ res, statusCode: 200, data: user });
};

//===============================signUpWithGmail==========================================

export const signUpWithGmail = async (req, res, next) => {
    const { idToken } = req.body; 

    const ticket = await client.verifyIdToken({
        idToken,
        audience: AUDIANCE,  
    });
    const { picture, family_name, given_name, email_verified, email } = ticket.getPayload();
    let user = await findOne({
        model: userModel,
        filter: { email: email.toLowerCase() }
    });
    if (!user) {
        user = await create({
            model: userModel,
            data: {
                fName: given_name,
                lName: family_name,
                email: email,
                profileImage: picture,
                isConfirmed: email_verified,
                provider: ProviderEnum.google
            }
        });
    }
    const access_token = jwt.sign({ id: user._id, email: user.email }, ACCESS_TOKEN_SIGNITURE, {
        expiresIn: EXPIRATIONDATE || "4d"
    });

    const refresh_token = jwt.sign({ id: user._id, email: user.email }, REFRESH_TOKEN_SIGNITURE, {
        expiresIn: EXPIRATIONDATE || "4d"
    });

    success_response({ res, statusCode: 200, data: { access_token, refresh_token } });
};

//===============================signIn==========================================

export const signIn = async (req, res, next) => {
    const { email, password } = req.body;

    const user = await findOne({
        model: userModel,
        filter: { 
            email: email.toLowerCase(),
            isConfirmed: true
        }
    });
    
    if (!user) {
        throw new Error("email not exists , signIn first", { cause: 400 });
    }
    
    if (!await CompareHash(password, user.password)) {
        throw new Error("Invalid password", { cause: 500 });
    }

    const tokenId = randomUUID();
    
    const access_token = jwt.sign(
        { id: user._id, email: user.email, jti: tokenId },
        ACCESS_TOKEN_SIGNITURE,
        { expiresIn: EXPIRATIONDATE || "4d" }
    );

    const refresh_token = jwt.sign(
        { id: user._id, email: user.email, jti: tokenId },
        ACCESS_TOKEN_SIGNITURE,
        { expiresIn: EXPIRATIONDATE || "4d" }
    );

    success_response({ res, statusCode: 200, data: { access_token, refresh_token } });
};

//===============================getProfile==========================================

export const getProfile = async (req, res, next) => {
    success_response({ res, statusCode: 200, data: req.user });
};

//===============================shareProfile==========================================

export const shareProfile = async (req, res, next) => {
    const { id } = req.params;

    let user = await findById({
        model: userModel,
        id: id,
        options: { password: 0 }
    });
    if (!user) {
        throw new Error("user not exist", { cause: 400 });
    }
    user.phone = Decrypt(user.phone);
    success_response({ res, statusCode: 200, data: user });
};

//===============================updateProfile==========================================

export const updateProfile = async (req, res, next) => {
    const { fName, lName, age, phone, gender } = req.body;

    let updateQuery = {};

    if (fName !== undefined) {
        updateQuery.fName = fName;
    }
    if (lName !== undefined) {
        updateQuery.lName = lName;
    }
    if (age !== undefined) {
        updateQuery.age = age;
    }
    if (phone !== undefined) {
        updateQuery.phone = Encrypt(phone);
    }
    if (gender !== undefined) {
        updateQuery.gender = gender;
    }

    let user = await findByIdAndUpdate({
        model: userModel,
        id: req.user._id,
        update: updateQuery
    });
    success_response({ res, statusCode: 200, data: user });
};

//===============================updatePassword==========================================

export const updatePassword = async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;

    if (!await CompareHash(oldPassword, req.user.password)) {
        throw new Error("Invalid old password", { cause: 400 });
    }
    req.user.password = await Hash(newPassword);
    req.user.changeCredentialAT = new Date();
   
    await req.user.save();

    success_response({ res, statusCode: 200, data: req.user });
};

// ================================logout================================================

export const logout = async (req, res, next) => {
    const { flag } = req.query;

    if (flag == "all") {
        req.user.changeCredentialAT = new Date();
        await req.user.save();
    } else {
        await setValue({
            key: `revoke_token::${req.user._id}::${req.decode.jti}`, 
            value: `${req.decode.jti}`,
            ttl: req.decode.exp - Math.floor(Date.now() / 1000)
        });
    }

    success_response({ res, statusCode: 200 });
};

// ================================reSendOtp=============================================

export const reSendOtp = async (req, res, next) => {
    const { email } = req.body;
    await sendEmailOtp({ email, isConfirmed: false });
    success_response({ res, statusCode: 200 });
};

// ================================forgetPassword========================================

export const forgetPassword = async (req, res, next) => {
    const { email } = req.body;
    await sendEmailOtp({ 
        email, 
        isConfirmed: true, 
        subject: "forget Password" 
    });
    success_response({ res, statusCode: 200 });
};

// ================================resetPassword========================================

export const resetPassword = async (req, res, next) => {
    const { email, code, newPassword } = req.body;

    const otp = await getValue(`otp::${email}`);
    if (!otp) throw new Error("Otp Expired", { cause: 400 });

    if (!CompareHash(code, otp)) throw new Error("Invalid otp", { cause: 400 });

    const user = await findOneAndUpdate({
        model: userModel,
        filter: {
            email,
            isConfirmed: { $exists: true }
        },
        update: {
            password: await Hash(newPassword),
            changeCredentialAT: new Date()
        }
    });
    if (!user) {
        throw new Error("user not exist or already confirmed", { cause: 400 });
    }

    await deleteKey(`otp::${email}`);

    success_response({ res, statusCode: 200 });
};