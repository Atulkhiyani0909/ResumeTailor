import { getOrCreateUser } from './getOrCreateUser.js'; 

export const syncClerkUser = async (req, res, next) => {
    try {
       
        const clerkId = req.auth?.userId; 
        
        if (!clerkId) {
            return res.status(401).json({ success: false, message: "Unauthorized by Clerk" });
        }

        
        const dbUser = await getOrCreateUser(clerkId);

       
        req.user = dbUser;

        
        next();

    } catch (error) {
        console.error("[MIDDLEWARE] Sync Error:", error);
        res.status(500).json({ success: false, message: "Failed to sync user with database." });
    }
};