import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
    try {
        const token = await generateStreamToken(req.user.id); // Generate a Stream token using the user's ID
        
        res.status(200).json({ token});
    } catch (error) {
        console.error("Error generating Stream token:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}