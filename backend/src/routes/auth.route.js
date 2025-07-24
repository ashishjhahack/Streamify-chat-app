import express from "express";
import { signup, login, logout, onboard } from "../controllers/auth.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup)
router.post("/login", login)
router.post("/logout", logout)

router.post("/onboarding", protectRoute, onboard);

// check if the user is authenticated and return the user details
// This route is protected by the protectRoute middleware
// If the user is authenticated, it will return the user details
// If not authenticated, it will return a 401 Unauthorized error
router.get('/me', protectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user });
});

export default router;