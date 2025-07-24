import jwt from "jsonwebtoken";
import User from "../models/User.js";

// We make this middleware to protect routes that require authentication
export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt; // Get the JWT token from cookies to authenticate the user
        if(!token) return res.status(401).json({ message: "Unauthorized: No token provided" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify the token using the secret key
        if(!decoded) return res.status(401).json({ message: "Unauthorized: Invalid token" });

        const user = await User.findById(decoded.userId).select("-password"); // Find the user by ID from the decoded token and don't display the password field of user
        if(!user) return res.status(404).json({ message: "User not found" });

        req.user = user; // Attach the user to the request object for further use in the route handlers
        next(); // Call the next middleware or route handler
    }
    catch(error) {
        console.error("Error in auth middleware:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}