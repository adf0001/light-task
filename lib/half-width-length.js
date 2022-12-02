
//regExtraHalf: depend on the font used by environment
module.exports = function halfWidthLength(str, regExtraHalf) {
	var l0 = str.length;

	//remove all half width chars, defined by unicode
	str = str.replace(/[\u0000-\u00ff\uFF61-\uFF9F\uFFE8-\uFFEE]+/g, "");

	//remove half width chars defined by user
	if (regExtraHalf) str = str.replace(regExtraHalf, "");

	return (l0 - str.length) +		//length of half
		([...str].length * 2);		//length of full width
}
