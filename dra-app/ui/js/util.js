
/* 
 * Allows alphanumeric
 * Restrict user to enter special characters 
 */
function validateField(event) {
	var key;
	var keychar;
	if (window.event)
		key = window.event.keyCode;
	else if (event)
		key = event.which;
	else
		return true;
	keychar = String.fromCharCode(key);
	keychar = keychar.toLowerCase();
	// control keys 
	if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13)
			|| (key == 27) || (key == 32))
		return true;
	// alphas and numbers 
	else if ((("abcdefghijklmnopqrstuvwxyz0123456789").indexOf(keychar) > -1))
		return true;
	else
		return false;
}

/* 
 * Allows alpha value only
 */
function validateAlphaField(event) {
var key;
var keychar;
if (window.event)
key = window.event.keyCode;
else if (event)
key = event.which;
else
return true;
keychar = String.fromCharCode(key);
keychar = keychar.toLowerCase();
// control keys 
if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13)
|| (key == 27) || (key == 32))
return true;
// alphabet and number 
else if ((("abcdefghijklmnopqrstuvwxyz").indexOf(keychar) > -1))
return true;
else
return false;
}

/* 
 * Allows numbers only
 */
function validateNumberField(event) {
	var key;
	var keychar;
	if (window.event)
		key = window.event.keyCode;
	else if (event)
		key = event.which;
	else
		return true;
	keychar = String.fromCharCode(key);
	keychar = keychar.toLowerCase();
	// control keys 
	if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13)
			|| (key == 27) || (key == 32))
		return true;
	// alphabet and number 
	else if ((("0123456789").indexOf(keychar) > -1))
		return true;
	else
		return false;
}
/* 
 * Restrict user to enter script tags(< & >) 
 */
function denyScriptTag(event) {
	var key;
	if (window.event)
		key = window.event.keyCode;
	else if (event)
		key = event.which;
	else
		return true;

	if ((key == 62) || (key == 60))
		return false;
	else
		return true;
}
/* 
 * Restrict user to enter other than (alphanumeric, <, -, = & >) 
 */
function validateScaleField(event) {
	var key;
	var keychar;
	if (window.event)
		key = window.event.keyCode;
	else if (event)
		key = event.which;
	else
		return true;
	keychar = String.fromCharCode(key);
	keychar = keychar.toLowerCase();
	// control keys 
	if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13)
			|| (key == 27) || (key == 32) || (key == 62) || (key == 60)
			|| (key == 61) || (key == 45))
		return true;
	// alphas and numbers 
	else if ((("abcdefghijklmnopqrstuvwxyz0123456789").indexOf(keychar) > -1))
		return true;
	else
		return false;
}
/* 
 * Allows user to enter alphanumeric and - 
 */
function validateId(event) {
	var key;
	var keychar;
	if (window.event)
		key = window.event.keyCode;
	else if (event)
		key = event.which;
	else
		return true;
	keychar = String.fromCharCode(key);
	keychar = keychar.toLowerCase();
	// control keys 
	if ((key == null) || (key == 0) || (key == 8) || (key == 9) || (key == 13)
			|| (key == 27) || (key == 32) || (key == 45))
		return true;
	// alphas and numbers 
	else if ((("abcdefghijklmnopqrstuvwxyz0123456789").indexOf(keychar) > -1))
		return true;
	else
		return false;
}
/*
 * check onblur for special characters
 * remove special characters except space
 */
function toAlphaNumeric(elementId) {
	var text = document.getElementById(elementId).value;
	var regex = new RegExp('[^0-9a-zA-Z ]+');
	if (text.match(regex)) {
		text = null;
	}
	document.getElementById(elementId).value = text;
}
/*
 * check onblur for script tags
 * remove < & >
 */
function removeScriptTag(elementId) {
	var text = document.getElementById(elementId).value;
	var regex = new RegExp('[<>]+');
	if (text.match(regex)) {
		text = null;
	}
	document.getElementById(elementId).value = text;
}
/*
 * check onblur for special characters
 * allow <, -, =, >
 */
function toScale(elementId) {
	var text = document.getElementById(elementId).value;
	var regex = new RegExp('[^0-9a-zA-Z<>= -]+');
	if (text.match(regex)) {
		text = null;
	}
	document.getElementById(elementId).value = text;
}
/*
 * check onblur for characters and special characters
 * allow only numbers
 */
function toNumeric(elementId) {
	var text = document.getElementById(elementId).value;
	var regex = new RegExp('[^0-9]+');
	if (text.match(regex)) {
		text = null;
	}
	document.getElementById(elementId).value = text;
}
/*
 * check onblur for alphanumeric and hyphen
 */
function toValidId(elementId) {
	var text = document.getElementById(elementId).value;
	var regex = new RegExp('[^0-9a-zA-Z -]+');
	if (text.match(regex)) {
		text = null;
	}
	document.getElementById(elementId).value = text;
}
