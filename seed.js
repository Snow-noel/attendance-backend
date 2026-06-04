const bcrypt = require("bcrypt");
const pool = require("./database");

const seedAdmin = async () => {
    try {
        const hashedPassword = await bcrypt.hash("admin@mubas2026", 10);

        await pool.query(
            `INSERT INTO admins (first_name, last_name, email, password)
             VALUES ($1, $2, $3, $4)`,
            ["System", "Admin", "admin@mubas.ac.mw", hashedPassword]
        );

        console.log("Admin created successfully");
        process.exit(0);

    } catch (err) {
        console.error("Error creating admin:", err.message);
        process.exit(1);
    }
};

seedAdmin();