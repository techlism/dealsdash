import mongoose from "mongoose";

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery',true);
    if(!process.env.MONGODB_URI) return console.log('MongoDb URI not found');
    if(isConnected) return console.log('Already Connected');

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log("Connected to DB");
    } catch (error : any) {
        console.log(`Unable to connect to DB : ${error.message}\n`);
    }
}