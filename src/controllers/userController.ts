import User from "../models/userModel"
import { ProtectedRequest } from "../../types/app-request"
import { Request, Response } from "express"
import mongoose, { Types } from "mongoose"
import { userLoginSchema } from "../routes/userSchema"
import { BadRequestError } from "../core/CustomError"
import crypto from "crypto"
import { createKeys } from "./keyStoreController"
import { createTokens, validateTokenData } from "../auth/utils"
import { environment, tokenInfo } from "../config"
import { KeyStoreModel } from "../models/keyStoreModel"
import JWT from "../core/JWT"
import getRole from "./roleController"
import { RoleCode } from "../models/roleModel"
import asyncHandler from "../helpers/asyncHandler"

const loginUser = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  const { email, password } = req.body

  const data = userLoginSchema.safeParse(req.body);

  if (!data.success) {
    throw new BadRequestError("Invalid User Credentials");
  }

  const user = await User.findOne({ email })

  if (user && (await user?.matchPassword?.(password))) {
    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await createKeys(user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);

    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: environment === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours in ms
    })

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: environment === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
    })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
    })
  } else {
    throw new BadRequestError("Invalid User Credentials");
  }
})

const registerUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body

    const userExists = await User.findOne({ email })

    if (userExists) {
      res.status(400).json({
        message: "User already exists",
      })
      return
    }

    const user = await User.create({
      name,
      email,
      password,
      roles: [await getRole(RoleCode.USER)],
    })

    if (user) {
      const accessTokenKey = crypto.randomBytes(64).toString("hex")
      const refreshTokenKey = crypto.randomBytes(64).toString("hex")
      await createKeys(user, accessTokenKey, refreshTokenKey)
      const tokens = await createTokens(user, accessTokenKey, refreshTokenKey)

      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: environment === "production",
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, //ms
      })
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: environment === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, //ms
      })
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
      })
    } else {
      throw new BadRequestError("Invalid user credentials")
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Internal server error" })
  }
})

export const refreshAccessToken = asyncHandler(
  async (req: ProtectedRequest, res: Response) => {
    const accessTokenPayload = await JWT.decode(req.cookies.accessToken)
    validateTokenData(accessTokenPayload)

    const user = await User.findById(new Types.ObjectId(accessTokenPayload.sub))
    if (!user) throw new BadRequestError("User not registered")
    req.user = user

    const refreshTokenPayload = await JWT.validate(
      req.body.refreshToken,
      tokenInfo.secret
    )
    validateTokenData(refreshTokenPayload)

    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
      throw new BadRequestError("Invalid access token")

    const keystore = await KeyStoreModel.find({
      client: req.user,
      primaryKey: accessTokenPayload.prm,
      secondaryKey: refreshTokenPayload.prm,
    })

    if (!keystore) throw new BadRequestError("Invalid access token")
    await KeyStoreModel.deleteOne({
      client: req.user,
      primaryKey: accessTokenPayload.prm,
      secondaryKey: refreshTokenPayload.prm,
    })

    const accessTokenKey = crypto.randomBytes(64).toString("hex")
    const refreshTokenKey = crypto.randomBytes(64).toString("hex")

    await createKeys(req.user, accessTokenKey, refreshTokenKey)
    const tokens = await createTokens(req.user, accessTokenKey, refreshTokenKey)

    res.cookie("accessToken", tokens.accessToken, {
      httpOnly: true,
      secure: environment === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, //ms
    })

    res.status(200).json({
      message: "Access Token Refreshed",
    })
  }
)

// const forgotPassword = asyncHandler(async (req: ProtectedRequest, res: Response) => {
//   const { email } = req.body

//   const user = await User.findOne({ email })

//   if (!user) {
//     res.status(404)
//     throw new Error("User Not Found")
//   }

//   const resetToken = user.createPasswordResetToken()
//   user.save()

//   const resetUrl = `${req.protocol}://localhost:3000/reset-password/${resetToken}`

//   const message = `Forgot Password? Click on this this link to reset your Password: ${resetUrl}`

//   try {
//     await sendEmail({
//       email: user.email,
//       subject: "Your Password reset token. (valid for 10mins)",
//       message,
//     })

//     res.status(200).json({
//       message: "Token Sent to email!",
//     })
//   } catch (error) {
//     user.passwordResetToken = undefined
//     user.passwordResetExpires = undefined
//     user.save()
//     console.log(error)

//     res.status(500).json({
//       status: "error",
//       message:
//         "There was an error in sending the email. Please Try again later",
//     })
//   }
// })

// const resetPassword = asyncHandler(async (req: ProtectedRequest, res: Response) => {
//   const hashedToken = crypto
//     .createHash("sha256")
//     .update(req.params.resetToken)
//     .digest("hex")

//   const user = await User.findOne({
//     passwordResetToken: hashedToken,
//     passwordResetExpires: { $gt: Date.now() },
//   })

//   if (!user) {
//     res.status(400).json({
//       status: "fail",
//       message: "Token is invalid or has expired",
//     })
//   }

//   user.password = req.body.password
//   user.passwordResetToken = undefined
//   user.passwordResetExpires = undefined
//   user.save()

//   generateToken(res, user._id)

//   res.json({
//     _id: user._id,
//     name: user.name,
//     email: user.email,
//     isAdmin: user.isAdmin,
//   })
// })

const logoutUser = asyncHandler(async (req: ProtectedRequest, res: Response) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  })
  res.status(200).json({
    message: "Logged Out Successfully",
  })
})

export { loginUser, registerUser, logoutUser }
