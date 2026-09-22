using System.Security.Cryptography;
using System.Text;

namespace LibertApp.Api.Security;

/// <summary>
/// Hashing de senhas com PBKDF2 + salt por usuário. Mantém compatibilidade de leitura com o
/// hash legado (SHA-256 sem salt) usado antes desta migração, para que contas existentes
/// continuem autenticando; Verify sinaliza via NeedsRehash quando o hash deve ser atualizado.
/// </summary>
public static class PasswordHasher
{
    private const string Prefix = "pbkdf2$sha256$";
    private const int SaltSize = 16;
    private const int HashSize = 32;
    private const int Iterations = 100_000;

    public static string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(SaltSize);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, HashSize);
        return $"{Prefix}{Iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool Verify(string password, string storedHash)
    {
        if (string.IsNullOrEmpty(storedHash)) return false;

        if (storedHash.StartsWith(Prefix, StringComparison.Ordinal))
        {
            var parts = storedHash[Prefix.Length..].Split('$');
            if (parts.Length != 3 || !int.TryParse(parts[0], out var iterations)) return false;

            byte[] salt, expected;
            try
            {
                salt = Convert.FromBase64String(parts[1]);
                expected = Convert.FromBase64String(parts[2]);
            }
            catch (FormatException)
            {
                return false;
            }

            var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }

        // Hash legado: SHA-256 sem salt (formato usado antes da migração para PBKDF2)
        return LegacySha256(password) == storedHash;
    }

    /// <summary>True quando o hash armazenado ainda está no formato legado e deve ser regravado.</summary>
    public static bool NeedsRehash(string storedHash) => !storedHash.StartsWith(Prefix, StringComparison.Ordinal);

    private static string LegacySha256(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }

    public static string GenerateRandomPassword(int length = 16)
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
        var sb = new StringBuilder(length);
        foreach (var b in RandomNumberGenerator.GetBytes(length))
        {
            sb.Append(chars[b % chars.Length]);
        }
        return sb.ToString();
    }
}
