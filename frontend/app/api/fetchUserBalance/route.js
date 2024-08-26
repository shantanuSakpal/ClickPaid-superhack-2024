import { NextResponse } from "next/server";
import {doc, getDoc} from "firebase/firestore";
import {db} from "@/app/_lib/fireBaseConfig";

export async function POST(request) {
    try {
        const { userId } = await request.json();

        if (!userId) {
            return new NextResponse('User ID is required', { status: 400 });
        }

        const userDocRef = doc(db, 'users', userId);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) {
            return new NextResponse('User not found', {status: 404});
        }
        const user = userDocSnap.data();

        return NextResponse.json(user.balance);
    } catch (error) {
        console.error("Error fetching balances:", error);
        return new NextResponse('Failed to fetch balances', { status: 500 });
    }
}
