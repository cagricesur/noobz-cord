using NC.Core.Models.Base;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace NC.Core.Models.Contracts
{
    public class ConferenceRequest : BaseRequest
    {
        [JsonIgnore]
        public required Guid UserID { get; set; }    
    }
}
