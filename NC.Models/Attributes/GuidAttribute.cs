using System.ComponentModel.DataAnnotations;

namespace NC.Models.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class GuidAttribute() : ValidationAttribute
    {
        public override bool IsValid(object? value)
        {
            return Guid.TryParse(value?.ToString(), out _);
        }
    }
}
