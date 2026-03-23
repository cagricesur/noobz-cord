

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace NC.Core.Models
{
    public class ServiceResponse<T>
    {
        public T? Content { get; set; }
        public int StatusCode = StatusCodes.Status200OK;
        public string? ErrorCode { get; set; }

        public void SetError(int statusCode, string errorCode)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
            Content = default;
        }
        public void SetSuccess(int statusCode)
        {
            SetSuccess(statusCode, default);
        }
        public void SetSuccess(T value)
        {
            SetSuccess(StatusCode, value);
        }
        public void SetSuccess(int statusCode, T? value)
        {
            StatusCode = statusCode;
            Content = value;
            ErrorCode = null;
        }

        public IActionResult ToControllerResponse()
        {
            object? content;
            if (StatusCode >= 200 && StatusCode <= 299)
            {
                content = new ProblemDetails()
                {
                    Title = ErrorCode
                };
            }
            else
            {
                content = Content;
            }

            return new ObjectResult(content)
            {
                StatusCode = StatusCode,
            };
        }
    }
}
