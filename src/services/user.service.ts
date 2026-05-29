import UserModel from "../models/user.model";
import TransactionModel from "../models/transaction.model";
import ReportModel from "../models/report.model";
import ReportSettingModel from "../models/report-setting.model";
import BudgetModel from "../models/budget.model";
import { BadRequestException, NotFoundException, UnauthorizedException } from "../utils/app-error";
import { ChangePasswordType, DeleteAccountType, UpdateUserType } from "../validators/user.validator";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import { compareOtp, generateOtp, getOtpExpiresAt, hashOtp } from "../utils/otp";
import { sendAccountDeletionOtpEmail } from "../mailers/account-deletion.mailer";

export const findByIdUserService = async (userId: string) => {
  const user = await UserModel.findById(userId);
  return user?.omitPassword();
};

export const updateUserService = async (
  userId: string,
  body: UpdateUserType,
  profilePic?: Express.Multer.File
) => {
  const user = await UserModel.findById(userId);
  if (!user) throw new NotFoundException("User not found");

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  user.set({
    name: body.name,
  });

  await user.save();

  return user.omitPassword();
};

export const changePasswordService = async (
  userId: string,
  body: ChangePasswordType
) => {
  const user = await UserModel.findById(userId).select("+password");
  if (!user) throw new NotFoundException("User not found");

  const isCurrentPasswordValid = await user.comparePassword(body.currentPassword);
  if (!isCurrentPasswordValid) {
    throw new UnauthorizedException(
      "Current password is incorrect",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED
    );
  }

  user.set({ password: body.newPassword });
  await user.save();

  return { message: "Password changed successfully" };
};

export const sendDeleteAccountOtpService = async (userId: string) => {
  const user = await UserModel.findById(userId).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt",
  );
  if (!user) throw new NotFoundException("User not found");

  const otp = generateOtp();
  user.set({
    emailVerificationOtpHash: await hashOtp(otp),
    emailVerificationOtpExpiresAt: getOtpExpiresAt(),
  });

  await user.save();

  await sendAccountDeletionOtpEmail({
    email: user.email,
    username: user.name,
    otp,
  });
};

export const deleteUserService = async (userId: string, body: DeleteAccountType) => {
  const user = await UserModel.findById(userId).select(
    "+emailVerificationOtpHash +emailVerificationOtpExpiresAt",
  );
  if (!user) throw new NotFoundException("User not found");

  if (!user.emailVerificationOtpHash) {
    throw new BadRequestException(
      "OTP verification is required before deleting your account",
      ErrorCodeEnum.ACCESS_UNAUTHORIZED,
    );
  }

  if (
    !user.emailVerificationOtpExpiresAt ||
    user.emailVerificationOtpExpiresAt.getTime() < Date.now()
  ) {
    user.set({
      emailVerificationOtpHash: null,
      emailVerificationOtpExpiresAt: null,
    });
    await user.save();

    throw new UnauthorizedException(
      "OTP code has expired. Please request a new code.",
      ErrorCodeEnum.AUTH_OTP_EXPIRED,
    );
  }

  const isOtpValid = await compareOtp(body.otp, user.emailVerificationOtpHash);

  if (!isOtpValid) {
    throw new UnauthorizedException(
      "Invalid OTP code",
      ErrorCodeEnum.AUTH_OTP_INVALID,
    );
  }

  // Remove related user data and delete user record
  await Promise.all([
    TransactionModel.deleteMany({ userId }),
    ReportModel.deleteMany({ userId }),
    ReportSettingModel.deleteMany({ userId }),
    BudgetModel.deleteMany({ userId }),
  ]);

  await UserModel.findByIdAndDelete(userId);

  return { message: "User deleted successfully" };
};
