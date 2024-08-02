import {React} from "react";
import { verifyCloudProof } from '@worldcoin/idkit';

export async function POST(req, res) {
    const { proof, signal } = req.body;
    const app_id = process.env.NEXT_PUBLIC_APP_ID;
    const action = process.env.NEXT_PUBLIC_ACTION_ID;
    const verifyRes = await verifyCloudProof(proof, app_id, action, signal);

    if (verifyRes.success) {
        console.log(app_id, "--------sdfad----------", verifyRes);
        res.status(200).send(verifyRes);
    } else {
        console.log(verifyRes);
        res.status(400).send(verifyRes);
    }
}

