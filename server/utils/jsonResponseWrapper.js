

module.exports = {
    successResponse: function(data){
        return {
            status: "success",
            data: data
        }
    },
    failResponse: function(errors){
        return {
            status: "fail",
            data: errors
        }
    },
    errorResponse: function(message){
        return {
            status: "error",
            message: message
        }
    }
};
