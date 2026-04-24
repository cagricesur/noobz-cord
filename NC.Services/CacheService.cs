using Microsoft.Extensions.Caching.Memory;
using NC.Models.Definitions;
using System.Collections.Concurrent;

namespace NC.Services
{
    public class CacheService(IMemoryCache cache) : ICacheService
    {
        public ConcurrentDictionary<string, MemoryCacheEntryOptions> CacheBag { get; } = [];
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
        private async Task<T> Add<T>(string key, Func<ICacheEntry, Task<T>> factory, MemoryCacheEntryOptions createOptions)
            where T : new()
        {
            createOptions.RegisterPostEvictionCallback((evictedKey, _, _, _) =>
            {
                if (evictedKey is string sk)
                    CacheBag.TryRemove(sk, out _);
            });
            CacheBag.AddOrUpdate(key, createOptions, (k, v) => createOptions);
            var cached = await cache.GetOrCreateAsync(key, factory, createOptions);
            return cached ?? new T();
        }

        public void Remove(string key)
        {
            cache.Remove(key);
        }
        public void Clear()
        {
            foreach (var cache in CacheBag)
            {
                Remove(cache.Key);
            }
        }
    }
}
