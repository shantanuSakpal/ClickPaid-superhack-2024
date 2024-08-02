import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommandInput,
  PutObjectCommand,
  S3ClientConfig,
  GetObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { authMiddleware } from "../middleware";
import { createTaskInput, Option, Submission, userDetails } from "../types";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { getTask } from "../db";
import nacl from "tweetnacl";
import { string } from "zod";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import * as Client from "@web3-storage/w3up-client";
import { StoreMemory } from "@web3-storage/w3up-client/stores/memory";
import * as Proof from "@web3-storage/w3up-client/proof";
import { Signer } from "@web3-storage/w3up-client/principal/ed25519";

const PARENT_WALLET_ADDRESS = process.env.PARENT_WALLET_ADDRESS;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const DEFAULT_TITLE = "Click the most appealing thumbnail";
const JWT_SECRET = "notapro";
// @ts-ignore
const AWS_ACCESS_KEY_ID: string = process.env.AWS_ACCESS_KEY_ID;
// @ts-ignore
const AWS_SECRET_ACCESS_KEY: string = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_REGION = process.env.AWS_REGION;
const INSTAMOJO_CLIENT_ID: string = process.env.INSTAMOJO_CLIENT_ID!.toString();
const INSTAMOJO_CLIENT_SECRET: string =
  process.env.INSTAMOJO_CLIENT_SECRET!.toString();
