Acme.Token = function(tokenName) 
{
	this.hasLocal	= typeof localStorage != "undefined" ? true : false;
	this.keyName 	= tokenName;
	this.token 		= {};
	var self 		= this;

};

Acme.Token.prototype.getToken = function() 
{
	if ( this.hasLocal ) {
	    this.token = localStorage.getItem(this.keyName);
	    return this.token && JSON.parse(this.token);

	} else {
	    // var c_start = document.cookie.indexOf(this.keyName + "=");
	    // if ( document.cookie.length > 0 ) {
	    //     if (c_start !== -1) {
	    //         return getCookieSubstring(c_start, this.keyName);
	    //     }
	    // }
	    return null;
	}
};
Acme.Token.prototype.setToken = function(value) 
{
	if ( this.hasLocal ) {
	    localStorage.setItem(this.keyName, value);
	} else {
	    // document.cookie = this.keyName + "=" + escape(value) +
	    // ((expiredays === null) ? "" : ";expires=" + exdate.toUTCString());
	}
};
Acme.Token.prototype.removeToken = function() 
{	
	if ( this.hasLocal ) {
	    return localStorage.removeItem(this.keyName);
	}
};