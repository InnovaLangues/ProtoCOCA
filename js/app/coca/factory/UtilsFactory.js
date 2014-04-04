'use strict';

function UtilsFactory() {
    var appUtils = new Utils();
    
    return{
        getUtil : function(){
            return appUtils;
        }
    }
}


