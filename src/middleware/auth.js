export function requireAuth(req, res, next) {
  const user = req.session?.currentUser
  if (!user) return res.sendStatus(401)
  req.user = user
  next()
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.session?.currentUser?.role
    if (!role || !roles.includes(role)) return res.sendStatus(403)
    next()
  }
}
