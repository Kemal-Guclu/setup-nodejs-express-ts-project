import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Uppkoppling mot databasen
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "banksajt2025",
  port: 3306, // Mac 8889, Windows 3306
});

type User = {
  id: number;
  username: string;
  password: string;
  insertId?: number;
};

type Account = {
  id: number;
  user_id: number;
  amount: number;
};

// Generera engångslösenord
function generateOTP() {
  // Generera en sexsiffrig numerisk OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
}

// Helper function
async function query(sql: string, params: any[]) {
  const [result] = await pool.execute(sql, params);
  return result as any;
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

// Route - Skapa användare och lösenord i users-tabellen
app.post("/users", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await query(
      "INSERT INTO users (username, password) VALUES (?, ?)",
      [username, password]
    );

    // console.log(result);
    res
      .status(201)
      .send(
        "Jättebra! Det gick att skapa en user. Nu ska vi skapa en account också"
      );

    if (res.status(201)) {
      const user_id = result.insertId;
      const account = await query(
        "INSERT INTO account (user_id, amount) VALUES (?, ?)",
        [user_id, 2000]
      );
      console.log("Account created");
    }
  } catch (error) {
    console.log("Error creating user", error);
    res.status(500).send("Error creating user asd");
  }
});

// Login med användare och lösenord och se om det matchar i databasen
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    // Hämta användare i db
    const result = await query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);

    const user = result[0];

    if (user.password === password) {
      res.status(200).send("Login successfull");
    } else {
      res.status(401).send("invalid username or password");
    }
  } catch (error) {}
});
