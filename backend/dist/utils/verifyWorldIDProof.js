"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyProofWithWorldcoin = void 0;
function verifyProofWithWorldcoin(app_id, nullifier_hash, proof, merkle_root, verification_level, action) {
    return __awaiter(this, void 0, void 0, function* () {
        const BASE_URL = 'https://developer.worldcoin.org';
        const url = `${BASE_URL}/api/v2/verify/${app_id}`;
        const response = yield fetch(url, {
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
            const errorData = yield response.json();
            throw new Error(errorData.detail || 'Verification request failed');
        }
        return yield response.json();
    });
}
exports.verifyProofWithWorldcoin = verifyProofWithWorldcoin;
