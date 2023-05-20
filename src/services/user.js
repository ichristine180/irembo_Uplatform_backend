import Account from "../database/model/user_account.js";
import UserProfile from "../database/model/user_profile.js";
import VerificationRequest from "../database/model/account_verification_request.js";
import CustomError from "../helpers/CustomError.js";
export const findUserByMobile = async (mobile) =>{
  console.log("Mobile number",mobile)
  return Account.findOne({
    where: { mobile_no: mobile },
    raw: true,
  });
}
export const findUserById = async (id) =>
  Account.findOne({
    where: { id: id },
    raw: true,
  });
export const findRequestById = async (id) =>
  VerificationRequest.findOne({
    where: { id: id },
    raw: true,
  });
export const findProfileByUser = async (id) =>
  await UserProfile.findOne({
    where: { user_account_id: id },
  });
export const findVerificationRequestByUser = async (id) =>
  await VerificationRequest.findOne({
    where: { user_account_id: id },
  });

export const updateProfileInfo = async ({
  user_account_id,
  identification_number,
  identity_image,
  identification_type,
}) => {
  try {
    const userProfile = await findProfileByUser(user_account_id);
    if (!userProfile)
      throw new CustomError(
        `User profile with account ID ${user_account_id} not found.`,
        404
      );
    userProfile.identification_number = identification_number;
    userProfile.identity_image = identity_image;
    userProfile.identification_type = identification_type;
    await userProfile.save();
    return userProfile;
  } catch (error) {
    console.error("Failed to update profile information:", error);
    throw error;
  }
};
export const updateAccountStatus = async (id, newStatus) =>
  await Account.update({ status: newStatus }, { where: { id } });
export const createVerification = async (id) =>
  await VerificationRequest.create({
    user_account_id: id,
    status: "Pending",
  });
