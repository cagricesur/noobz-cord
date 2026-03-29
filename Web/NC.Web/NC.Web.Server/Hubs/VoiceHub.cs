using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using NC.Core.Models.Transfer;

namespace NC.Web.Server.Hubs
{
    public class VoiceHub : Hub
    {
        private static readonly ConcurrentDictionary<string, UserData> UserData = new();
        private static readonly ConcurrentDictionary<string, string> RoomData = new();

        private static readonly string RoomID = "NoobzCordVoiceRoom";
        public async Task JoinGroup(string user)
        {
            if (RoomData.TryGetValue(user, out string? existingConntectionId))
            {
                RoomData.Remove(user, out _);
                if(UserData.TryGetValue(existingConntectionId, out _))
                {
                    UserData.Remove(existingConntectionId, out _);
                }
                await Groups.RemoveFromGroupAsync(existingConntectionId, RoomID);
                await Clients.OthersInGroup(RoomID).SendAsync("UserLeft", user);
                await Clients.Caller.SendAsync("UserMultipleSessionDisconnect");
            }

            RoomData.AddOrUpdate(user, Context.ConnectionId, (key, value) => { return Context.ConnectionId; });
            UserData.AddOrUpdate(Context.ConnectionId, new UserData { Name = user }, (key, value) => { return new UserData { Name = user }; });
            await Groups.AddToGroupAsync(Context.ConnectionId, RoomID);
            await Clients.OthersInGroup(RoomID).SendAsync("UserJoined", user);
            await Clients.Caller.SendAsync("UsersInRoomInit", RoomData.Keys.ToList());
        }

        public async Task LeaveGroup(string user)
        {
            if (RoomData.TryGetValue(user, out string? connectionId))
            {
                RoomData.Remove(user, out _);
                await Groups.RemoveFromGroupAsync(connectionId, RoomID);
                await Clients.OthersInGroup(RoomID).SendAsync("UserLeft", user);
            }
        }

        public async Task MuteSelf(string user)
        {
            await Clients.OthersInGroup(RoomID).SendAsync("UserMutedSelf", user);
        }
        public async Task UnMuteSelf(string user)
        {
            await Clients.OthersInGroup(RoomID).SendAsync("UserUnMutedSelf", user);
        }

        public async Task DeafenSelf(string user)
        {
            await Clients.OthersInGroup(RoomID).SendAsync("UserDeafenedSelf", user);
        }
        public async Task UnDeafenSelf(string user)
        {
            await Clients.OthersInGroup(RoomID).SendAsync("UserUnDeafenedSelf", user);
        }

        public async Task UserStartedSpeaking(string user)
        {
            await Clients.OthersInGroup(RoomID).SendAsync("UserStartedSpeaking", user);
        }
        public async Task UserStoppedSpeaking(string user)
        {
            await Clients.OthersInGroup(RoomID).SendAsync("UserStoppedSpeaking", user);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (UserData.TryGetValue(Context.ConnectionId, out var userData))
            {
                UserData.Remove(Context.ConnectionId, out _);
                if(RoomData.TryGetValue(userData.Name, out _))
                {
                    RoomData.Remove(userData.Name, out _);
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, RoomID);
                    await Clients.OthersInGroup(RoomID).SendAsync("UserLeft", userData.Name);
                }
            }

            await base.OnDisconnectedAsync(exception);
        }
    }
}
