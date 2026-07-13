import { Router } from "express";
import { getFeaturedRestaurants, getRestaurantAvailability, getRestaurantBySlug, getRestaurants } from "./restaurant.controller.js";

const restaurantRouter = Router();

restaurantRouter.get('/', getRestaurants);
restaurantRouter.get('/featured', getFeaturedRestaurants);
restaurantRouter.get('/:slug', getRestaurantBySlug)
restaurantRouter.get('/:id/availability', getRestaurantAvailability);


export default restaurantRouter;