namespace NC.Models.Contracts
{
    public class RegistrationResponse : ServiceResponse
    {
        public Guid Token { get; set; }
        public string? TokenHash { get; set; }
    }
}
