// Simple C# Example
using System;

public class Example
{
    /// <summary>
    /// XML Doc Comment for Greet
    /// </summary>
    /// <param name="name">Name to greet</param>
    public static void Greet(string name)
    {
        // Output to console
        Console.WriteLine($"Hello, {name}!");
    }

    public static void Main(string[] args)
    {
        string user = "C# Coder";
        Greet(user); /* Basic comment */
    }
}