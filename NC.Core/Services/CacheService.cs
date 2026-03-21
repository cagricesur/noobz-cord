using Microsoft.Extensions.Caching.Memory;
using System.Collections.Concurrent;

namespace NC.Core.Services
{

    public class CacheService(IMemoryCache cache)
    {
        public ConcurrentBag<string> Keys { get; } = [];
        public Task<T> Add<T>(string key, Func<ICacheEntry, Task<T>> factory)
             where T : new()
        {
            return Add(key, factory, null);
        }
        public Task<T> AddRelative<T>(string key, Func<ICacheEntry, Task<T>> factory, TimeSpan absoluteExpiration)
             where T : new()
        {
            return Add(key, factory, new MemoryCacheEntryOptions()
            {
                AbsoluteExpirationRelativeToNow = absoluteExpiration
            });
        }
        public Task<T> AddAbsolute<T>(string key, Func<ICacheEntry, Task<T>> factory, DateTimeOffset absoluteExpiration)
             where T : new()
        {
            return Add(key, factory, new MemoryCacheEntryOptions()
            {
                AbsoluteExpiration = absoluteExpiration
            });
        }
        public Task<T> AddSliding<T>(string key, Func<ICacheEntry, Task<T>> factory, TimeSpan slidingExpiration)
             where T : new()
        {
            return Add(key, factory, new MemoryCacheEntryOptions()
            {
                SlidingExpiration = slidingExpiration
            });
        }
        private async Task<T> Add<T>(string key, Func<ICacheEntry, Task<T>> factory, MemoryCacheEntryOptions? createOptions)
            where T : new()
        {
            if (!Keys.Contains(key))
            {
                Keys.Add(key);
            }
            var cached = await cache.GetOrCreateAsync(key, factory, createOptions);
            return cached ?? new T();
        }

        public void Remove(string key)
        {
            cache.Remove(key);
        }
        public void Clear()
        {
            foreach (var key in Keys)
            {
                Remove(key);
            }
            Keys.Clear();
        }
    }
}
