import express from "express"
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
} from "../controllers/userController"
import validateRequest, { ValidationSource } from "../helpers/validator"
import { refreshAccessTokenSchema, userLoginSchema, userRegisterSchema } from "./userSchema"
import apiKey from "../auth/apiKey"

const router = express.Router()

router.route("/login").post(validateRequest(userLoginSchema, ValidationSource.BODY), loginUser)
router.route("/register").post(validateRequest(userRegisterSchema, ValidationSource.BODY), registerUser)
router.route("/refresh").post(validateRequest(refreshAccessTokenSchema, ValidationSource.BODY), refreshAccessToken);
router.route("/logout").get(logoutUser)

export default router
