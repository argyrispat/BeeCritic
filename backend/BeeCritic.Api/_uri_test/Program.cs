using Npgsql;
try {
  var b = new NpgsqlConnectionStringBuilder("postgresql://user:pass@dpg-xxx-a/dbname");
  Console.WriteLine($"URI OK Host={b.Host} Db={b.Database} User={b.Username}");
} catch (Exception ex) {
  Console.WriteLine("URI FAIL: " + ex.GetBaseException().Message);
}
try {
  var b = new NpgsqlConnectionStringBuilder("");
  Console.WriteLine($"EMPTY OK len={b.ConnectionString?.Length}");
} catch (Exception ex) {
  Console.WriteLine("EMPTY FAIL: " + ex.GetBaseException().Message);
}
try {
  var b = new NpgsqlConnectionStringBuilder("Host=x;Database=y;Username=u;Password=p");
  Console.WriteLine($"KV OK Host={b.Host}");
} catch (Exception ex) {
  Console.WriteLine("KV FAIL: " + ex.GetBaseException().Message);
}
