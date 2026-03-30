import { User } from '../models/user.model.js'; 
import { clerkClient } from '@clerk/clerk-sdk-node';

export const getOrCreateUser = async (clerkUserId) => {
    try {
     
        const existingUser = await User.findOne({ clerkId: clerkUserId });

       
        if (existingUser) {
            return existingUser;
        }

       
        const userDetails = await clerkClient.users.getUser(clerkUserId);
        
        
        const email = userDetails?.emailAddresses[0]?.emailAddress;
        
        if (!email) {
            throw new Error("No email found for this Clerk user");
        }
        
        //
        const name = `${userDetails.firstName || ''} ${userDetails.lastName || ''}`.trim() || "Anonymous";

        
        const newUser = await User.create({
            clerkId: clerkUserId,
            email: email,
            name: name
        });

        console.log(`[AUTH] New user lazy-synced to DB: ${email}`);
        return newUser;

    } catch (error) {
        console.error("[AUTH] Sync Error:", error);
        throw error;
    }
};