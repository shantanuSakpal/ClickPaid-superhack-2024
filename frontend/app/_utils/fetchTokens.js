import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from "@/app/_lib/fireBaseConfig";

export async function getTokenBalance(userId) {
    if(!userId)
        return null;
    const userRef = doc(collection(db, 'users'), userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        const tokenBalance = {
            realTokenBalance : userDoc.data().realTokenBalance,
            trialTokenBalance: userDoc.data().trialTokenBalance
        };
        // console.log("token balance", tokenBalance)
        return tokenBalance;
    } else {
        return null;
    }
}