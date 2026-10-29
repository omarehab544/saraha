import { ALLOW_ORIGINS, PORT} from '../config/config.service.js';
import express from 'express';
import connectionDB from './DB/connectionDB.js';
import userRouter from './modules/users/user.controller.js';
import cors from "cors"
import connectRedis from './DB/connection.redis.js';
import rateLimit from 'express-rate-limit';
import messageRouter from './modules/messages/message.controller.js';
import helmet from 'helmet';




const app = express();
const port = PORT;

 const limiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    message: {
        success: false,
        message: "Game over"
    },
    standardHeaders: true,
    legacyHeaders: false,
    // skip: (req) => req.path == "/messages",
    // skipSuccessfulRequests: true,
    statusCode: 400,
    handler: (req, res) => {
        res.status(401).json({
            message: "Game Overrrrrrr"
        })
    }
})



const bootstrap = async () => {

app.use(cors({
    origin: function (origin, callback) {
        if ([...ALLOW_ORIGINS,undefined].includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error("not allowed by origin"))
        }
    }
}))

    app.use(limiter);
    app.use(helmet());
    app.use(express.json());

    app.set("strict routing",true)
     app.set("case sensitive routing",true)

    
    await connectionDB();
    await connectRedis();
    
   

    app.use("/users", userRouter);
    app.use("/messages",messageRouter)
    


    app.get("/", (req, res) => {
        return res.status(200).json({ message: "Welcome to the application" });
    });

    
app.use((req, res) => {
    return res.status(404).json({ message: "Invalid URL / Route Not Found" });
});


app.use((err, req, res, next) => {
    res.status(err.cause || 500).json({
        message: err.message,
        statusCode: err.cause || 500,
        stack: err.stack,
        errors: err.errors || []
    })
})

    app.listen(port, () => {
        console.log(`app is running on port ${port}`);
    });
};

export default bootstrap;