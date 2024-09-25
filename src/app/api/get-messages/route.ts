import connectToDB from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
    await connectToDB()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User //assertion here as User

    if(!session || !session.user) {
        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {status: 401}
    )
    }

    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        const user = await UserModel.aggregate([ //aggregation pipeline
            {$match: {id: userId} },
            {$unwind: '$messages'},
            {$sort: {'messages.createdAt':-1}},
            {$group: {_id: '$_id', messages: {$push: '$messages'}}}
        ])

        if(!user || user.length === 0) {
            return Response.json({
                success: false,
                message: "User not found"
            }, {status: 401}
        )
        }

        return Response.json({
            success: true,
            message: user[0].messages
        }, {status: 200}
    )
    } catch (error) {
        console.log("An unexpected error occured", error);
        return Response.json({
            success: false,
            message: "Internal server error"
        }, {status: 500}
    )
        
    }
}