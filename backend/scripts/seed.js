require("dotenv").config({ path: "../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");
const Project = require("../src/models/Project");
const Task = require("../src/models/Task");

const MONGO_URI = process.env.MONGO_URI;

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected...");

    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    console.log("Existing data cleared.");

    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@test.com",
      password: hashedPassword,
      role: "ADMIN",
    });

    const memberUser = await User.create({
      name: "Member User",
      email: "member@test.com",
      password: hashedPassword,
      role: "MEMBER",
    });

    console.log("Users seeded.");

    const project = await Project.create({
      name: "Website Redesign",
      description: "Redesign the company website for better UX and modern aesthetics.",
      owner: adminUser._id,
      members: [
        { user: adminUser._id, role: "ADMIN" },
        { user: memberUser._id, role: "MEMBER" },
      ],
    });

    console.log("Project seeded.");

    const tasks = await Task.insertMany([
      {
        title: "Design new homepage layout",
        description: "Create wireframes and mockups for the new homepage.",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        project: project._id,
        createdBy: adminUser._id,
      },
      {
        title: "Develop user authentication module",
        description: "Implement login, registration, and password reset functionalities.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        project: project._id,
        assignee: memberUser._id,
        createdBy: adminUser._id,
      },
      {
        title: "Write API documentation",
        description: "Document all backend API endpoints with examples.",
        status: "DONE",
        priority: "LOW",
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        project: project._id,
        createdBy: adminUser._id,
      },
      {
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment.",
        status: "TODO",
        priority: "HIGH",
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago (overdue)
        project: project._id,
        createdBy: adminUser._id,
      },
      {
        title: "Optimize database queries",
        description: "Review and optimize slow queries for better performance.",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        project: project._id,
        assignee: adminUser._id,
        createdBy: adminUser._id,
      },
    ]);

    console.log("Tasks seeded.");

    console.log("Database seeded successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding database:", err);
    process.exit(1);
  }
};

seedDB();
