const authMiddleware = (role) => (req, res, next) => {
    if (!req.session.user) {
        console.log(`[AUTH MIDDLEWARE] No session found. Redirecting to login.`);
        return res.redirect('/login.html');
    }

    const userRole = req.session.user.role;

    // Allow admins to access all pages
    if (userRole === 'admin') {
        return next(); // Admins can access everything
    }

    // Allow teachers to access their own and student dashboards
    if (userRole === 'teacher' && (role === 'teacher' || role === 'student')) {
        return next();
    }

    // Allow students only access to their own dashboard
    if (userRole === 'student' && role === 'student') {
        return next();
    }

    console.log(`[AUTH MIDDLEWARE] Access denied for ${userRole} to ${req.originalUrl}. Redirecting to their own dashboard.`);

    // Redirect to the user's own dashboard if access is denied
    const redirectPage = {
        admin: '/admin.html',
        teacher: '/teacher.html',
        student: '/student.html',
    };

    res.redirect(redirectPage[userRole]);
};

module.exports = authMiddleware;
