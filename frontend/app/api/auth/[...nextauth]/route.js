import NextAuth from "next-auth";
import {db} from '@/app/_lib/fireBaseConfig';
import {doc, getDoc, setDoc} from 'firebase/firestore';
import {adjectives, animals, uniqueNamesGenerator} from 'unique-names-generator';

// Configuration for name generation
const nameConfig = {
    dictionaries: [adjectives, animals],
    separator: ' ',
    length: 2,
    style: 'capital'
};

export const authOptions = {
    providers: [
        {
            id: "worldcoin",
            name: "Worldcoin",
            type: "oauth",
            wellKnown: "https://id.worldcoin.org/.well-known/openid-configuration",
            authorization: { params: { scope: "openid" } },
            clientId: process.env.WLD_CLIENT_ID,
            clientSecret: process.env.WLD_CLIENT_SECRET,
            idToken: true,
            checks: ["state", "nonce", "pkce"],
            profile(profile) {
                return {
                    id: profile.sub,
                    name: profile.sub,
                    verificationLevel:
                    profile["https://id.worldcoin.org/v1"].verification_level,
                };
            },
        },
    ],
    callbacks: {
        async jwt({ token }) {
            token.userRole = "admin";
            return token;
        },
        async session({ session, token }) {
            const userRef = doc(db, "users", token.sub);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                // Generate a random name
                const randomName = uniqueNamesGenerator(nameConfig);

                // Create a new user document in Firestore
                await setDoc(userRef, {
                    name: randomName,
                    walletAddress: "",
                    rewards: 0,
                    balance: 0,
                    posts: [],
                    // Add any other fields you want to store
                });

                // Update the session with the generated name
                session.user.name = randomName;
            }

            return session;
        },
    },
    debug: true,
};

export default NextAuth(authOptions);

export async function GET(req, res) {
    return NextAuth(req, res, authOptions);
}

export async function POST(req, res) {
    return NextAuth(req, res, authOptions);
}