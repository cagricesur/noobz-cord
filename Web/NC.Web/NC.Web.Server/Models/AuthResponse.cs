namespace NC.Web.Server.Models;

public class AuthResponse
{
    public string Token { get; set; } = "";
    public Guid UserId { get; set; }
    public string Name { get; set; } = "";
    public string Contact { get; set; } = "";
}
