import express from "express";
import userRouter from "./routers/user"
const cors = require('cors');

const app = express();
app.use(express.json())
app.use(cors({
    origin: '*', // Update with your frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
}));
app.use("/v1/user", userRouter)

app.listen(3000, () => {
    //log a message when the server has started
    console.log("Server is running on port 3000")
})

app.get("/", (req, res) => {
    res.send("Server is running");
});