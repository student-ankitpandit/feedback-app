import { connect } from "http2";
import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number
}

const connection: ConnectionObject = {} //cause we gave optional operator ? 

async function connectToDB(): Promise<void> {
    if(connection.isConnected) { //cheking if database is already connected
        console.log("Already connected to DB");
        return 
    }

    try {
        const db = await mongoose.connect(process.env.MONGO_URI || '')
        connection.isConnected = db.connections[0].readyState  //take connection form db and extract first value and that is ready state and ready state is an number in own
        console.log("DB connected Successfully");
        
    } catch (error) {
        console.log("DB connection failed", error);
        
        process.exit(1) //gracefully exit
    }
}

export default connectToDB;