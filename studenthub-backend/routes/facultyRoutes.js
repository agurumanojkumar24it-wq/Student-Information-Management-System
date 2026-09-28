import express from "express";
import Faculty from "../models/Faculty.js";
import { protect } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateId } from "../utils/generateId.js";

const router = express.Router();

const selector = (id) => ({
  $or: [
    { facultyId: id },
    ...(id.match(/^[0-9a-fA-F]{24}$/) ? [{ _id: id }] : []),
  ],
});

router.get(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const faculty = await Faculty.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: faculty,
    });
  })
);

router.get(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOne(selector(req.params.id));

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    res.json({
      success: true,
      data: faculty,
    });
  })
);

router.post(
  "/",
  protect,
  asyncHandler(async (req, res) => {
    const {
      facultyId,
      name,
      email,
      phone,
      department,
      designation,
    } = req.body;

    if (!name || !email || !department) {
      return res.status(400).json({
        success: false,
        message: "Name, email and department are required.",
      });
    }

    const id = facultyId?.trim() || generateId("FAC");

    if (await Faculty.findOne({ facultyId: id })) {
      return res.status(409).json({
        success: false,
        message: "Faculty ID already exists.",
      });
    }

    const faculty = await Faculty.create({
      facultyId: id,
      name,
      email,
      phone,
      department,
      designation,
    });

    res.status(201).json({
      success: true,
      message: "Faculty created successfully.",
      data: faculty,
    });
  })
);

router.put(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOneAndUpdate(
      selector(req.params.id),
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    res.json({
      success: true,
      message: "Faculty updated successfully.",
      data: faculty,
    });
  })
);

router.delete(
  "/:id",
  protect,
  asyncHandler(async (req, res) => {
    const faculty = await Faculty.findOneAndDelete(
      selector(req.params.id)
    );

    if (!faculty) {
      return res.status(404).json({
        success: false,
        message: "Faculty not found.",
      });
    }

    res.json({
      success: true,
      message: "Faculty deleted successfully.",
    });
  })
);

export default router;