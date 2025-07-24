import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user;

        const recommendedUsers = await User.find({
            $and: [       // $and operator to combine multiple conditions
                {_id: { $ne: currentUserId } }, // Exclude the current user
                {_id: { $nin: currentUser.friends } }, // Exclude friends
                {isOnboarded: true} // Only include onboarded users
            ]
        });
        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.log("Error fetching recommended users:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
        .select("friends")
        .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error fetching friends:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function sendFriendRequest(req, res) {
    try {
        const myId = req.user.id;
        const { id: recipientId} = req.params;  // using req.params to get the recipient ID from the URL

        // prevent sending a friend request to oneself
        if(myId === recipientId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const recpient = await User.findById(recipientId);
        if(!recpient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        // Check if a user is already a friend
        if(recpient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        // Check if a friend request already exists
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ]
        });

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        // Create a new friend request
        const friendRequest = new FriendRequest({
            sender: myId,
            recipient: recipientId
        });
        await friendRequest.save();

        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.log("Error sending friend request:", error.message);
        res.status(500).json({ message: "Internal server error" }); 
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;  // using req.params to get the request ID from the URL for accepting a friend request

        const friendRequest = await FriendRequest.findById(requestId);
        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        // verify that the current user is the recipient
        if(friendRequest.recipient.toString() !== req.user.id) {    // .id provides a string representation of the ObjectId
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }
        
        // Update the friend request status to accepted
        friendRequest.status = "accepted";
        await friendRequest.save();

        // Add both users to each other's friends list(array)
        // it finds the sender id and adds the recipient id to the sender's friends list
        await User.findByIdAndUpdate(friendRequest.sender, {   // findByIdAndUpdate is used to find a user by ID and update their friends list
            $addToSet: { friends: friendRequest.recipient }  // $addToSet ensures no duplicates
        });

        // it finds the recipient id and adds the sender id to the recipient's friends list
        await User.findByIdAndUpdate(friendRequest.recipient, {
            $addToSet: { friends: friendRequest.sender }
        });
        res.status(200).json({ message: "Friend request accepted successfully" });
    } catch (error) {
        console.log("Error accepting friend request:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getFriendRequests(req, res) {
    try {
        const incomingReqs = await FriendRequest.find({  // request sent by other users to the current user
            recipient: req.user.id,
            status: "pending"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");  // populate means to replace the sender field with the actual user data

        const acceptedReqs = await FriendRequest.find({  // request accepted by the current user
            sender: req.user.id,
            status: "accepted"
        }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json({ incomingReqs, acceptedReqs });
    } catch (error) {
        console.log("Error fetching friend requests:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

// outGoing friend requests are the requests sent by the current user to other users
export async function getOutgoingFriendRequests(req, res) {
    try {
        const outgoingReqs = await FriendRequest.find({  // request sent by the current user to other users
            sender: req.user.id,
            status: "pending"
        }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

        res.status(200).json({ outgoingReqs });
    } catch (error) {
        console.log("Error fetching outgoing friend requests:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}