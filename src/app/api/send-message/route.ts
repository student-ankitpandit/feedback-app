import connectToDB from "@/lib/dbConnect";
import UserModel from "@/model/User";

import { Message } from '@/model/User'; //type safety

export async function POST(request: Request) {
    await connectToDB()
    const {username, content} = await request.json()
    try {
        const user = await UserModel.findOne(username)
        if(!user) {
            return Response.json({
                success: false,
                message: "Not Authenticated"
            }, {status: 404}
        )
        }

        //is user accepting the messages
        if(!user.isAcceptingMessages) {
            return Response.json({
                success: false,
                message: "User is not accepting messages right now"
            }, {status: 403}
        )
        }

        const newMessage = {content, createdAt: new Date()}

        // Pushing the new message to the user's messages array
        user.messages.push(newMessage as Message) //assert (typescript)
        await user.save()

        return Response.json({
            success: true,
            message: "Messages send successfully"
        }, {status: 201}
    )        
    } catch (error) {
        console.log("Error while adding the message", error);
        return Response.json({
            success: false,
            messages: "Internal serve error"
        }, 
        {status: 500})
        
    }
}