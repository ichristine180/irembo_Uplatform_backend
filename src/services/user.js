import Account from "../database/model/user_account.js";

export const findUserByMobile = async (mobile) =>
  Account.findOne({
    where: { mobile_no: mobile },
    raw: true,
  });
export const findUserById = async (id) =>
  Account.findOne({
    where: { id: id },
    raw: true,
  });
