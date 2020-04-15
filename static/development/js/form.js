/***                             ****
    Base Class for all Forms
***                              ****/
Acme.Form = function(validators, rules) {
    this.errorField;
    this.errorFields;
    this.validators = validators || null;
    this.validateRules = rules || {};
};
    Acme.Form.prototype = new Acme._View();
    Acme.Form.constructor = Acme.Form;
    Acme.Form.prototype.clearInlineErrors = function()
    {
        if (this.errorField) {
            this.errorField.removeClass('active');
        }
        for (var field in this.validateFields) {
            var fieldname = this.validateFields[field].split('.').reverse()[0];
            $('#'+fieldname).removeClass('formError');
        }
    };
    Acme.Form.prototype.addInlineErrors = function()
    {
        if (this.errorFields.length > 0 && this.errorField) {
            this.errorField.addClass('active');
        }
        for (var field in this.errorFields) {
            $('#'+this.errorFields[field]).addClass('formError');
        }
    };

    Acme.Form.prototype.validate = function( /* Array */ checkFields)  {
        // checkFields is used to validate a single field, 
        // otherwise itereate through all compulsory fields

        // intersect used to clear the field we want to check 
        // from errorFields.  if still an error it will add again.
        function intersect(a, b) {
            var t;
            if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
            return a.filter(function (e) {
                return b.indexOf(e) > -1;
            });
        }

        var validated = true, fields = [];
        if (checkFields && this.validateFields) {
            var fields = intersect(this.validateFields, checkFields);
            for (var j=0; j<fields.length;j++) {
                var fieldName = fields[j].split('.').reverse()[0];
                var index = this.errorFields.indexOf(fieldName);
                if (index === -1) break;
                this.errorFields.splice(index, 1);
            }
        } else {
            var fields = this.validateFields || [];
            this.errorFields = []; // reset and re-calcuate all fields
        }
        for (var i=0;i<fields.length; i++) {
            var key = fields[i];
            var keySplit = key.split('.');
            var scope = this.data;
            for(var j=0; j<keySplit.length; j++) {

                if (!scope[keySplit[j]]) {
                    scope = false;
                    break;
                }
                if(j == keySplit.length -1 ) {
                    scope = scope[keySplit[j]];
                    break;
                }
                scope = scope[keySplit[j]];
            }

            // DO THE VALIDATE!!!
            var fieldValidators = this.validateRules[key];
            if (fieldValidators.length > 0) {

                var fieldname = fields[i].split('.').reverse()[0];
                for (var k=0; k<fieldValidators.length; k++) {
                    if ( !this.validators[ fieldValidators[k] ](scope) ) {
                        this.errorFields.push(fieldname); 
                        validated = false;
                        break;
                    }
                }
            }
        }
        return validated;
    };




Acme.Validators = {
    'notEmpty' : function(input) {
        return !input ? false : true;
    },
    'isNumeric' : function(n) {
        if (!n) return true;
        return !isNaN(parseFloat(n)) && isFinite(n);
    },
    'username' : function(text) {
        return (text.length > 4);
    },  
    'isTrue' : function(data) {
        return (data === 'true' || data === true) ? true : false;
    }
};
