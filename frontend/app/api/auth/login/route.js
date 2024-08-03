import {NextResponse} from 'next/server';

const BASE_URL = 'https://developer.worldcoin.org';

export async function POST(req) {
    try {
        const body = await req.json();
        const {nullifier_hash, proof, merkle_root, verification_level, action} = body;

        const app_id = process.env.NEXT_PUBLIC_APP_ID; // Make sure this is set in your .env.local.local file

        const verificationResult = await verifyProofWithWorldcoin(
            app_id,
            nullifier_hash,
            proof,
            merkle_root,
            verification_level,
            action
        );

        if (verificationResult.success) {

            //update the db here, use nullifier_hash as unique identifier for the user
            //eg. nullifier_hash = 0x0403589f79d03ca18573fe426eb5a007515a47ec20aadbc911538b60f1c8e4ba


            return NextResponse.json(verificationResult, {status: 200});
        } else {
            return NextResponse.json({success: false, error: "Verification failed"}, {status: 403});
        }
    } catch (error) {
        console.error('API Error:', error);
        if (error.message.includes('This person has already verified for this action')) {
            return NextResponse.json({success: false, error: 'User already verified'}, {status: 409});
        } else
            return NextResponse.json({success: false, error: 'Verification failed'}, {status: 403});
    }
}

async function verifyProofWithWorldcoin(app_id, nullifier_hash, proof, merkle_root, verification_level, action) {
    const url = `${BASE_URL}/api/v2/verify/${app_id}`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'ClickPaid/1.0'
        },
        body: JSON.stringify({
            nullifier_hash,
            proof,
            merkle_root,
            verification_level,
            action,
            signal_hash: '0x00c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a4' // Default hash of empty string
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Verification request failed');
    }

    return await response.json();
}