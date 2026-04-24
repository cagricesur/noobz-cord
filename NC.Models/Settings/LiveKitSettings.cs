namespace NC.Models.Settings
{
    public class LiveKitSettings
    {
        public const string Section = nameof(LiveKitSettings);
        public required string Server { get; set; }
        public required string ApiKey { get; set; }
        public required string ApiSecret { get; set; }
        public required string RoomName { get; set; }
    }
}
