import UserModel from "../models/user.model";
import { NotFoundException, UnauthorizedException } from "../utils/app-error";
import { ChangePasswordType, UpdateUserType } from "../validators/user.validator";
import { ErrorCodeEnum } from "../enums/error-code.enum";
import TransactionModel from "../models/transaction.model";
import { resolveCurrencyConversion } from "./currency-conversion.service";
import { exchangeRateService } from "./exchange-rate.service";
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
  const previousBaseCurrency = user.baseCurrency || "USD";
  const nextBaseCurrency = body.baseCurrency?.toUpperCase();

  if (profilePic) {
    user.profilePicture = profilePic.path;
  }

  user.set({
    ...(body.name && { name: body.name }),
    ...(nextBaseCurrency && { baseCurrency: nextBaseCurrency }),
  });

  if (nextBaseCurrency && nextBaseCurrency !== previousBaseCurrency) {
    await rebaseTransactionsToCurrency(
      userId,
      previousBaseCurrency,
      nextBaseCurrency,
    );
  }

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
async function rebaseTransactionsToCurrency(
  userId: string,
  previousBaseCurrency: string,
  nextBaseCurrency: string,
) {
  const transactions = await TransactionModel.find({ userId });

  // cache exchange rate per currency pair — avoids N API calls
  const rateCache = new Map<string, number>();

  const bulkOps = [];
  const errors: string[] = [];

  for (const transaction of transactions) {
    try {
      const sourceAmount =
        transaction.originalAmount != null
          ? transaction.originalAmount
          : transaction.amount;
      const sourceCurrency =
        transaction.originalCurrency ||
        transaction.baseCurrencyAtTime ||
        previousBaseCurrency;

      const cacheKey = `${sourceCurrency}->${nextBaseCurrency}`;

      if (!rateCache.has(cacheKey)) {
        const rateResult = await exchangeRateService.getRate(
          sourceCurrency.toUpperCase(),
          nextBaseCurrency.toUpperCase(),
        );
        rateCache.set(cacheKey, rateResult.rate);
      }

      const rate = rateCache.get(cacheKey)!;
      const convertedAmount = Number(sourceAmount) * rate;

      bulkOps.push({
        updateOne: {
          filter: { _id: transaction._id },
          update: {
            $set: {
              amount: convertedAmount,
              originalAmount: sourceAmount,
              originalCurrency: sourceCurrency.toUpperCase(),
              baseCurrencyAtTime: nextBaseCurrency.toUpperCase(),
              exchangeRate: rate,
              rateSource: "cached",
              exchangeRateFetchedAt: new Date(),
            },
          },
        },
      });
    } catch (error: any) {
      errors.push(`Transaction ${transaction._id}: ${error.message}`);
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Currency rebase failed for ${errors.length} transactions: ${errors.join(", ")}`
    );
  }

  if (bulkOps.length > 0) {
    await TransactionModel.bulkWrite(bulkOps, { ordered: false });
  }
}