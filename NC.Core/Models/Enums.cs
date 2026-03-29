namespace NC.Core.Models
{
    public enum UserTokenStatus
    {
        Ready,
        Used,
        Expired
    }
    public enum UserStatusEnum
    {
        Passive,
        Active,
        WaitingForActivation
    }

    public enum UserRoleEnum
    {
        Member,
        Moderator,
        Admin
    }

    public enum ChannelKindEnum
    {
        Unknown,
        Text,
        Voice
    }
    public enum ChannelStatusEnum
    {
        Passive,
        Active
    }
}
