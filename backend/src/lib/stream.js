import { StreamChat} from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if(!apiKey || !apiSecret) {
    console.error("STREAM_API_KEY and STREAM_API_SECRET must be set in the environment variables.");
    process.exit(1);
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret); // Initialize the StreamChat client

export const upsertStreamUser = async (userData) => {
    try{
        await streamClient.upsertUsers([userData]);
        return userData;
    }
    catch(error) {
        console.error("Error upserting Stream user:", error);
    }
};

export const generateStreamToken = (userId) => {
    try{
        // ensure userId is a string
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    }
    catch (error) {
        console.error("Error generating Stream token:", error);
    }
};