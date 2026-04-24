using Microsoft.Extensions.Caching.Memory;

namespace NC.Models.Definitions
{
    public interface ICacheService
    {
        Task<T> AddRelative<T>(string key, Func<ICacheEntry, Task<T>> factory, TimeSpan absoluteExpiration) where T : new();
        Task<T> AddAbsolute<T>(string key, Func<ICacheEntry, Task<T>> factory, DateTimeOffset absoluteExpiration) where T : new();
        Task<T> AddSliding<T>(string key, Func<ICacheEntry, Task<T>> factory, TimeSpan slidingExpiration) where T : new();
        void Remove(string key);
        void Clear();
    }
}
