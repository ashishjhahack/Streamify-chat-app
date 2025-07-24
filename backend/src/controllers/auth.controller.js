import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";


export async function signup(req, res){
    const { email, password, fullName}  = req.body;
    try{
        if(!email || !password || !fullName) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if(password.length < 6){
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({ message: "Invalid email format" });
        }
        const existingUser = await User.findOne({ email });
        if(existingUser) return res.status(400).json({ message: "Email already exists" });

        const idx = Math.floor(Math.random() * 100)+1;   // generate a random index for the user image 1 - 100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newUser = await User.create({
            email,
            password,
            fullName,
            profilePic: randomAvatar
        });

        try{
            // Upsert user in Stream
            await upsertStreamUser({
                id: newUser._id.toString(),  // Ensure _id is a string
                name: newUser.fullName,   // we don't changes to string because StreamChat expects a string
                image: newUser.profilePic
            });
            console.log(`User upserted in Stream successfully as ${fullName}`);
        }
        catch (error) {
            console.log("Error upserting user in Stream:", error);
        }

        const token = jwt.sign({userId: newUser._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"  // Token will expire in 7 days
        });

        // Set the JWT token in a cookie
        // The cookie will be used for authentication in subsequent requests
        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly: true,  // Cookie is not accessible via JavaScript. It prevents XSS attacks
            sameSite: "strict",  // Cookie is sent only for same-site requests. It helps to prevent CSRF attacks
            secure: process.env.NODE_ENV === "production" // Use secure cookies in production
        });
        res.status(201).json({ success: true, user: newUser });
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const {email, password} = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if(!user) return res.status(404).json({ message: "User not found" });

        const isPasswordCorrect = await user.matchPassword(password);  // matchPassword is a method defined in the User model to compare the password with the hashed password. We don't have to import this method because it is already defined in the User model and mongoose automatically adds it to the User model instance.
        if(!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" });

        const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d"  // Token will expire in 7 days
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            httpOnly: true,  // Cookie is not accessible via JavaScript. It prevents XSS attacks
            sameSite: "strict",  // Cookie is sent only for same-site requests. It helps to prevent CSRF attacks
            secure: process.env.NODE_ENV === "production" // Use secure cookies in production
        });
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error during login:", error.message);
        return res.status(500).json({ message: "Internal server error" });
    }
}

export function logout(req, res){   // we don't have to make this async because we are not using any async operations in this function like database operations or API calls
    res.clearCookie("jwt");
    res.status(200).json({ success: true, message: "Logged out successfully" });
}

export async function onboard(req, res){
    try{
        const userId = req.user._id;  // We get the user ID from the request object, which is set by the auth middleware in the protectRoute function but we don't have to import this function here because it is already imported in the auth.route.js file and the protectRoute function is used as a middleware in the auth.route.js file

        const { fullName, bio, nativeLanguage, learningLanguage, location } = req.body;
        if(!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
            return res.status(400).json({
                message: "All fields are required",
                missingFields: [
                    !fullName && "fullName",
                    !bio && "bio",
                    !nativeLanguage && "nativeLanguage",
                    !learningLanguage && "learningLanguage",
                    !location && "location"
                ].filter(Boolean)  // Remove any false values
            });
        }

        const updateUser = await User.findByIdAndUpdate(
            userId,
            {
                ...req.body,  // Update the user with the provided data
                isOnboarded: true  // Set isOnboarded to true
            },
            { new: true }  // Return the updated user
        );
        if(!updateUser) {
            return res.status(404).json({ message: "User not found" });
        }

        try{
            await upsertStreamUser({
                id: updateUser._id.toString(),  // Ensure _id is a string
                name: updateUser.fullName,
                image: updateUser.profilePic || "",
            });
            console.log(`Stream user updated after onboarding for ${updateUser.fullName}`);
        }
        catch (error) {
            console.log("Error updating Stream user after onboarding:", error.message);
        }
        res.status(200).json({ success: true, user: updateUser });
    }
    catch (error) {
        console.error("Error during onboarding:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}