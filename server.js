
const express= require('express');

const app= express();

const port =3000

const {v4: uuidv4}= require('uuid');

app.use(express.json())

app.get("/", (req, res) =>{
    res.json({message: "Attendance server is running"});
});

app.listen(port, ()=>{
    console.log(`server running at port ${3000}`)
});

app.post("/session/start", (req, res) => {
    const { course, lecturerId } = req.body;
    const sessionCode = uuidv4().slice(0, 8).toLocaleUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    res.json({
        message: "session started",
        course: course,
        lecturerId: lecturerId,
        sessionCode: sessionCode,
        expiresAt: expiresAt,
        expiresAtLocal: expiresAt.toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })
    });
});

app.post("/attendance/mark", (req, res) => {
    const { studentId, sessionCode, expiresAt } = req.body;

    const now = new Date();
    const expiry = new Date(expiresAt);

    if (now > expiry) {
        return res.status(400).json({
            message: "QR code has expired. Ask your lecturer to regenerate."
        });
    }

    res.json({
        message: "Attendance marked present",
        studentId: studentId,
        sessionCode: sessionCode,
        markedAt: now.toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })
    });
});