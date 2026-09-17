import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

/* =========================================================
   CORS CONFIGURATION
========================================================= */

const allowedOrigins = [
  // Local development
  "http://localhost:5173",

  // Production frontend
  "https://riyadprodhan91.netlify.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Postman / curl / server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    console.log("REQUEST ORIGIN:", origin);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("❌ CORS blocked origin:", origin);
    console.log("✅ Allowed origins:", allowedOrigins);

    return callback(
      new Error(`CORS blocked for origin: ${origin}`)
    );
  },

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  credentials: true,

  optionsSuccessStatus: 204,
};

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors(corsOptions));

app.use(express.json());

/* =========================================================
   DATABASE SCHEMAS
========================================================= */

/* -------------------------
   Education Schema
------------------------- */

const EducationSchema = new mongoose.Schema(
  {
    inst: {
      type: String,
      default: "",
      trim: true,
    },

    deg: {
      type: String,
      default: "",
      trim: true,
    },

    result: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  }
);

/* -------------------------
   Project Schema
------------------------- */

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    desc: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      default: "",
      trim: true,
    },

    github: {
      type: String,
      default: "",
      trim: true,
    },

    tech: {
      type: [String],
      default: [],
    },
  },
  {
    _id: true,
  }
);

/* -------------------------
   Blog Schema
------------------------- */

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
      trim: true,
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      default: "",
    },

    date: {
      type: String,
      default: "",
      trim: true,
    },

    url: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

/* -------------------------
   Portfolio Schema
------------------------- */

const PortfolioSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Riyad Prodhan",
      trim: true,
    },

    role: {
      type: String,
      default: "Frontend / MERN Stack Developer",
      trim: true,
    },

    tagline: {
      type: String,
      default: "",
      trim: true,
    },

    aboutTitle: {
      type: String,
      default: "About Me",
      trim: true,
    },

    about: {
      type: String,
      default: "",
    },

    goal: {
      type: String,
      default: "",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    whatsapp: {
      type: String,
      default: "",
      trim: true,
    },

    github: {
      type: String,
      default: "",
      trim: true,
    },

    linkedin: {
      type: String,
      default: "",
      trim: true,
    },

    facebook: {
      type: String,
      default: "",
      trim: true,
    },

    cvUrl: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    education: {
      type: [EducationSchema],
      default: [],
    },

    projects: {
      type: [ProjectSchema],
      default: [],
    },

    blogs: {
      type: [BlogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Portfolio =
  mongoose.models.Portfolio ||
  mongoose.model(
    "Portfolio",
    PortfolioSchema
  );

/* =========================================================
   MONGODB CONNECTION
========================================================= */

let isConnected = false;

const connectDB = async () => {
  if (
    isConnected &&
    mongoose.connection.readyState === 1
  ) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI পাওয়া যায়নি।"
    );
  }

  try {
    await mongoose.connect(
      process.env.MONGODB_URI
    );

    isConnected = true;

    console.log(
      "MongoDB কানেক্ট হয়েছে ✓"
    );
  } catch (error) {
    isConnected = false;

    console.error(
      "MongoDB কানেকশন ব্যর্থ:",
      error.message
    );

    throw error;
  }
};

/* =========================================================
   DATABASE MIDDLEWARE
========================================================= */

app.use(
  async (req, res, next) => {
    try {
      await connectDB();

      next();
    } catch (error) {
      console.error(
        "Database middleware error:",
        error.message
      );

      return res.status(500).json({
        success: false,
        message:
          "Database connection failed.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

const requireAuth = (
  req,
  res,
  next
) => {
  try {
    const authHeader =
      req.headers.authorization || "";

    if (
      !authHeader.startsWith(
        "Bearer "
      )
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication token পাওয়া যায়নি।",
      });
    }

    const token =
      authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message:
          "JWT_SECRET server configuration-এ নেই।",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    next();
  } catch (error) {
    console.error(
      "Auth error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message:
        "Session expired বা token সঠিক নয়। আবার login করো।",
    });
  }
};

/* =========================================================
   BASIC / HEALTH ROUTE
========================================================= */

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "Portfolio API চলছে ✓",
      database:
        mongoose.connection
          .readyState === 1
          ? "connected"
          : "disconnected",
    });
  }
);