const LIMEWIRE_API_KEY: string = process.env.LIMEWIRE_API_KEY!.toString();
const s3config: S3ClientConfig = {
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
};
const s3Client = new S3Client(s3config);
const connection = new Connection(
  `https://solana-devnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
);
const router = Router();
const prismaClient = new PrismaClient();

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const W3_PRIVATE_Key: string = process.env.W3_PRIVATE_Key!.toString();
const W3_PROOF: string = process.env.W3_PROOF!.toString();

//todo: check if database is live

//routes
router.post(
  "/generateUploadUrl",
  authMiddleware,
  async (req: any, res: any) => {
    const userId = req.userId;
    // fileS3Key is the bucket path of file without the bucket name.
    //generate random alpha numreic 6 char string
    function generateRandomString(length: number) {
      let s = "";
      while (s.length < length) {
        s += Math.random().toString(36).slice(2);
      }
      return s.slice(0, length);
    }

    const randomString = generateRandomString(6);

    const { url, fields } = await createPresignedPost(s3Client, {
      Key: `fiver/${userId}/${randomString}.jpg`, // the file path in the bucket, like `userId/image.jpg`
      Bucket: "shantanu-decentralized-fiver",
      Conditions: [
        ["content-length-range", 0, 5 * 1024 * 1024], // 5 MB max
      ],
      Expires: 3600,
    });

    res.json({
      preSignedUrl: url,
      fields,
    });
  }
);

//to get status of task, how many submission, etc
router.post("/taskStatus", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId: number = req.userId;
  const body = req.body;
  const taskId: number = body.task_id;

  //get the option ids that belong to that task
  const options: Array<Option> = await prismaClient.option.findMany({
    where: {
      task_id: Number(taskId),
    },
  });
  // console.log(options)
  const stats: Array<object> = await Promise.all(
    options.map(async (option) => {
      const submissions: Array<Submission> =
        await prismaClient.submission.findMany({
          where: {
            option_id: option.id,
          },
        });
      // Find length of the submissions array
      let n = submissions.length;
      return {
        option_id: option.id,
        count: n,
      };
    })
  );
  res.json(stats);
});

//get a task
router.post("/getTask", authMiddleware, async (req, res) => {
  //@ts-ignore
  const userId: number = req.userId;
  const body = req.body;
  const taskId: number = body.task_id;

  const task = await getTask(userId, taskId);

  res.json({
    task: task,
  });
});

//check transaction
router.post("/checkTx", authMiddleware, async (req, res) => {
  const body = req.body;
  //@ts-ignore
  const userId = req.userId;
  //check if body is correct
  const signature = body.signature;
  const user = await prismaClient.user.findFirst({
    where: {
      id: userId,
    },
  });
  console.log("verigiying payment backend", signature);

  //verfiy payment
  const transaction = await connection.getTransaction(signature.toString(), {
    maxSupportedTransactionVersion: 1,
  });
  //
  console.log(transaction);
  //check if amount = 0.1 sol
  if (
    (transaction?.meta?.postBalances[1] ?? 0) -
      (transaction?.meta?.preBalances[1] ?? 0) !==
    100000000
  ) {
    return res.status(411).json({
      message: "Transaction signature/amount incorrect",
    });
  }
  //check if parent wallet address is same
  if (
    transaction?.transaction.message.getAccountKeys().get(1)?.toString() !==
    PARENT_WALLET_ADDRESS
  ) {
    return res.status(411).json({
      message: "Transaction sent to wrong address",
    });
  }
  //check this money paid by this user address or a different address?
  if (
    transaction?.transaction.message.getAccountKeys().get(0)?.toString() !==
    user?.address
  ) {
    return res.status(411).json({
      message: "Transaction sent from wrong address",
    });
  }

  res.status(200).json({
    message: "payment valid",
  });
});

//this route will generate tasks, given options and title
router.post("/addTask", authMiddleware, async (req, res) => {
  const body = req.body;
  //@ts-ignore
  const userId = req.userId;
  //check if body is correct
  const parseData = createTaskInput.safeParse(body);

  if (!parseData.success) {
    return res.status(411).json({
      message:
        "wrong input, options array of imageurls and title(optional) expected",
      error: parseData.error,
    });
  }

  //a transaction makes sure both the transactions are fully carried out, or none of them do, so we do not create a half transaction
  const response = await prismaClient.$transaction(async (tx) => {
    let task = await tx.task.create({
      data: {
        title: parseData.data.title ?? DEFAULT_TITLE,
        signature: parseData.data.signature,
        amount: parseData.data.amount,
        user_id: userId,
      },
    });

    await tx.option.createMany({
      data: parseData.data.options.map((x) => ({
        image_url: x.imageUrl,
        task_id: task.id,
      })),
    });

    return task;
  });

  res.json({
    task_id: response.id,
  });
});

//this route will give the download link of the image, valid for 5 mins
router.get(
  "/generateDownloadUrl",
  authMiddleware,
  async (req: any, res: any) => {
    const userId = req.userId;
    // fileS3Key is the bucket path of file without the bucket name.
    const params: GetObjectCommandInput = {
      Key: `/fiver/${userId}/image.jpg`, // the file path in the bucket, like `userId/image.jpg`
      Bucket: "shantanu-decentralized-fiver",
    };

    const command = new GetObjectCommand(params);
    //gives the url to download the file, valid for 5 mins
    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 5 * 60,
    });
    res.json({ url });
  }
);

//this route will upload the image, using an upload link, you have to send the file with it in body., valid for 5 mins

//sign in with wallet
router.post("/auth/signin", async (req: any, res: any) => {
  const { publicKey, signature } = req.body;
  const date = new Date().getHours();
  const message = new TextEncoder().encode(
    `Sign in with your Solana account on ${date}`
  );

  const result = nacl.sign.detached.verify(
    message,
    new Uint8Array(signature.data),
    new PublicKey(publicKey).toBytes()
  );

  console.log("signin", result);
  if (!result) {
    return res.status(411).json({
      message: "Incorrect signature",
    });
  }
  //get the userId from db, upsert is like, if user exits, return it, else create it
  const user = await prismaClient.user.upsert({
    where: {
      address: publicKey,
    },
    update: {},
    create: {
      address: publicKey,
      name: "user",
    },
  });

  const token = jwt.sign(
    {
      userId: user.id,
      //@ts-ignore
    },
    JWT_SECRET
  );

  res.json({ token });
});

//route to get all tasks
router.get("/alltasks", authMiddleware, async (req: any, res: any) => {
  const userId = req.userId;
  try {
    const tasks = await prismaClient.task.findMany({
      where: {
        user_id: userId,
      },
    });
    if (tasks.length < 0)
      res.status(404).json({
        message: "no tasks found",
      });
    res.json({
      tasks: tasks,
    });
  } catch (error) {
    res.status(404).json(error);
  }
});

router.get("/getAccessToken", authMiddleware, async (req: any, res: any) => {
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: INSTAMOJO_CLIENT_ID,
      client_secret: INSTAMOJO_CLIENT_SECRET,
    }),
  };

  try {
    const response = await fetch(
      "https://test.instamojo.com/oauth2/token/",
      options
    );
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Error fetching access token:", error);
    res.status(500).json({ error: "Failed to fetch access token" });
  }
});

router.post(
  "/getPaymentDetails",
  authMiddleware,
  async (req: any, res: any) => {
    const { payment_id, access_token } = req.body;
    console.log(payment_id, access_token);
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    };

    try {
      const response = await fetch(
        `https://test.instamojo.com/v2/payments/${payment_id}/`,
        options
      );

      const data = await response.json();
      console.log(data);
      res.status(200).json(data);
    } catch (error) {
      console.error("Error :", error);
      res.status(500).json({
        error: "Failed to fetch details",
      });
    }
  }
);

router.post("/generateImage", async (req: any, res: any) => {
  const { prompt } = req.body;
  console.log(prompt);

  try {
    const resp = await fetch(`https://api.limewire.com/api/image/generation`, {
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

    const data = await resp.json();

    console.log(data);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error :", error);
    res.status(500).json({
      error: "Failed to generate image",
    });
  }
});

export default router;
