using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json.Serialization;

namespace NC.Models
{
    public class ServiceResponse
    {
        [JsonIgnore]
        public int StatusCode { get; set; } = StatusCodes.Status200OK;

        [JsonIgnore]
        public string? ErrorCode { get; set; }


        public void SetSuccess()
        {
            SetSuccess(StatusCodes.Status200OK);
        }
        public void SetSuccess(int statusCode)
        {
            ErrorCode = null;
            StatusCode = statusCode;
        }
        public void SetError(int statusCode, string errorCode)
        {
            ErrorCode = errorCode;
            StatusCode = statusCode;
        }

        public ObjectResult ToControllerResponse()
        {
            if (string.IsNullOrEmpty(ErrorCode))
            {
                return new ObjectResult(this)
                {
                    StatusCode = StatusCode
                };
            }
            else
            {
                return new ObjectResult(new ServiceError() { Code = ErrorCode })
                {
                    StatusCode = StatusCode
                };
            }
        }
    }
}
