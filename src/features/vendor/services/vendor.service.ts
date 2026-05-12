import { vendorApi } from "@/features/vendor/api/vendor.api";

export const vendorService = {
  getProfile: vendorApi.getProfile,
  getSetupState: vendorApi.getSetupState,
  submitSetup: vendorApi.submitSetup,
  getDashboard: vendorApi.getDashboard,
};
