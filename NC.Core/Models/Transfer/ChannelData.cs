namespace NC.Core.Models.Transfer
{
    public class ChannelData
    {
        public Guid ID { get; set; }
        public string Name { get; set; } = null!;
        public ChannelKindEnum Kind { get; set; }
    }
}
