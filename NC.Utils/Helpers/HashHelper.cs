namespace NC.Utils.Helpers
{
    public class HashHelper
    {
        public static string Hash(string value)
        {
            return BCrypt.Net.BCrypt.HashPassword(value, BCrypt.Net.BCrypt.GenerateSalt(12));
        }
        public static bool Verify(string value, string hash)
        {
            return BCrypt.Net.BCrypt.Verify(value, hash);
        }
    }
}
