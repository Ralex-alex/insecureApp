const authMiddleware = (role) => (req, res, next) => {
    if (!req.session.user) {
        console.log(`[AUTH MIDDLEWARE] No session found. Redirecting to login.`);
        return res.redirect('/login.html');
    }

    const userRole = req.session.user.role;

    if (userRole === 'admin') {
        return next();
    }
    if (userRole === 'teacher' && (role === 'teacher' || role === 'student')) {
        return next();
    }
    if (userRole === 'student' && role === 'student') {
        return next();
    }

    console.log(`[AUTH MIDDLEWARE] Access denied for ${userRole} to ${req.originalUrl}.`);
    const redirectPage = {
        admin: '/admin.html',
        teacher: '/teacher.html',
        student: '/student.html',
    };
    res.redirect(redirectPage[userRole]);
};

module.exports = authMiddleware;

