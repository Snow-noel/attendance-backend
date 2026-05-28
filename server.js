const pool = require("./database");

const bcrypt = require('bcrypt');

const jsonwebtoken = require('jsonwebtoken');

const verifyToken= require("./malware")

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

app.post("/session/start", async(req, res) => {

    const { module_id, lecturer_id } = req.body;

    const sessionCode = uuidv4().slice(0, 8).toLocaleUpperCase();

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    try{
        const result = await pool.query(
            `INSERT INTO sessions (module_id,session_code, expires_at)
             VALUES ($1, $2, $3) RETURNING *`,
            [module_id,sessionCode, expiresAt]
        );
        res.json({
        message: "Session started",
        session: result.rows[0],
    });
    } catch (err){
        res.status(500).json({ message: "Error starting session", error: err.message})
    }});

app.post("/attendance/mark", verifyToken, async(req, res) => {
    const { student_id, session_code } = req.body;

   
   
   try{
        const session= await pool.query(
        `SELECT * FROM sessions WHERE session_code = $1`,
        [session_code]
    );

    if(session.rows.length==0){
        return res.status(404).json({message: "invalid session"})
    }
    const now = new Date();
    const expiry = new Date(session.rows[0].expires_at);

    if (now > expiry) {
        return res.status(400).json({
            message: "QR code has expired. Ask your lecturer to regenerate."
        });
    }
const sessionResult = await pool.query(
    `INSERT INTO attendance (session_id, student_id) VALUES ($1, $2)
     RETURNING *`,
    [session.rows[0].id, student_id]
);
    res.json({
        message: "Attendance marked present",
        attendance:sessionResult.rows[0]
    });
}catch(err){
    res.status(500).json({message:"error while marking the attendance",error:err})
}

});


app.post("/student/register", async(req, res) => {
    const {registration_number, first_name, last_name, email, password, program_id}= req.body;

    try{
        
        const hashedPassword = await bcrypt.hash(password,10);

        const result = await pool.query(
            `INSERT INTO students(registration_number, first_name, last_name, email, password, program_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`, [registration_number,first_name,last_name,email,hashedPassword,program_id]
        )

        res.json({
            message: "student registered successifully",
            student:result.rows[0]
        });
    }catch (err){
        res.status(500).json({message: "error while registering a student", error: err})
    }
});

app.post("/student/login", async(req, res) => {
    const {email,password}= req.body

    try{
        const result = await pool.query(
            `SELECT * FROM students WHERE email = $1`,[email]
        )

        if(result.rows.length==0){
            return res.status(404).json({message: "Student not found"})
        }

        const student = result.rows[0];

        const comparePassword = await bcrypt.compare(password, student.password);

        if(!comparePassword){
            return res.status(401).json({message: "incorrect password"})
        }


        const token = jsonwebtoken.sign(
            {id: student.id, email: student.email, role: "student"},
            process.env.JWT_SECRET,
            {expiresIn: "8h"}
        );

        res.json({
            message: "Student login successifully",
            token: token

        })
    }catch (err){
        res.status(500).json({message: "error while logging in ", error:err})
    }
})