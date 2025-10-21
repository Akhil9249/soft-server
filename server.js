const express = require("express")
const cors = require('cors')
const morgan = require("morgan");

const connectDb = require("./config/db");
const { startAttendanceCron } = require("./cron/attendanceCron");


const registerAndLoginRoute = require('./routes/registerAndLoginRoute');
const staffRoutes = require('./routes/staffRoutes');
const internRoutes = require('./routes/internRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const topicRoutes = require("./routes/topicRoutes");
const batchRoutes = require("./routes/batchRoutes");
const timingRoutes = require("./routes/timingRoutes");
const weeklyScheduleRoutes = require("./routes/weeklyScheduleRoutes");
const pageRoutes = require("./routes/pageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const roleRoutes = require("./routes/roleRoutes");
const branchRoutes = require("./routes/branchRoutes");
const taskRoutes = require("./routes/taskRoutes");
const materialRoutes = require("./routes/materialRoutes");
const internsAttendanceRoutes = require("./routes/internsAttendanceRoutes");

const errorHandle = require("./middlewares/errorHandle");
// const authRoutes = require("./routes/auth");


const app = express()
require('dotenv').config()

//connect to database
connectDb()

// Start attendance cron job
startAttendanceCron()

// Start the plan downgrade cron job
// startCronJobs();

// Use morgan middleware
app.use(morgan("dev")); // 'dev' is a predefined format string

const allowedOrigins = [
  "https://www.cart7online.com",
  "https://admin.cart7online.com",
  "http://localhost:5173",
  "http://localhost:5174"
];

app.use(cors())

// app.use(cors({
//   origin: function (origin, callback) {
//     // Allow requests with no origin (like mobile apps or curl)
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.includes(origin)) {
//       return callback(null, true);
//     } else {
//       return callback(new Error("Not allowed by CORS"));
//     }
//   },
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   credentials: true,
// }));

//app.options("*", cors()); // handle preflight


app.use(express.json())

app.get("/", (req, res) => {
  res.send("Hello from Express on Vercel!");
});



app.use("/api", registerAndLoginRoute);

app.use("/api/staff", staffRoutes);
app.use("/api/intern", internRoutes);
app.use("/api/roles", roleRoutes);

app.use("/api/category", categoryRoutes);
app.use("/api/course", courseRoutes);

app.use("/api/module", moduleRoutes);
app.use("/api/topics", topicRoutes);

app.use("/api/batches", batchRoutes);
app.use("/api/timings", timingRoutes);
app.use("/api/weekly-schedules", weeklyScheduleRoutes);

app.use("/api/pages", pageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/interns-attendance", internsAttendanceRoutes);

//  Error Handling
app.use(errorHandle);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);