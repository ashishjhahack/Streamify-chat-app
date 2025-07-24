import mongoose, { mongo } from "mongoose";

const friendRequestSchema = new mongoose.Schema(
    {
        sender: {   // The user who sent the friend request
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        recipient: {   // The user who received the friend request
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "declined"],
            default: "pending"
        }
    },
    { timestamps: true }
);

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;