export interface TemplateSeed {
  id: string;
  language: string;
  name: string;
  description: string;
  icon: string;
  default_filename: string;
  default_code: string;
  category: string;
  compiler_info: string;
}

export const STARTER_TEMPLATES: TemplateSeed[] = [
  {
    id: 'tpl-python',
    language: 'python',
    name: 'Python 3',
    description: 'Modern Python 3 with standard library demo, algorithms, and I/O.',
    icon: '🐍',
    default_filename: 'main.py',
    category: 'General Purpose',
    compiler_info: 'Python 3.10+ (Interpreted / CPython)',
    default_code: `# CollabCode Python Environment
import sys
import time

def fibonacci(n: int) -> list[int]:
    """Generates the first n Fibonacci numbers."""
    series = [0, 1]
    while len(series) < n:
        series.append(series[-1] + series[-2])
    return series[:n]

def main():
    print(f"🐍 Python Version: {sys.version.split()[0]}")
    print("Welcome to CollabCode Online IDE!")
    print("-" * 40)
    
    # Demonstration of computation
    count = 10
    fibs = fibonacci(count)
    print(f"First {count} Fibonacci numbers: {fibs}")
    
    # Process user input or demo data
    print("-" * 40)
    print("Tip: Ask AI Assistant to explain, optimize, or test this code.")

if __name__ == "__main__":
    main()
`
  },
  {
    id: 'tpl-javascript',
    language: 'javascript',
    name: 'JavaScript (Node.js)',
    description: 'Modern ES2022+ asynchronous JavaScript on Node.js.',
    icon: '⚡',
    default_filename: 'index.js',
    category: 'Web & Scripting',
    compiler_info: 'Node.js v20+ / V8 Engine',
    default_code: `// CollabCode JavaScript Environment
console.log("⚡ Running Node.js " + process.version);
console.log("----------------------------------------");

class TaskQueue {
  constructor() {
    this.tasks = [];
  }

  add(name, delay) {
    this.tasks.push(
      () => new Promise(res => {
        setTimeout(() => {
          console.log(\`[DONE] \${name} after \${delay}ms\`);
          res(name);
        }, delay);
      })
    );
  }

  async runAll() {
    for (const task of this.tasks) {
      await task();
    }
  }
}

async function main() {
  const queue = new TaskQueue();
  queue.add("Parsing AST", 100);
  queue.add("Running Test Cases", 150);
  queue.add("Deployment Check", 50);

  console.log("Executing async workflow:");
  await queue.runAll();
  console.log("----------------------------------------");
  console.log("Execution finished successfully!");
}

main();
`
  },
  {
    id: 'tpl-typescript',
    language: 'typescript',
    name: 'TypeScript',
    description: 'Strictly-typed JavaScript with interfaces, generics, and compile checks.',
    icon: '📘',
    default_filename: 'main.ts',
    category: 'Web & Systems',
    compiler_info: 'TypeScript 5.x / ts-node',
    default_code: `// CollabCode TypeScript Environment
interface User {
  id: string;
  username: string;
  role: 'admin' | 'developer' | 'viewer';
  skills: string[];
}

function summarizeUser(user: User): string {
  return \`User: \${user.username} [\${user.role.toUpperCase()}] | Skills: \${user.skills.join(', ')}\`;
}

const developer: User = {
  id: "usr_101",
  username: "AdaLovelace",
  role: "developer",
  skills: ["TypeScript", "Rust", "Distributed Systems"]
};

console.log("📘 TypeScript Strict Runtime");
console.log("----------------------------------------");
console.log(summarizeUser(developer));
console.log("----------------------------------------");
console.log("Tip: Use the AI Assistant to convert or refactor types!");
`
  },
  {
    id: 'tpl-c',
    language: 'c',
    name: 'C (GCC)',
    description: 'ISO C11 high-performance systems programming.',
    icon: '⚙️',
    default_filename: 'main.c',
    category: 'Systems',
    compiler_info: 'GCC 11.2+ (-O2 -Wall)',
    default_code: `#include <stdio.h>
#include <stdlib.h>

void print_binary(unsigned int n) {
    for (int i = 31; i >= 0; i--) {
        int k = n >> i;
        if (k & 1)
            printf("1");
        else
            printf("0");
        if (i % 8 == 0 && i > 0) printf(" ");
    }
    printf("\\n");
}

int main(void) {
    printf("⚙️  CollabCode C Environment (GCC)\\n");
    printf("----------------------------------------\\n");
    
    unsigned int number = 42;
    printf("Decimal: %u\\n", number);
    printf("Binary:  ");
    print_binary(number);
    
    printf("----------------------------------------\\n");
    printf("Memory allocated and verified successfully.\\n");
    return 0;
}
`
  },
  {
    id: 'tpl-cpp',
    language: 'cpp',
    name: 'C++ (G++)',
    description: 'Modern C++20 with STL, smart pointers, and templates.',
    icon: '🚀',
    default_filename: 'main.cpp',
    category: 'Systems',
    compiler_info: 'G++ 11.2+ (std=c++20)',
    default_code: `#include <iostream>
#include <vector>
#include <numeric>
#include <algorithm>
#include <string>

int main() {
    std::cout << "🚀 CollabCode C++20 Workspace\\n";
    std::cout << "----------------------------------------\\n";

    std::vector<int> numbers = {12, 45, 7, 89, 23, 67, 34};
    std::cout << "Original vector: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\\n";

    std::sort(numbers.begin(), numbers.end());
    std::cout << "Sorted vector:   ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << "\\n";

    long long sum = std::accumulate(numbers.begin(), numbers.end(), 0LL);
    std::cout << "Sum: " << sum << " | Average: " << static_cast<double>(sum) / numbers.size() << "\\n";
    std::cout << "----------------------------------------\\n";
    return 0;
}
`
  },
  {
    id: 'tpl-java',
    language: 'java',
    name: 'Java (OpenJDK)',
    description: 'Enterprise Java 17+ with object-oriented abstractions and streams.',
    icon: '☕',
    default_filename: 'Main.java',
    category: 'General Purpose',
    compiler_info: 'OpenJDK 17 / JVM',
    default_code: `import java.util.*;
import java.util.stream.Collectors;

public class Main {
    static record Employee(String name, String department, double salary) {}

    public static void main(String[] args) {
        System.out.println("☕ CollabCode Java 17 Runtime");
        System.out.println("----------------------------------------");

        List<Employee> staff = List.of(
            new Employee("Alice", "Engineering", 125000),
            new Employee("Bob", "Product", 105000),
            new Employee("Carol", "Engineering", 140000),
            new Employee("David", "Design", 95000)
        );

        double avgEngineeringSalary = staff.stream()
            .filter(e -> "Engineering".equals(e.department()))
            .mapToDouble(Employee::salary)
            .average()
            .orElse(0.0);

        System.out.println("Staff Directory count: " + staff.size());
        System.out.printf("Engineering Average Salary: $%,.2f%n", avgEngineeringSalary);
        System.out.println("----------------------------------------");
    }
}
`
  },
  {
    id: 'tpl-go',
    language: 'go',
    name: 'Go (Golang)',
    description: 'Concurrent, clean, compiled systems language by Google.',
    icon: '🐹',
    default_filename: 'main.go',
    category: 'Cloud & Systems',
    compiler_info: 'Go 1.21+ Compiler',
    default_code: `package main

import (
	"fmt"
	"sync"
	"time"
)

func worker(id int, jobs <-chan int, results chan<- int, wg *sync.WaitGroup) {
	defer wg.Done()
	for j := range jobs {
		time.Sleep(10 * time.Millisecond)
		results <- j * j
	}
}

func main() {
	fmt.Println("🐹 CollabCode Go Concurrency Demo")
	fmt.Println("----------------------------------------")

	const numJobs = 5
	jobs := make(chan int, numJobs)
	results := make(chan int, numJobs)
	var wg sync.WaitGroup

	for w := 1; w <= 3; w++ {
		wg.Add(1)
		go worker(w, jobs, results, &wg)
	}

	for j := 1; j <= numJobs; j++ {
		jobs <- j
	}
	close(jobs)

	wg.Wait()
	close(results)

	fmt.Println("Computed square results from worker pool:")
	for r := range results {
		fmt.Printf(" -> %d\\n", r)
	}
	fmt.Println("----------------------------------------")
}
`
  },
  {
    id: 'tpl-rust',
    language: 'rust',
    name: 'Rust',
    description: 'Memory-safe systems programming without garbage collection.',
    icon: '🦀',
    default_filename: 'main.rs',
    category: 'Systems',
    compiler_info: 'rustc 1.75+ (Cargo/LLVM)',
    default_code: `// CollabCode Rust Playground
#[derive(Debug)]
struct Matrix2x2 {
    a: f64,
    b: f64,
    c: f64,
    d: f64,
}

impl Matrix2x2 {
    fn determinant(&self) -> f64 {
        self.a * self.d - self.b * self.c
    }

    fn is_invertible(&self) -> bool {
        self.determinant().abs() > 1e-9
    }
}

fn main() {
    println!("🦀 CollabCode Rust Safe Runtime");
    println!("----------------------------------------");

    let m = Matrix2x2 { a: 4.0, b: 7.0, c: 2.0, d: 6.0 };
    println!("Matrix: {:?}", m);
    println!("Determinant: {:.2}", m.determinant());
    println!("Invertible:  {}", m.is_invertible());

    println!("----------------------------------------");
    println!("Memory safety guaranteed at compile time.");
}
`
  },
  {
    id: 'tpl-csharp',
    language: 'csharp',
    name: 'C# (.NET)',
    description: 'Modern C# 10+ with LINQ, async/await, and pattern matching.',
    icon: '🔷',
    default_filename: 'Program.cs',
    category: 'General Purpose',
    compiler_info: '.NET SDK 7.0+ / Mono',
    default_code: `using System;
using System.Linq;
using System.Collections.Generic;

public class Program
{
    public static void Main()
    {
        Console.WriteLine("🔷 CollabCode C# .NET Runtime");
        Console.WriteLine("----------------------------------------");

        var numbers = new List<int> { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        var evensSquared = numbers
            .Where(n => n % 2 == 0)
            .Select(n => n * n)
            .ToList();

        Console.WriteLine("Even numbers squared: " + string.Join(", ", evensSquared));
        Console.WriteLine("Sum of squares: " + evensSquared.Sum());
        Console.WriteLine("----------------------------------------");
    }
}
`
  },
  {
    id: 'tpl-php',
    language: 'php',
    name: 'PHP 8',
    description: 'Modern PHP 8+ with typed properties, match expressions, and attributes.',
    icon: '🐘',
    default_filename: 'index.php',
    category: 'Web',
    compiler_info: 'PHP 8.2+ CLI Engine',
    default_code: `<?php
echo "🐘 CollabCode PHP 8.x Runtime\\n";
echo "----------------------------------------\\n";

enum Status: string {
    case Draft = 'draft';
    case Published = 'published';
    case Archived = 'archived';
}

class Article {
    public function __construct(
        public string $title,
        public Status $status,
        public int $views = 0
    ) {}

    public function summary(): string {
        return match($this->status) {
            Status::Draft => "Draft: {$this->title} (Under review)",
            Status::Published => "Published: {$this->title} with {$this->views} views",
            Status::Archived => "Archived: {$this->title}",
        };
    }
}

$post = new Article("Building Real-time AI IDEs", Status::Published, 1420);
echo $post->summary() . "\\n";
echo "----------------------------------------\\n";
`
  },
  {
    id: 'tpl-kotlin',
    language: 'kotlin',
    name: 'Kotlin',
    description: 'Concise, null-safe language for modern cross-platform development.',
    icon: '🎯',
    default_filename: 'Main.kt',
    category: 'General Purpose',
    compiler_info: 'Kotlin 1.9+ / JVM',
    default_code: `fun main() {
    println("🎯 CollabCode Kotlin Runtime")
    println("----------------------------------------")

    val greetings = listOf("Hello", "Bonjour", "Hola", "Ciao", "Namaste")
    val upperMap = greetings
        .filter { it.length > 4 }
        .associateWith { it.uppercase() }

    upperMap.forEach { (orig, upper) ->
        println("-> $orig => $upper")
    }
    println("----------------------------------------")
}
`
  },
  {
    id: 'tpl-swift',
    language: 'swift',
    name: 'Swift',
    description: 'Safe, fast, and modern general-purpose language.',
    icon: '🦅',
    default_filename: 'main.swift',
    category: 'Apple & Server',
    compiler_info: 'Swift 5.9+ Compiler',
    default_code: `import Foundation

print("🦅 CollabCode Swift Environment")
print("----------------------------------------")

struct Vector2D {
    var x: Double
    var y: Double

    var magnitude: Double {
        return (x * x + y * y).squareRoot()
    }
}

let vec = Vector2D(x: 3.0, y: 4.0)
print("Vector: (\(vec.x), \(vec.y))")
print("Magnitude: \(vec.magnitude)")
print("----------------------------------------")
`
  },
  {
    id: 'tpl-sql',
    language: 'sql',
    name: 'SQL (SQLite)',
    description: 'Relational database schema, indexing, and complex queries.',
    icon: '🗄️',
    default_filename: 'query.sql',
    category: 'Database',
    compiler_info: 'SQLite 3.40+ Engine',
    default_code: `-- CollabCode SQL Interactive Playground
CREATE TABLE students (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    gpa REAL NOT NULL
);

INSERT INTO students (name, department, gpa) VALUES
    ('Alice Chen', 'Computer Science', 3.92),
    ('David Kim', 'Mathematics', 3.75),
    ('Elena Rostova', 'Computer Science', 3.88),
    ('Marcus Brody', 'Physics', 3.60);

-- Query Honor Roll Students
SELECT 
    department, 
    COUNT(*) as student_count, 
    ROUND(AVG(gpa), 2) as avg_gpa
FROM students
WHERE gpa >= 3.7
GROUP BY department
ORDER BY avg_gpa DESC;
`
  },
  {
    id: 'tpl-bash',
    language: 'bash',
    name: 'Bash Shell',
    description: 'UNIX shell scripting, automation, and command-line pipelines.',
    icon: '💻',
    default_filename: 'script.sh',
    category: 'Scripting',
    compiler_info: 'GNU Bash 5.1+',
    default_code: `#!/usr/bin/env bash
# CollabCode Bash Environment
echo "💻 CollabCode Shell Execution"
echo "----------------------------------------"

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
echo "System Time: $TIMESTAMP"
echo "Working Dir: $(pwd)"
echo "User:        $USER"

# Demo loop
echo "Pipeline processing:"
for i in {1..3}; do
  echo "  Step $i: Task completed"
done

echo "----------------------------------------"
echo "Shell script finished with code 0."
`
  },
  {
    id: 'tpl-html',
    language: 'html',
    name: 'HTML5',
    description: 'Semantic HTML markup structure with preview support.',
    icon: '🌐',
    default_filename: 'index.html',
    category: 'Web',
    compiler_info: 'HTML5 / W3C Compliant DOM',
    default_code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>CollabCode Web Playground</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 2rem; }
    .card { background: #1e293b; padding: 1.5rem; border-radius: 8px; border: 1px solid #334155; }
    h1 { color: #38bdf8; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌐 Modern Web Playground</h1>
    <p>Welcome to CollabCode HTML preview mode.</p>
    <button onclick="alert('Interactive HTML5!')">Click Me</button>
  </div>
</body>
</html>
`
  },
  {
    id: 'tpl-css',
    language: 'css',
    name: 'CSS3',
    description: 'Modern styling with CSS variables, Flexbox, and CSS Grid.',
    icon: '🎨',
    default_filename: 'styles.css',
    category: 'Web',
    compiler_info: 'CSS3 Standards',
    default_code: `/* CollabCode Modern CSS Stylesheet */
:root {
  --primary-color: #3b82f6;
  --bg-dark: #0f172a;
  --surface: #1e293b;
  --text-main: #f8fafc;
  --radius: 12px;
}

body {
  margin: 0;
  display: grid;
  place-items: center;
  min-height: 100vh;
  background-color: var(--bg-dark);
  color: var(--text-main);
  font-family: 'Inter', sans-serif;
}

.glow-card {
  background: var(--surface);
  border-radius: var(--radius);
  padding: 2.5rem;
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
`
  }
];
