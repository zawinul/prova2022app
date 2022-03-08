	const AWS = require('aws-sdk');

	function init(config) {
		async function set(key, value, timeToLiveMs) {
		}

		async function deleteExistingItem(key) {
		}

		async function get(key) {
			return null;
		}

		async function clean() {
		}

		async function reset() {
		}

		return {
			get, set, clean, reset
		}
	}

	module.exports = init;