export  async function verifyProofWithWorldcoin(app_id: string, nullifier_hash: string, proof: string, merkle_root: string, verification_level: string, action: string) {
    const BASE_URL = 'https://developer.worldcoin.org';
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