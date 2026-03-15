using Microsoft.EntityFrameworkCore;
using NC.Data.Models;

namespace NC.Core.Services
{
    public class UserService(NoobzCordContext context)
    {

        public async Task<User?> ValidateUserAsync(string contact, string password, CancellationToken cancellationToken = default)
        {
            if (string.IsNullOrWhiteSpace(contact) || string.IsNullOrWhiteSpace(password))
                return null;

            var user = await context.Users
                .Include(u => u.UserPassword)
                .FirstOrDefaultAsync(u => u.Contact == contact.Trim(), cancellationToken)
                .ConfigureAwait(false);

            if (user?.UserPassword == null)
                return null;

            if (!BCrypt.Net.BCrypt.Verify(password, user.UserPassword.Hash))
                return null;

            return user;
        }


        public async Task<(User? User, string? Error)> CreateUserAsync(string name, string contact, string password, CancellationToken cancellationToken = default)
        {
            name = name?.Trim() ?? "";
            contact = contact?.Trim() ?? "";
            if (name.Length < 3)
                return (null, "Name must be at least 3 characters.");
            if (string.IsNullOrEmpty(contact))
                return (null, "Contact is required.");
            if (string.IsNullOrEmpty(password) || password.Length < 6)
                return (null, "Password must be at least 6 characters.");

            var exists = await context.Users
                .AnyAsync(u => u.Name == name || u.Contact == contact, cancellationToken)
                .ConfigureAwait(false);
            if (exists)
                return (null, "A user with this name or contact already exists.");

            var user = new User
            {
                ID = Guid.NewGuid(),
                Name = name,
                Contact = contact,
                RegistrationDate = DateTime.UtcNow,
                Status = 1,
                Role = 0,
            };
            var hash = BCrypt.Net.BCrypt.HashPassword(password, BCrypt.Net.BCrypt.GenerateSalt(12));
            var userPassword = new UserPassword
            {
                UserID = user.ID,
                Hash = hash,
            };

            context.Users.Add(user);
            context.UserPasswords.Add(userPassword);
            await context.SaveChangesAsync(cancellationToken).ConfigureAwait(false);

            return (user, null);
        }


        public async Task<User?> GetByIdAsync(Guid userId, CancellationToken cancellationToken = default)
        {
            return await context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.ID == userId, cancellationToken)
                .ConfigureAwait(false);
        }
    }
}
