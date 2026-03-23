using System.ComponentModel.DataAnnotations;
using System.Text.RegularExpressions;

namespace NC.Core.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class PasswordAttribute(string[] patterns, string[] errors) : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            for (int i = 0; i < patterns.Length; i++)
            {
                var pattern = new Regex(patterns[i]);
                if (!pattern.IsMatch(value?.ToString() ?? string.Empty))
                {
                    return new ValidationResult(errors[i]);
                }
            }
            return null;
        }
    }
}
