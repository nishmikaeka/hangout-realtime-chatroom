import express from "express";
import {
  createRoom,
  deleteRoom,
  getRoomDetails,
  joinRoom,
} from "../controllers/roomController.js";
import userAuth from "../middlewares/userAuth.js";

const roomRouter = express.Router();

roomRouter.post("/create", userAuth, createRoom);
roomRouter.get("/:id", userAuth, getRoomDetails);
roomRouter.post("/join", joinRoom);
roomRouter.delete("/:id", userAuth, deleteRoom);

export default roomRouter;
