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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyWorldIDProof_1 = require("../utils/verifyWorldIDProof");
const JWT_SECRET = process.env.JWT_SECRET.toString();
const LIMEWIRE_API_KEY = process.env.LIMEWIRE_API_KEY.toString();
const WORLDCOIN_APP_ID = process.env.WORLDCOIN_APP_ID.toString();
const router = (0, express_1.Router)();
//routes
//sign in with worldID
router.post("/auth/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { nullifier_hash, proof, merkle_root, verification_level, action } = req.body;
        const verificationResult = yield (0, verifyWorldIDProof_1.verifyProofWithWorldcoin)(WORLDCOIN_APP_ID, nullifier_hash, proof, merkle_root, verification_level, action);
        if (verificationResult.success) {
            //update the db here, use nullifier_hash as unique identifier for the user
            //eg. nullifier_hash = 0x0403589f79d03ca18573fe426eb5a007515a47ec20aadbc911538b60f1c8e4ba
            //return response
            const token = jsonwebtoken_1.default.sign({ nullifier_hash }, JWT_SECRET);
            res.status(200).json({ success: true, token });
        }
        else {
            res.status(403).json({ success: false, error: 'Verification failed' });
        }
    }
    catch (error) {
        console.error('API Error:', error);
        //@ts-ignore
        if (error.message.includes('This person has already verified for this action')) {
            const token = jsonwebtoken_1.default.sign({ nullifier_hash: req.body.nullifier_hash }, JWT_SECRET);
            res.status(200).json({ success: true, token, message: 'User has already been verified' });
        }
        else
            res.status(500).json({ success: false, error: 'Internal server error' });
    }
}));
//ai image generation
router.post("/generateImage", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    console.log(prompt);
    try {
        const resp = yield fetch(`https://api.limewire.com/api/image/generation`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Api-Version": "v1",
                Accept: "application/json",
                Authorization: "Bearer " + LIMEWIRE_API_KEY,
            },
            body: JSON.stringify({
                prompt: prompt,
                aspect_ratio: "1:1",
            }),
        });
        const data = yield resp.json();
        console.log(data);
        res.status(200).json(data);
    }
    catch (error) {
        console.error("Error :", error);
        res.status(500).json({
            error: "Failed to generate image",
        });
    }
}));
// router.post(
//   "/generateUploadUrl",
//   authMiddleware,
//   async (req: any, res: any) => {
//     const userId = req.userId;
//     // fileS3Key is the bucket path of file without the bucket name.
//     //generate random alpha numreic 6 char string
//     function generateRandomString(length: number) {
//       let s = "";
//       while (s.length < length) {
//         s += Math.random().toString(36).slice(2);
//       }
//       return s.slice(0, length);
//     }
//
//     const randomString = generateRandomString(6);
//
//     const { url, fields } = await createPresignedPost(s3Client, {
//       Key: `fiver/${userId}/${randomString}.jpg`, // the file path in the bucket, like `userId/image.jpg`
//       Bucket: "shantanu-decentralized-fiver",
//       Conditions: [
//         ["content-length-range", 0, 5 * 1024 * 1024], // 5 MB max
//       ],
//       Expires: 3600,
//     });
//
//     res.json({
//       preSignedUrl: url,
//       fields,
//     });
//   }
// );
//
// //to get status of task, how many submission, etc
// router.post("/taskStatus", authMiddleware, async (req, res) => {
//   //@ts-ignore
//   const userId: number = req.userId;
//   const body = req.body;
//   const taskId: number = body.task_id;
//
//   //get the option ids that belong to that task
//   const options: Array<Option> = await prismaClient.option.findMany({
//     where: {
//       task_id: Number(taskId),
//     },
//   });
//   // console.log(options)
//   const stats: Array<object> = await Promise.all(
//     options.map(async (option) => {
//       const submissions: Array<Submission> =
//         await prismaClient.submission.findMany({
//           where: {
//             option_id: option.id,
//           },
//         });
//       // Find length of the submissions array
//       let n = submissions.length;
//       return {
//         option_id: option.id,
//         count: n,
//       };
//     })
//   );
//   res.json(stats);
// });
//
// //get a task
// router.post("/getTask", authMiddleware, async (req, res) => {
//   //@ts-ignore
//   const userId: number = req.userId;
//   const body = req.body;
//   const taskId: number = body.task_id;
//
//   const task = await getTask(userId, taskId);
//
//   res.json({
//     task: task,
//   });
// });
//
// //check transaction
// router.post("/checkTx", authMiddleware, async (req, res) => {
//   const body = req.body;
//   //@ts-ignore
//   const userId = req.userId;
//   //check if body is correct
//   const signature = body.signature;
//   const user = await prismaClient.user.findFirst({
//     where: {
//       id: userId,
//     },
//   });
//   console.log("verigiying payment backend", signature);
//
//   //verfiy payment
//   const transaction = await connection.getTransaction(signature.toString(), {
//     maxSupportedTransactionVersion: 1,
//   });
//   //
//   console.log(transaction);
//   //check if amount = 0.1 sol
//   if (
//     (transaction?.meta?.postBalances[1] ?? 0) -
//       (transaction?.meta?.preBalances[1] ?? 0) !==
//     100000000
//   ) {
//     return res.status(411).json({
//       message: "Transaction signature/amount incorrect",
//     });
//   }
//   //check if parent wallet address is same
//   if (
//     transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
//     PARENT_WALLET_ADDRESS
//   ) {
//     return res.status(411).json({
//       message: "Transaction sent to wrong address",
//     });
//   }
//   //check this money paid by this user address or a different address?
//   if (
//     transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
//     user?.address
//   ) {
//     return res.status(411).json({
//       message: "Transaction sent from wrong address",
//     });
//   }
//
//   res.status(200).json({
//     message: "payment valid",
//   });
// });
//
// //this route will generate tasks, given options and title
// router.post("/addTask", authMiddleware, async (req, res) => {
//   const body = req.body;
//   //@ts-ignore
//   const userId = req.userId;
//   //check if body is correct
//   const parseData = createTaskInput.safeParse(body);
//
//   if (!parseData.success) {
//     return res.status(411).json({
//       message:
//         "wrong input, options array of imageurls and title(optional) expected",
//       error: parseData.error,
//     });
//   }
//
//   //a transaction makes sure both the transactions are fully carried out, or none of them do, so we do not create a half transaction
//   const response = await prismaClient.$transaction(async (tx) => {
//     let task = await tx.task.create({
//       data: {
//         title: parseData.data.title ?? DEFAULT_TITLE,
//         signature: parseData.data.signature,
//         amount: parseData.data.amount,
//         user_id: userId,
//       },
//     });
//
//     await tx.option.createMany({
//       data: parseData.data.options.map((x) => ({
//         image_url: x.imageUrl,
//         task_id: task.id,
//       })),
//     });
//
//     return task;
//   });
//
//   res.json({
//     task_id: response.id,
//   });
// });
//
// //this route will give the download link of the image, valid for 5 mins
// router.get(
//   "/generateDownloadUrl",
//   authMiddleware,
//   async (req: any, res: any) => {
//     const userId = req.userId;
//     // fileS3Key is the bucket path of file without the bucket name.
//     const params: GetObjectCommandInput = {
//       Key: `/fiver/${userId}/image.jpg`, // the file path in the bucket, like `userId/image.jpg`
//       Bucket: "shantanu-decentralized-fiver",
//     };
//
//     const command = new GetObjectCommand(params);
//     //gives the url to download the file, valid for 5 mins
//     const url = await getSignedUrl(s3Client, command, {
//       expiresIn: 5 * 60,
//     });
//     res.json({ url });
//   }
// );
//route to get all tasks
// router.get("/alltasks", authMiddleware, async (req: any, res: any) => {
//   const userId = req.userId;
//   try {
//     const tasks = await prismaClient.task.findMany({
//       where: {
//         user_id: userId,
//       },
//     });
//     if (tasks.length < 0)
//       res.status(404).json({
//         message: "no tasks found",
//       });
//     res.json({
//       tasks: tasks,
//     });
//   } catch (error) {
//     res.status(404).json(error);
//   }
// });
// router.get("/getAccessToken", authMiddleware, async (req: any, res: any) => {
//   const options = {
//     method: "POST",
//     headers: {
//       accept: "application/json",
//       "content-type": "application/x-www-form-urlencoded",
//     },
//     body: new URLSearchParams({
//       grant_type: "client_credentials",
//       client_id: INSTAMOJO_CLIENT_ID,
//       client_secret: INSTAMOJO_CLIENT_SECRET,
//     }),
//   };
//
//   try {
//     const response = await fetch(
//       "https://test.instamojo.com/oauth2/token/",
//       options
//     );
//     if (!response.ok) {
//       throw new Error(`HTTP error! Status: ${response.status}`);
//     }
//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (error) {
//     console.error("Error fetching access token:", error);
//     res.status(500).json({ error: "Failed to fetch access token" });
//   }
// });
//
// router.post(
//   "/getPaymentDetails",
//   authMiddleware,
//   async (req: any, res: any) => {
//     const { payment_id, access_token } = req.body;
//     console.log(payment_id, access_token);
//     const options = {
//       method: "GET",
//       headers: {
//         accept: "application/json",
//         Authorization: `Bearer ${access_token}`,
//       },
//     };
//
//     try {
//       const response = await fetch(
//         `https://test.instamojo.com/v2/payments/${payment_id}/`,
//         options
//       );
//
//       const data = await response.json();
//       console.log(data);
//       res.status(200).json(data);
//     } catch (error) {
//       console.error("Error :", error);
//       res.status(500).json({
//         error: "Failed to fetch details",
//       });
//     }
//   }
// );
exports.default = router;
