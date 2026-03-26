// src/api/endpoints.js

// Based on the provided routing list
export const API_ENDPOINTS = {
  // Auth
  REGISTER: "register/user/",
  LOGIN: "login/",
  TOKEN_REFRESH: "token/refresh/",

  // Users & Profiles
  PROFILES: "profiles/",
  PROFILE_CREATE: "profiles/create/",
  PROFILE_DETAIL: (id) => `profiles/${id}/`,
  USER_PROFILE_EDIT: "user-profile/edit/",

  // Banners
  BANNERS: "Banners/",

  // Categories
  CATEGORIES: "categories/",
  SUBCATEGORIES: "subcategories/",

  // Products
  PRODUCTS: "products/",
  PRODUCT_DETAIL: (id) => `products/${id}/`,
  POPULAR_PRODUCTS: "get_popular_products/",
  SEARCH_PRODUCT: "search-product/",
  
  // Product Images
  PRODUCT_UPLOAD_IMAGES: (id) => `products/${id}/upload-images/`,
  PRODUCT_IMAGES: (id) => `products/${id}/images/`,
  PRODUCT_DELETE_IMAGE: (imageId) => `products/images/${imageId}/delete/`,

  // Product Variations
  PRODUCT_VARIATIONS: (id) => `products/${id}/variations/`,
  UPDATE_PRODUCT_VARIATION: (variationId) => `products/variations/${variationId}/`, // or /product-variation/<id>/update/ Based on image line 51 and 23

  // Cart
  CART: "cart/",
  CART_ADD: "cart/add/",
  CART_REMOVE: (itemId) => `cart/remove/${itemId}/`,
  CART_CLEAR: "cart/clear/",
  CART_UPDATE_QUANTITY: (itemId) => `cart/update-quantity/${itemId}/`,

  // Wishlist
  WISHLIST: "wishlist/",
  WISHLIST_ADD: "wishlist/add/",
  WISHLIST_REMOVE: (productId) => `wishlist/remove/${productId}/`,

  // Reviews
  REVIEWS_ADD: "reviews/add/",
  PRODUCT_REVIEWS: (productId) => `reviews/${productId}/`,
  UPDATE_REVIEW: (reviewId) => `reviews/update/${reviewId}/`,
  DELETE_REVIEW: (reviewId) => `reviews/delete/${reviewId}/`,

  // Addresses
  ADDRESSES: "addresses/",
  ADDRESS_ADD: "addresses/add/",
  ADDRESS_UPDATE: (addressId) => `addresses/update/${addressId}/`,
  ADDRESS_DELETE: (addressId) => `addresses/delete/${addressId}/`,

  // Orders
  PLACE_ORDER_CART: "order-from-cart/",
  PLACE_ORDER_DIRECT: "place-order-directt/",
  USER_ORDERS: "user-orders/",
  GET_ALL_ORDER_ITEMS: "get_all_order_items/",
  GET_ORDERS_BY_SHOPKEEPER: "get-orders-by-shopkeeper/",
  ACCEPT_ORDER: (orderId) => `orders/${orderId}/acceptt/`,
  CANCEL_ORDER: (orderId) => `orders/${orderId}/cancel/`,
  UPDATE_ORDER_STATUS: (orderId) => `orders/${orderId}/update-status/`, // from line 49
  UPDATE_ORDER_STATUS_ALT: (orderId) => `update-order-status/${orderId}/`, // from line 52

  // Miscellaneous
  UPDATE_IS_ACTIVE: "update-is-active/",
  FIND: "find/",
};
