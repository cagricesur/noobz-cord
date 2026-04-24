namespace NC.Utils
{
    public static class Extensions
    {
        public static T ToEnum<T>(this byte value) where T : struct, Enum
        {
            if (!Enum.IsDefined(typeof(T), (int)value))
            {
                throw new ArgumentException($"Value {value} is not defined for enum {typeof(T).Name}");
            }

            return (T)Enum.ToObject(typeof(T), value);
        }
        public static byte ToByte<T>(this T value) where T:struct, Enum
        {
            return Convert.ToByte(value);
        }
    }
}
