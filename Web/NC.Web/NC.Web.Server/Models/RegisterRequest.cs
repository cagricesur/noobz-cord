using System.ComponentModel.DataAnnotations;

namespace NC.Web.Server.Models;

public class RegisterRequest
{
    [Required]
    [MinLength(3)]
    public string Name { get; set; } = "";

    [Required]
    public string Contact { get; set; } = "";

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = "";
}
