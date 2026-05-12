import { clientApi } from "@/features/client/api/client.api";

export const clientService = {
  getProfile: clientApi.getProfile,
  updateProfile: clientApi.updateProfile,
  getDashboard: clientApi.getDashboard,
};
