import { Router } from "express";
import { approvedRestaurants, getAdminStats, getAllRestaurants } from "./admin.controller.js";
import { adminOnly, protect } from "../../middlewares/auth.js";

const adminRouter = Router();

adminRouter.use(protect)
adminRouter.use(adminOnly)

adminRouter.get('/restaurants', getAllRestaurants);
adminRouter.put('/restaurants/:id/approve', approvedRestaurants);
adminRouter.get('/stats', getAdminStats);

export default adminRouter;