import NextAuth from "next-auth";


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


    },
    debug: true,
    secret: process.env.SECRET
};

export default NextAuth(authOptions);

export async function GET(req, res) {
    return NextAuth(req, res, authOptions);
}

export async function POST(req, res) {
    return NextAuth(req, res, authOptions);
}