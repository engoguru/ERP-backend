import LicenseModel from "../models/license.model.js";
import cron from "node-cron";

export const startActiveUser = () => {
  cron.schedule('57 23 * * *', async () => {
    try {
      const result = await LicenseModel.updateMany({}, { activeUser: 0 });
      console.log(`Reset activeUser for ${result.modifiedCount} licenses at 11:57 PM`);
    } catch (err) {
      console.error('Error resetting activeUser:', err);
    }
  });
};
