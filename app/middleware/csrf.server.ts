import { createCsrfMiddleware } from "remix-utils/middleware/csrf";

export const csrfMiddleware = createCsrfMiddleware({
  //  	safeMethods: ["GET", "HEAD", "OPTIONS", "POST"],
    //	safeMethods: [ "HEAD", "OPTIONS", "POST"],
});