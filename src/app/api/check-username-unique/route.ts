import connectToDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";

import { usernameValidation } from "@/schemas/signUpSchema"
import { url } from "inspector";

const usernameQuerySchema = z.object({
    username: usernameValidation
})

export async function GET(request: Request) {
    //Todo: use this in all others routes

    if(request.method !== 'GET') {
        return Response.json({
            success: false,
            message: "Method not allowed"
        }, {status: 405})
    }
    await connectToDB()

    try {
        const {searchParams} = new URL(request.url)
        const queryParams = {
            username: searchParams.get('username')
        }
        //validate with zod
        const result = usernameQuerySchema.safeParse(queryParams)
        //must print console.log(result); and then remove
        if(!result.success) {
            const userNameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: userNameErrors?.length > 0 ? userNameErrors.join(', ') :'Invalid Query parameter',
            }, {status: 400}) //we can also write a hard coded message like 'Invalid Query parameter'
        }

        const {username} = result.data

        const existingVerifiesUser = await UserModel.findOne({username, isVerified: true})

        if(existingVerifiesUser) {
            return Response.json({
                success: false,
                message: "Username has already taken",
            }, {status: 400})
        }

        return Response.json({
            success: true,
            message: "Username is available"
        }, {status: 200})
        
    } catch (error) {
        console.log("Error while checking the username", error);
        return Response.json(
            {
                success: false,
                message: "Error while checking the username"
            }, 
            {status: 500}
        )
    }
}