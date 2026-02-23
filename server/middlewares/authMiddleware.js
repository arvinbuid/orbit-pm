export const protect = (req, res, next) => {
  try {
    const {userId} = req.auth();

    if (!userId) {
      return res.status(401).json({message: "Unauthorized. No valid session."});
    }

    req.userId = userId;
    next();
  } catch (err) {
    console.error(err);
    res.status(401).json({message: err.code || err.message});
  }
};
