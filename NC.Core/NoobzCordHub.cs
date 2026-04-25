using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Collections.Concurrent;
using System.Security.Claims;

namespace NC.Core
{
    [Authorize]
    public class NoobzCordHub : Hub
    {
        private static readonly ConcurrentDictionary<Guid, ConferenceConnection> ActiveConferenceConnections = new();

        public Task<ConferenceJoinStatus> BeginConferenceJoin()
        {
            var userId = GetCurrentUserId();

            if (ActiveConferenceConnections.TryGetValue(userId, out var activeConnection) &&
                activeConnection.ConnectionId != Context.ConnectionId)
            {
                return Task.FromResult(new ConferenceJoinStatus
                {
                    HasDuplicate = true,
                    Message = "Only one instance of the same user can be in the conference room."
                });
            }

            ActiveConferenceConnections[userId] = new ConferenceConnection(Context.ConnectionId, DateTimeOffset.UtcNow);

            return Task.FromResult(new ConferenceJoinStatus
            {
                HasDuplicate = false,
                Message = null
            });
        }

        public async Task<ConferenceJoinDecision> ResolveDuplicateConferenceInstance(bool replaceExisting)
        {
            var userId = GetCurrentUserId();

            if (!replaceExisting)
            {
                return new ConferenceJoinDecision
                {
                    Accepted = false,
                    Message = "Conference join cancelled."
                };
            }

            string? replacedConnectionId = null;
            var newConnection = new ConferenceConnection(Context.ConnectionId, DateTimeOffset.UtcNow);

            ActiveConferenceConnections.AddOrUpdate(
                userId,
                newConnection,
                (_, existingConnection) =>
                {
                    if (existingConnection.ConnectionId != Context.ConnectionId)
                    {
                        replacedConnectionId = existingConnection.ConnectionId;
                    }

                    return newConnection;
                });

            if (replacedConnectionId != null)
            {
                await Clients.Client(replacedConnectionId).SendAsync(
                    "ConferenceInstanceKicked",
                    "You were signed off because this user joined the conference from another instance.");
            }

            return new ConferenceJoinDecision
            {
                Accepted = true,
                Message = null
            };
        }

        public Task EndConferenceSession()
        {
            RemoveConnectionIfCurrent(Context.ConnectionId);
            return Task.CompletedTask;
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            RemoveConnectionIfCurrent(Context.ConnectionId);
            return base.OnDisconnectedAsync(exception);
        }

        private Guid GetCurrentUserId()
        {
            var claim = Context.User?.Claims.FirstOrDefault(entity => entity.Type == ClaimTypes.NameIdentifier);

            if (claim == null || !Guid.TryParse(claim.Value, out var userId))
            {
                throw new HubException("Invalid authenticated user.");
            }

            return userId;
        }

        private static void RemoveConnectionIfCurrent(string connectionId)
        {
            foreach (var pair in ActiveConferenceConnections)
            {
                if (pair.Value.ConnectionId == connectionId)
                {
                    ActiveConferenceConnections.TryRemove(pair.Key, out _);
                    break;
                }
            }
        }
    }

    public sealed record ConferenceConnection(string ConnectionId, DateTimeOffset JoinedAt);

    public sealed class ConferenceJoinStatus
    {
        public bool HasDuplicate { get; set; }

        public string? Message { get; set; }
    }

    public sealed class ConferenceJoinDecision
    {
        public bool Accepted { get; set; }

        public string? Message { get; set; }
    }
}
