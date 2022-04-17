
function selectRole(roles, userinfo, extraInfo) {

	var role = roles[Math.floor(Math.random()*roles.length)];

	return role;
}

module.exports = {
	selectRole
};