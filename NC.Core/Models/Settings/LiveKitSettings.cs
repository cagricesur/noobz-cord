namespace NC.Core.Models.Settings
{
    public class LiveKitSettings
    {
        public const string Section = nameof(LiveKitSettings);
        public string Server { get; set; } = null!;
        public string ApiKey { get; set; } = null!;
        public string ApiSecret { get; set; } = null!;
        public string RoomName { get; set; } = null!;
    }
}
