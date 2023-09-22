const checkLogin = async (req, res, next) => {
	try {
		if(!req.session.logged_in){
			res.redirect('/admin');
		} else {
			next();
		}
	} catch (error) {
		console.log(error)
		res.redirect('/admin')
	}
}
const checkAdmin = async (req, res, next) => {
	try {
		if(req.session.role === 5003){
			next();
		} else {
			res.redirect('/admin/signature-templates')
		}
	} catch (error) {
		console.log(error)
		res.redirect('/admin')
	}
}

module.exports = { checkLogin, checkAdmin }