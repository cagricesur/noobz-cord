using System.ComponentModel.DataAnnotations;

namespace NC.Web.Server.Models;

public class LoginRequest
{
    [Required]
    public string Contact { get; set; } = "";

    [Required]
    public string Password { get; set; } = "";
}
