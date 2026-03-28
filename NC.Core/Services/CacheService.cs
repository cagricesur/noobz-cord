using Microsoft.Extensions.Caching.Memory;
using NC.Core.Models;
using System.Collections.Concurrent;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace NC.Core.Services
{

    public class CacheService(IMemoryCache cache)
    {
        private static readonly JsonSerializerOptions SizeEstimateJsonOptions = new()
        {
            ReferenceHandler = ReferenceHandler.IgnoreCycles,
        };

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

        public IReadOnlyList<CacheEntryStatistics> GetStatistics()
        {
            List<CacheEntryStatistics> statistics = [.. CacheBag.Select(kvp => {
                var stats = CreateStatistics(kvp.Key, kvp.Value);
                if(stats == null){
                    return new CacheEntryStatistics(){
                        Key = string.Empty
                    };
                }
                return stats;
            })];

            statistics.RemoveAll(entity => entity.Key == string.Empty);

            return statistics.AsReadOnly();
        }

        private CacheEntryStatistics? CreateStatistics(string key, MemoryCacheEntryOptions options)
        {

            if (cache.TryGetValue(key, out var value))
            {
                var isSliding = false;
                var expiration = DateTime.UtcNow;
                if (options.SlidingExpiration.HasValue)
                {
                    isSliding = true;
                    expiration.Add(options.SlidingExpiration.Value);
                }
                else if(options.AbsoluteExpirationRelativeToNow.HasValue)
                {
                    expiration.Add(options.AbsoluteExpirationRelativeToNow.Value);
                }
                else if(options.AbsoluteExpiration.HasValue)
                {
                    expiration = options.AbsoluteExpiration.Value.UtcDateTime;
                }

                return new CacheEntryStatistics()
                {
                    Key = key,
                    IsSliding = isSliding,
                    ApproximateSizeBytes = GetApproximateSizeBytes(value),
                    Expiration =  expiration
                };
            }

            return null;
        }

        private static long GetApproximateSizeBytes(object? value)
        {
            if (value == null)
                return 0;
            try
            {
                return JsonSerializer.SerializeToUtf8Bytes(value, value.GetType(), SizeEstimateJsonOptions).LongLength;
            }
            catch (JsonException)
            {
                return value switch
                {
                    string s => Encoding.UTF8.GetByteCount(s),
                    byte[] b => b.LongLength,
                    _ => 0,
                };
            }
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
