export const requirePro = (req, res, next) => {

  const isPro = req.user.plan === "pro" &&
                req.user.planExpiresAt &&
                new Date(req.user.planExpiresAt) > new Date();

  if (!isPro) {
    return res.status(403).json({
      success: false,
      message: "Upgrade to Pro to access Study Support",
      upgradeUrl: "/pricing",
    });
  }

  next();

};