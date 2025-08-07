import { StatusCode } from "./constants"

class ApiError extends Error {
    statusCode: StatusCode
    message: string
    success: boolean
    errors: any[]
    
    constructor(
        statusCode: StatusCode  ,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.errors = errors

        if ( stack ){
            this.stack = stack
        } else {
            Error.captureStackTrace( this, this.constructor)
        }
    }
}


export {ApiError}