/* =========================================================
   AUTH
========================================================= */

/* -------------------------
   Login
------------------------- */

app.post(
  "/api/auth/login",
  (req, res) => {
    try {
      const { password } =
        req.body;

      if (!password) {
        return res.status(400).json({
          success: false,
          message:
            "Password দিতে হবে।",
        });
      }

      if (
        !process.env
          .ADMIN_PASSWORD
      ) {
        return res.status(500).json({
          success: false,
          message:
            "ADMIN_PASSWORD server configuration-এ নেই।",
        });
      }

      if (
        password !==
        process.env.ADMIN_PASSWORD
      ) {
        return res.status(401).json({
          success: false,
          message:
            "পাসওয়ার্ড সঠিক নয়।",
        });
      }

      if (
        !process.env.JWT_SECRET
      ) {
        return res.status(500).json({
          success: false,
          message:
            "JWT_SECRET server configuration-এ নেই।",
        });
      }

      const token = jwt.sign(
        {
          role: "admin",
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      return res.json({
        success: true,
        message:
          "Login successful.",
        token,
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Login করতে সমস্যা হয়েছে।",
      });
    }
  }
);

/* -------------------------
   Check Login
------------------------- */

app.get(
  "/api/auth/me",
  requireAuth,
  (req, res) => {
    res.json({
      success: true,
      message:
        "Authentication valid.",
      admin: req.admin,
    });
  }
);

/* =========================================================
   PORTFOLIO
========================================================= */

/* -------------------------
   Get Portfolio
   Public
------------------------- */

app.get(
  "/api/portfolio",
  async (req, res) => {
    try {
      let portfolio =
        await Portfolio.findOne();

      if (!portfolio) {
        portfolio =
          await Portfolio.create({});
      }

      return res.status(200).json({
        success: true,
        data: portfolio,
      });
    } catch (error) {
      console.error(
        "Get portfolio error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Portfolio load করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Update Full Portfolio
   Admin
------------------------- */

app.put(
  "/api/portfolio",
  requireAuth,
  async (req, res) => {
    try {
      const update =
        req.body;

      let portfolio =
        await Portfolio.findOne();

      if (!portfolio) {
        portfolio =
          new Portfolio(update);
      } else {
        Object.assign(
          portfolio,
          update
        );
      }

      await portfolio.save();

      return res.json({
        success: true,
        message:
          "Portfolio successfully updated.",
        data: portfolio,
      });
    } catch (error) {
      console.error(
        "Update portfolio error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Portfolio save করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   SKILLS
========================================================= */

app.put(
  "/api/skills",
  requireAuth,
  async (req, res) => {
    try {
      const { skills } =
        req.body;

      if (
        !Array.isArray(skills)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Skills অবশ্যই array হতে হবে।",
        });
      }

      const cleanSkills =
        skills
          .filter(
            (item) =>
              typeof item ===
              "string"
          )
          .map((item) =>
            item.trim()
          )
          .filter(Boolean);

      const portfolio =
        await Portfolio.findOneAndUpdate(
          {},
          {
            $set: {
              skills:
                cleanSkills,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

      return res.json({
        success: true,
        message:
          "Skills updated successfully.",
        data: portfolio,
      });
    } catch (error) {
      console.error(
        "Skills update error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Skills update করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   PROJECTS
========================================================= */

/* -------------------------
   Add Project
------------------------- */

app.post(
  "/api/projects",
  requireAuth,
  async (req, res) => {
    try {
      const {
        title,
        desc,
        url,
        github,
        tech,
      } = req.body;

      const project = {
        title:
          typeof title ===
          "string"
            ? title.trim()
            : "",

        desc:
          typeof desc ===
          "string"
            ? desc.trim()
            : "",

        url:
          typeof url ===
          "string"
            ? url.trim()
            : "",

        github:
          typeof github ===
          "string"
            ? github.trim()
            : "",

        tech: Array.isArray(
          tech
        )
          ? tech
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : typeof tech ===
            "string"
          ? tech
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : [],
      };

      const portfolio =
        await Portfolio.findOneAndUpdate(
          {},
          {
            $push: {
              projects:
                project,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

      const addedProject =
        portfolio.projects[
          portfolio.projects
            .length - 1
        ];

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Project added successfully.",
          data:
            addedProject,
          portfolio,
        });
    } catch (error) {
      console.error(
        "Add project error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Project add করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Update Project
------------------------- */

app.put(
  "/api/projects/:projectId",
  requireAuth,
  async (req, res) => {
    try {
      const {
        projectId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID.",
        });
      }

      const portfolio =
        await Portfolio.findOne();

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message:
            "Portfolio পাওয়া যায়নি।",
        });
      }

      const project =
        portfolio.projects.id(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project পাওয়া যায়নি।",
        });
      }

      const {
        title,
        desc,
        url,
        github,
        tech,
      } = req.body;

      project.title =
        typeof title ===
        "string"
          ? title.trim()
          : "";

      project.desc =
        typeof desc ===
        "string"
          ? desc.trim()
          : "";

      project.url =
        typeof url ===
        "string"
          ? url.trim()
          : "";

      project.github =
        typeof github ===
        "string"
          ? github.trim()
          : "";

      project.tech =
        Array.isArray(tech)
          ? tech
              .filter(
                (item) =>
                  typeof item ===
                  "string"
              )
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : typeof tech ===
            "string"
          ? tech
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean)
          : [];

      await portfolio.save();

      return res.json({
        success: true,
        message:
          "Project updated successfully.",
        data: project,
        portfolio,
      });
    } catch (error) {
      console.error(
        "Update project error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Project update করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Delete Project
------------------------- */

app.delete(
  "/api/projects/:projectId",
  requireAuth,
  async (req, res) => {
    try {
      const {
        projectId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          projectId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID.",
        });
      }

      const portfolio =
        await Portfolio.findOne();

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message:
            "Portfolio পাওয়া যায়নি।",
        });
      }

      const project =
        portfolio.projects.id(
          projectId
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project পাওয়া যায়নি।",
        });
      }

      project.deleteOne();

      await portfolio.save();

      return res.json({
        success: true,
        message:
          "Project deleted successfully.",
        data:
          portfolio.projects,
        portfolio,
      });
    } catch (error) {
      console.error(
        "Delete project error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Project delete করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   EDUCATION
========================================================= */

/* -------------------------
   Add Education
------------------------- */

app.post(
  "/api/education",
  requireAuth,
  async (req, res) => {
    try {
      const {
        inst,
        deg,
        year,
        result,
        description,
        images,
      } = req.body;

      const cleanImages =
        Array.isArray(images)
          ? images
              .filter(
                (url) =>
                  typeof url ===
                    "string" &&
                  url.trim() !== ""
              )
              .map((url) =>
                url.trim()
              )
              .slice(0, 6)
          : [];

      const education = {
        inst:
          typeof inst ===
          "string"
            ? inst.trim()
            : "",

        deg:
          typeof deg ===
          "string"
            ? deg.trim()
            : "",

        year:
          typeof year ===
          "string"
            ? year.trim()
            : "",

        result:
          typeof result ===
          "string"
            ? result.trim()
            : "",

        description:
          typeof description ===
          "string"
            ? description.trim()
            : "",

        images:
          cleanImages,
      };

      if (!education.inst) {
        return res.status(400).json({
          success: false,
          message:
            "Institution name is required.",
        });
      }

      if (!education.deg) {
        return res.status(400).json({
          success: false,
          message:
            "Degree / Program is required.",
        });
      }

      const portfolio =
        await Portfolio.findOneAndUpdate(
          {},
          {
            $push: {
              education,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

      const addedEducation =
        portfolio.education[
          portfolio.education
            .length - 1
        ];

      console.log(
        "EDUCATION ADDED:",
        addedEducation
      );

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Education added successfully.",
          data:
            addedEducation,
          portfolio,
        });
    } catch (error) {
      console.error(
        "ADD EDUCATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Education add করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Update Education
------------------------- */

app.put(
  "/api/education/:educationId",
  requireAuth,
  async (req, res) => {
    try {
      const {
        educationId,
      } = req.params;

      console.log(
        "UPDATE EDUCATION ID:",
        educationId
      );

      if (
        !mongoose.Types.ObjectId.isValid(
          educationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid education ID.",
        });
      }

      const {
        inst,
        deg,
        year,
        result,
        description,
        images,
      } = req.body;

      const cleanInst =
        typeof inst ===
        "string"
          ? inst.trim()
          : "";

      const cleanDeg =
        typeof deg ===
        "string"
          ? deg.trim()
          : "";

      const cleanYear =
        typeof year ===
        "string"
          ? year.trim()
          : "";

      const cleanResult =
        typeof result ===
        "string"
          ? result.trim()
          : "";

      const cleanDescription =
        typeof description ===
        "string"
          ? description.trim()
          : "";

      const cleanImages =
        Array.isArray(images)
          ? images
              .filter(
                (url) =>
                  typeof url ===
                    "string" &&
                  url.trim() !== ""
              )
              .map((url) =>
                url.trim()
              )
              .slice(0, 6)
          : [];

      if (!cleanInst) {
        return res.status(400).json({
          success: false,
          message:
            "Institution name is required.",
        });
      }

      if (!cleanDeg) {
        return res.status(400).json({
          success: false,
          message:
            "Degree / Program is required.",
        });
      }

      const portfolio =
        await Portfolio.findOneAndUpdate(
          {
            "education._id":
              new mongoose.Types.ObjectId(
                educationId
              ),
          },
          {
            $set: {
              "education.$.inst":
                cleanInst,

              "education.$.deg":
                cleanDeg,

              "education.$.year":
                cleanYear,

              "education.$.result":
                cleanResult,

              "education.$.description":
                cleanDescription,

              "education.$.images":
                cleanImages,
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message:
            "Education পাওয়া যায়নি।",
        });
      }

      const updatedEducation =
        portfolio.education.find(
          (item) =>
            item._id.toString() ===
            educationId
        );

      console.log(
        "EDUCATION UPDATED:",
        updatedEducation
      );

      return res.json({
        success: true,
        message:
          "Education updated successfully.",
        data:
          updatedEducation,
        portfolio,
      });
    } catch (error) {
      console.error(
        "UPDATE EDUCATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Education update করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Delete Education
------------------------- */

app.delete(
  "/api/education/:educationId",
  requireAuth,
  async (req, res) => {
    try {
      const {
        educationId,
      } = req.params;

      console.log(
        "DELETE EDUCATION ID:",
        educationId
      );

      if (
        !mongoose.Types.ObjectId.isValid(
          educationId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid education ID.",
        });
      }

      const objectId =
        new mongoose.Types.ObjectId(
          educationId
        );

      const portfolio =
        await Portfolio.findOneAndUpdate(
          {
            "education._id":
              objectId,
          },
          {
            $pull: {
              education: {
                _id: objectId,
              },
            },
          },
          {
            new: true,
          }
        );

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message:
            "Education পাওয়া যায়নি।",
        });
      }

      console.log(
        "EDUCATION DELETED:",
        educationId
      );

      return res.json({
        success: true,
        message:
          "Education deleted successfully.",
        data:
          portfolio.education,
        portfolio,
      });
    } catch (error) {
      console.error(
        "DELETE EDUCATION ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Education delete করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   BLOGS
========================================================= */

/* -------------------------
   Add Blog
------------------------- */

app.post(
  "/api/blogs",
  requireAuth,
  async (req, res) => {
    try {
      const {
        title,
        excerpt,
        content,
        date,
        url,
      } = req.body;

      const blog = {
        title:
          typeof title ===
          "string"
            ? title.trim()
            : "",

        excerpt:
          typeof excerpt ===
          "string"
            ? excerpt.trim()
            : "",

        content:
          typeof content ===
          "string"
            ? content
            : "",

        date:
          typeof date ===
          "string"
            ? date.trim()
            : "",

        url:
          typeof url ===
          "string"
            ? url.trim()
            : "",
      };

      const portfolio =
        await Portfolio.findOneAndUpdate(
          {},
          {
            $push: {
              blogs: blog,
            },
          },
          {
            new: true,
            upsert: true,
          }
        );

      const addedBlog =
        portfolio.blogs[
          portfolio.blogs
            .length - 1
        ];

      return res
        .status(201)
        .json({
          success: true,
          message:
            "Blog added successfully.",
          data: addedBlog,
          portfolio,
        });
    } catch (error) {
      console.error(
        "Add blog error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Blog add করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Update Blog
------------------------- */

app.put(
  "/api/blogs/:blogId",
  requireAuth,
  async (req, res) => {
    try {
      const {
        blogId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          blogId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid blog ID.",
        });
      }

      const portfolio =
        await Portfolio.findOne();

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message:
            "Portfolio পাওয়া যায়নি।",
        });
      }

      const blog =
        portfolio.blogs.id(
          blogId
        );

      if (!blog) {
        return res.status(404).json({
          success: false,
          message:
            "Blog পাওয়া যায়নি।",
        });
      }

      blog.title =
        typeof req.body.title ===
        "string"
          ? req.body.title.trim()
          : "";

      blog.excerpt =
        typeof req.body.excerpt ===
        "string"
          ? req.body.excerpt.trim()
          : "";

      blog.content =
        typeof req.body.content ===
        "string"
          ? req.body.content
          : "";

      blog.date =
        typeof req.body.date ===
        "string"
          ? req.body.date.trim()
          : "";

      blog.url =
        typeof req.body.url ===
        "string"
          ? req.body.url.trim()
          : "";

      await portfolio.save();

      return res.json({
        success: true,
        message:
          "Blog updated successfully.",
        data: blog,
        portfolio,
      });
    } catch (error) {
      console.error(
        "Update blog error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Blog update করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* -------------------------
   Delete Blog
------------------------- */

app.delete(
  "/api/blogs/:blogId",
  requireAuth,
  async (req, res) => {
    try {
      const {
        blogId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          blogId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid blog ID.",
        });
      }

      const portfolio =
        await Portfolio.findOne();

      if (!portfolio) {
        return res.status(404).json({
          success: false,
          message:
            "Portfolio পাওয়া যায়নি।",
        });
      }

      const blog =
        portfolio.blogs.id(
          blogId
        );

      if (!blog) {
        return res.status(404).json({
          success: false,
          message:
            "Blog পাওয়া যায়নি।",
        });
      }

      blog.deleteOne();

      await portfolio.save();

      return res.json({
        success: true,
        message:
          "Blog deleted successfully.",
        data: portfolio.blogs,
        portfolio,
      });
    } catch (error) {
      console.error(
        "Delete blog error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Blog delete করতে সমস্যা হয়েছে।",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   404
========================================================= */

app.use(
  (req, res) => {
    res.status(404).json({
      success: false,
      message:
        "API route পাওয়া যায়নি।",
      path: req.originalUrl,
    });
  }
);

/* =========================================================
   GLOBAL ERROR HANDLER
========================================================= */

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "Global error:",
      err
    );

    if (
      err.message?.startsWith(
        "CORS blocked"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error.",
      error: err.message,
    });
  }
);

/* =========================================================
   VERCEL
========================================================= */

export default app;

/* =========================================================
   LOCAL SERVER
========================================================= */

if (
  process.env.NODE_ENV !==
  "production"
) {
  const PORT =
    process.env.PORT || 5000;

  app.listen(
    PORT,
    () => {
      console.log(
        `Server চলছে: http://localhost:${PORT}`
      );
    }
  );
}