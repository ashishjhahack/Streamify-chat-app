import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { getFriendRequests, acceptFriendRequest, getMyFriends, getOutgoingFriendRequests, getRecommendedUsers, sendFriendRequest } from "../controllers/user.controller.js";

const router = express.Router();

router.use(protectRoute); // Apply the protectRoute middleware to all routes in this file

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);    // get all friend requests for the current user
router.get("/outgoing-friend-requests", getOutgoingFriendRequests);    // after sending a friend request, the user can check the status of their outgoing requests

export default router;