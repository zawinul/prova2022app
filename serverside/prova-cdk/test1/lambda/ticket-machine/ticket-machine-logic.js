
function selectRole(roles, userinfo, source, extraInfo) {

	var role = roles[Math.floor(Math.random()*roles.length)];

	return role;
}

module.exports = {
	selectRole
};