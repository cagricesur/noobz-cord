namespace NC.Core.Models;

public sealed class CacheEntryStatistics
{
    public required string Key { get; init; }
    public bool IsSliding { get; init; }
    public long ApproximateSizeBytes { get; init; }
    public DateTime? Expiration { get; init; }
}
