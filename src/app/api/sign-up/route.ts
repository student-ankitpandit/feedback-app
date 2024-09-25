import connectToDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request){
    await connectToDB()

    try {
        const {username, email, password} = await request.json()
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true //username se mujhe dena jab uska is verified true ho
        })

        if(existingUserVerifiedByUsername) {
            return Response.json({
                success: false,
                message: "Username has already taken"
            }, {status: 400})
        }

        const existingUserByEmail = await UserModel.findOne({email})
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

        if(existingUserByEmail) {
            if(existingUserByEmail.isVerified) {
                return Response.json({
                    success: false,
                    message: "User already registered with this credentials"
                }, {status: 400})
            } else{
                const hasedPassword = await bcrypt.hash(password, 10)
                existingUserByEmail.password = hasedPassword;
                existingUserByEmail.verifyCode = verifyCode;
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
                await existingUserByEmail.save()
            }
        } else{
            const hashPassword = await bcrypt.hash(password, 10)
            const expiryDate = new Date()
            expiryDate.setHours(expiryDate.getHours() + 1)

            const newUser = new UserModel({ //save user in database
                username,
                email,
                password: hashPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false,
                isAcceptingMessage: true,
                messages: []
            })

            await newUser.save()
        }

        //send verification email
        const emailResponse = await sendVerificationEmail(
            email,
            username,
            verifyCode
        )

        if(!emailResponse.success) {
            return Response.json({
                success: false,
                message: emailResponse.message
            }, {status: 500})
        }

        return Response.json({
            success: true,
            message: "User registered successfully, Please check your email"
        }, {status: 201})
    } catch (error) {
        console.log("Error while registering user", error)
        return Response.json(
            {
                success: false,
                message: "Error while registering user"
            },
            {
                status: 500
            }
        )
    }
}