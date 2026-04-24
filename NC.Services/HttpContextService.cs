using Microsoft.AspNetCore.Http;
using NC.Models.Definitions;

namespace NC.Services
{
    public class HttpContextService(IHttpContextAccessor  httpContextAccessor) : IHttpContextService
    {
        private static readonly string DefaultLanguage = "en";
        private static readonly string LanguageHeader = "x-noobzcord-language";
        public string Language()
        {
            return httpContextAccessor.HttpContext?.Request.Headers[LanguageHeader].FirstOrDefault() ?? DefaultLanguage;
        }
    }
}
