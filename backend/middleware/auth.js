/* eslint-env node, commonjs */
const jwt = require("jsonwebtoken");

function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) {
      console.warn(
        "[AUTH] No token provided - headers:",
        Object.keys(req.headers),
      );
      return res.status(401).json({ message: "No token provided" });
    }

    let token = authHeader;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer "))
      token = authHeader.split(" ")[1];

    const jwtSecret = process?.env?.JWT_SECRET || "devsecret";
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.id;
    req.userRole = decoded.role;
    // also expose email so controllers can make email-based authorization decisions
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error("[AUTH] Token verification failed", err && err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

function isAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    let token = authHeader;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer "))
      token = authHeader.split(" ")[1];

    const jwtSecret = process?.env?.JWT_SECRET || "devsecret";
    const decoded = jwt.verify(token, jwtSecret);

    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error("[AUTH] Admin verification failed", err && err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authenticate, isAdmin };

function isDoctor(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });
    let token = authHeader;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer "))
      token = authHeader.split(" ")[1];
    const jwtSecret = process?.env?.JWT_SECRET || "devsecret";
    const decoded = require("jsonwebtoken").verify(token, jwtSecret);
    if (decoded.role !== "doctor" && decoded.role !== "admin") {
      return res.status(403).json({ message: "Doctor access required" });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error("[AUTH] Doctor verification failed", err && err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

function isLab(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader)
      return res.status(401).json({ message: "No token provided" });
    let token = authHeader;
    if (typeof authHeader === "string" && authHeader.startsWith("Bearer "))
      token = authHeader.split(" ")[1];
    const jwtSecret = process?.env?.JWT_SECRET || "devsecret";
    const decoded = require("jsonwebtoken").verify(token, jwtSecret);
    if (decoded.role !== "lab" && decoded.role !== "admin") {
      return res.status(403).json({ message: "Lab access required" });
    }
    req.userId = decoded.id;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (err) {
    console.error("[AUTH] Lab verification failed", err && err.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authenticate, isAdmin, isDoctor, isLab };
