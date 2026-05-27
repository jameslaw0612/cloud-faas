        const runnerNavButton = document.getElementById("runnerNavButton");
        const tutorialsNavButton = document.getElementById("tutorialsNavButton");
        const examplesNavButton = document.getElementById("examplesNavButton");
        const runnerView = document.getElementById("runnerView");
        const tutorialsView = document.getElementById("tutorialsView");
        const codeModeButton = document.getElementById("codeModeButton");
        const uploadModeButton = document.getElementById("uploadModeButton");
        const codeSection = document.getElementById("codeSection");
        const uploadSection = document.getElementById("uploadSection");
        const form = document.getElementById("faasForm");
        const runButton = document.getElementById("runButton");
        const resultOutput = document.getElementById("resultOutput");
        const statusBadge = document.getElementById("statusBadge");
        const historyList = document.getElementById("historyList");
        const languageSelect = document.getElementById("language");
        const codeInput = document.getElementById("codeInput");
        const fileInput = document.getElementById("fileInput");
        const inputFileInput = document.getElementById("inputFileInput");
        const deliveryModeSelect = document.getElementById("deliveryMode");
        const interactiveSection = document.getElementById("interactiveSection");
        const interactiveTitle = document.getElementById("interactiveTitle");
        const interactiveDescription = document.getElementById("interactiveDescription");
        const interactiveHint = document.getElementById("interactiveHint");
        const interactiveStopButton = document.getElementById("interactiveStopButton");
        const interactiveSendButton = document.getElementById("interactiveSendButton");
        const interactiveInput = document.getElementById("interactiveInput");
        const downloadSection = document.getElementById("downloadSection");
        const downloadFilename = document.getElementById("downloadFilename");
        const downloadMeta = document.getElementById("downloadMeta");
        const downloadPreview = document.getElementById("downloadPreview");
        const downloadPreviewImage = document.getElementById("downloadPreviewImage");
        const downloadLink = document.getElementById("downloadLink");
        const downloadOpenLink = document.getElementById("downloadOpenLink");
        const languageList = document.getElementById("languageList");
        const topicList = document.getElementById("topicList");
        const referenceList = document.getElementById("referenceList");
        const tutorialSearchInput = document.getElementById("tutorialSearchInput");
        const tutorialBackButton = document.getElementById("tutorialBackButton");
        const learningEyebrow = document.getElementById("learningEyebrow");
        const learningHeading = document.getElementById("learningHeading");
        const learningDescription = document.getElementById("learningDescription");
        const libraryListTitle = document.getElementById("libraryListTitle");
        const libraryListDescription = document.getElementById("libraryListDescription");
        const referenceTitle = document.getElementById("referenceTitle");
        const referenceDescription = document.getElementById("referenceDescription");

        let mode = "code";
        let interactiveSessionId = null;
        let interactivePollHandle = null;
        let currentView = "runner";
        let learningMode = "tutorials";
        let activeTutorialLanguage = "python";
        let activeTutorialId = "python-loops";

        const languageLabels = {
            python: "Python",
            javascript: "JavaScript",
            c: "C",
            cpp: "C++",
            java: "Java",
            php: "PHP",
        };

        const deliveryModeLabels = {
            inline: "Inline Result",
            "json-download": "JSON + Download Link",
            "direct-download": "Direct File Download",
        };

        const runnerTemplates = {
            python: 'print("Hello from Cloud FaaS")',
            javascript: 'console.log("Hello from Cloud FaaS");',
            c: `#include <stdio.h>

int main(void) {
    printf("Hello from Cloud FaaS\\n");
    return 0;
}`,
            cpp: `#include <iostream>

int main() {
    std::cout << "Hello from Cloud FaaS" << std::endl;
    return 0;
}`,
            java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Cloud FaaS");
    }
}`,
            php: `<?php
echo "Hello from Cloud FaaS\\n";`,
        };

        const tutorials = {
            python: { name: "Python", references: [
                { title: "Built-in Functions", description: "Quick look at tools like print(), len(), range(), and input()." },
                { title: "List Methods", description: "Remember append(), pop(), sort(), and slice-friendly patterns." },
                { title: "Dictionary Methods", description: "Use get(), keys(), values(), and items() when working with mappings." },
                { title: "String Methods", description: "Review upper(), lower(), strip(), split(), and replace()." },
            ], topics: [
                { id: "python-getting-started", title: "Getting Started with Python", description: "Python reads almost like plain English, which makes it a good first language for automation and small services.", syntax: 'print("Hello")', code: 'print("Hello from Cloud FaaS")', output: "Hello from Cloud FaaS", language: "python" },
                { id: "python-variables", title: "Python Variables and Data Types", description: "Python variables do not need type declarations. The value you assign decides the type at runtime.", syntax: 'name = "Ava"\\nage = 21\\nis_ready = True'.replaceAll("\\n", "\n"), code: 'name = "Ava"\\nage = 21\\nis_ready = True\\nprint(name)\\nprint(age)\\nprint(is_ready)'.replaceAll("\\n", "\n"), output: "Ava\n21\nTrue", language: "python" },
                { id: "python-if", title: "Python if Statement", description: "Use if, elif, and else blocks to make decisions. Indentation is part of the syntax.", syntax: 'if score >= 50:\\n    print("Pass")\\nelse:\\n    print("Retry")'.replaceAll("\\n", "\n"), code: 'score = 72\\n\\nif score >= 50:\\n    print("Pass")\\nelse:\\n    print("Retry")'.replaceAll("\\n", "\n"), output: "Pass", language: "python" },
                { id: "python-loops", title: "Python Loops", description: "A for loop with range() is a common way to repeat a block of code a known number of times.", syntax: "for item in sequence:\n    # do work", code: "for i in range(1, 11):\n    print(i)", output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", language: "python" },
                { id: "python-lists", title: "Python Lists", description: "Lists store ordered values and let you add, remove, and update items easily.", syntax: 'items = ["apple", "banana"]\\nitems.append("pear")'.replaceAll("\\n", "\n"), code: 'items = ["apple", "banana"]\\nitems.append("pear")\\nprint(items)'.replaceAll("\\n", "\n"), output: "['apple', 'banana', 'pear']", language: "python" },
                { id: "python-functions", title: "Python Functions", description: "Functions group reusable logic. You define them with def and call them by name.", syntax: 'def greet(name):\\n    return f"Hello, {name}"'.replaceAll("\\n", "\n"), code: 'def greet(name):\\n    return f"Hello, {name}"\\n\\nprint(greet("Cloud FaaS"))'.replaceAll("\\n", "\n"), output: "Hello, Cloud FaaS", language: "python" },
            ]},
            javascript: { name: "JavaScript", references: [
                { title: "Array Methods", description: "Keep push(), map(), filter(), find(), and join() close while building examples." },
                { title: "String Methods", description: "Use trim(), split(), includes(), slice(), and toUpperCase() for text handling." },
                { title: "Math", description: "Reach for Math.sqrt(), Math.floor(), Math.max(), and Math.random() for calculations." },
                { title: "Console and Input", description: "Use console.log() for output and readline for interactive terminal input." },
            ], topics: [
                { id: "javascript-hello-world", title: "JavaScript Hello World Program", description: "JavaScript on Node.js prints output with console.log, which is the most common beginner starting point.", syntax: 'console.log("Hello");', code: 'console.log("Hello from Cloud FaaS");', output: "Hello from Cloud FaaS", language: "javascript" },
                { id: "javascript-variables", title: "JavaScript Variables and Data Types", description: "Use let or const to store values, and JavaScript will infer the type from what you assign.", syntax: 'const name = "Ava";\nlet age = 21;\nconst ready = true;', code: 'const name = "Ava";\nlet age = 21;\nconst ready = true;\n\nconsole.log(name);\nconsole.log(age);\nconsole.log(ready);', output: "Ava\n21\ntrue", language: "javascript" },
                { id: "javascript-if", title: "JavaScript if Statement", description: "if and else blocks let you branch your logic based on a condition.", syntax: 'if (score >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Retry");\n}', code: 'const score = 72;\n\nif (score >= 50) {\n  console.log("Pass");\n} else {\n  console.log("Retry");\n}', output: "Pass", language: "javascript" },
                { id: "javascript-loops", title: "JavaScript Loops", description: "A for loop is one of the easiest ways to repeat work when you know how many steps you need.", syntax: "for (let i = 0; i < count; i++) {\n  // work\n}", code: "for (let i = 1; i <= 10; i++) {\n  console.log(i);\n}", output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", language: "javascript" },
                { id: "javascript-arrays", title: "JavaScript Arrays", description: "Arrays store ordered values and work well with methods like push and for...of loops.", syntax: 'const items = ["apple", "banana"];\nitems.push("pear");', code: 'const items = ["apple", "banana"];\nitems.push("pear");\n\nconsole.log(items.join(", "));', output: "apple, banana, pear", language: "javascript" },
                { id: "javascript-functions", title: "JavaScript Functions", description: "Functions group reusable logic and can return values back to the caller.", syntax: "function greet(name) {\n  return `Hello, ${name}`;\n}", code: 'function greet(name) {\n  return `Hello, ${name}`;\n}\n\nconsole.log(greet("Cloud FaaS"));', output: "Hello, Cloud FaaS", language: "javascript" },
            ]},
            c: { name: "C", references: [
                { title: "stdio.h", description: "This header gives you input and output helpers like printf() and scanf()." },
                { title: "scanf and printf", description: "Use these for console input and formatted output." },
                { title: "Arrays", description: "Review fixed-size indexed storage for repeated values." },
                { title: "Functions", description: "Split larger programs into named, reusable blocks of logic." },
            ], topics: [
                { id: "c-hello-world", title: "C Hello World Program", description: "C programs usually start in main(), and output commonly uses printf from stdio.h.", syntax: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello\\n");\n    return 0;\n}', code: '#include <stdio.h>\n\nint main(void) {\n    printf("Hello from Cloud FaaS\\n");\n    return 0;\n}', output: "Hello from Cloud FaaS", language: "c" },
                { id: "c-variables", title: "C Variables and Data Types", description: "C uses explicit types such as int, float, and char for memory-efficient variables.", syntax: "int age = 21;\nfloat score = 91.5f;\nchar grade = 'A';", code: '#include <stdio.h>\n\nint main(void) {\n    int age = 21;\n    float score = 91.5f;\n    char grade = \'A\';\n\n    printf("%d\\n", age);\n    printf("%.1f\\n", score);\n    printf("%c\\n", grade);\n    return 0;\n}', output: "21\n91.5\nA", language: "c" },
                { id: "c-if", title: "C if Statement", description: "if and else let you choose code paths based on a condition.", syntax: 'if (score >= 50) {\n    printf("Pass\\n");\n} else {\n    printf("Retry\\n");\n}', code: '#include <stdio.h>\n\nint main(void) {\n    int score = 72;\n\n    if (score >= 50) {\n        printf("Pass\\n");\n    } else {\n        printf("Retry\\n");\n    }\n\n    return 0;\n}', output: "Pass", language: "c" },
                { id: "c-loops", title: "C Loops", description: "for loops are useful when you want exact control over counting and repetition.", syntax: "for (int i = 0; i < count; i++) {\n    // work\n}", code: '#include <stdio.h>\n\nint main(void) {\n    for (int i = 1; i <= 10; i++) {\n        printf("%d\\n", i);\n    }\n\n    return 0;\n}', output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", language: "c" },
                { id: "c-arrays", title: "C Arrays", description: "Arrays store multiple values of the same type in contiguous memory.", syntax: "int numbers[3] = {1, 2, 3};", code: '#include <stdio.h>\n\nint main(void) {\n    int numbers[3] = {1, 2, 3};\n\n    for (int i = 0; i < 3; i++) {\n        printf("%d\\n", numbers[i]);\n    }\n\n    return 0;\n}', output: "1\n2\n3", language: "c" },
                { id: "c-functions", title: "C Functions", description: "Functions help organize code by letting you call reusable logic from different places.", syntax: "int add(int a, int b) {\n    return a + b;\n}", code: '#include <stdio.h>\n\nint add(int a, int b) {\n    return a + b;\n}\n\nint main(void) {\n    printf("%d\\n", add(4, 5));\n    return 0;\n}', output: "9", language: "c" },
            ]},
            cpp: { name: "C++", references: [
                { title: "iostream", description: "Use cout and cin for standard console output and input." },
                { title: "string", description: "A safer text type than raw character arrays for many tasks." },
                { title: "vector", description: "A dynamic array type from the standard library." },
                { title: "class", description: "Classes group related data and behavior into one type." },
            ], topics: [
                { id: "cpp-hello-world", title: "C++ Hello World Program", description: "C++ commonly uses iostream and cout for output while still starting execution in main().", syntax: '#include <iostream>\n\nint main() {\n    std::cout << "Hello" << std::endl;\n    return 0;\n}', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello from Cloud FaaS" << endl;\n    return 0;\n}', output: "Hello from Cloud FaaS", language: "cpp" },
                { id: "cpp-variables", title: "C++ Variables and Data Types", description: "C++ keeps strong types like int, double, and string while adding rich standard library types.", syntax: 'int age = 21;\ndouble score = 91.5;\nstring name = "Ava";', code: '#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    int age = 21;\n    double score = 91.5;\n    string name = "Ava";\n\n    cout << name << endl;\n    cout << age << endl;\n    cout << score << endl;\n    return 0;\n}', output: "Ava\n21\n91.5", language: "cpp" },
                { id: "cpp-if", title: "C++ if Statement", description: "if statements in C++ look similar to C, but they can work with richer C++ types too.", syntax: 'if (score >= 50) {\n    cout << "Pass" << endl;\n} else {\n    cout << "Retry" << endl;\n}', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int score = 72;\n\n    if (score >= 50) {\n        cout << "Pass" << endl;\n    } else {\n        cout << "Retry" << endl;\n    }\n\n    return 0;\n}', output: "Pass", language: "cpp" },
                { id: "cpp-loops", title: "C++ Loops", description: "for loops make repeated work concise and readable in C++ programs.", syntax: "for (int i = 0; i < count; i++) {\n    // work\n}", code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    for (int i = 1; i <= 10; i++) {\n        cout << i << endl;\n    }\n\n    return 0;\n}', output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", language: "cpp" },
                { id: "cpp-arrays", title: "C++ Arrays", description: "You can start with built-in arrays, then move to vector when you need dynamic sizing.", syntax: "int numbers[3] = {1, 2, 3};", code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int numbers[3] = {1, 2, 3};\n\n    for (int i = 0; i < 3; i++) {\n        cout << numbers[i] << endl;\n    }\n\n    return 0;\n}', output: "1\n2\n3", language: "cpp" },
                { id: "cpp-functions-classes", title: "C++ Functions and Basic Classes", description: "C++ builds on functions with classes, which let you bundle data and behavior together.", syntax: "class Greeter {\npublic:\n    void sayHello();\n};", code: '#include <iostream>\nusing namespace std;\n\nclass Greeter {\npublic:\n    void sayHello() {\n        cout << "Hello from Cloud FaaS" << endl;\n    }\n};\n\nint main() {\n    Greeter greeter;\n    greeter.sayHello();\n    return 0;\n}', output: "Hello from Cloud FaaS", language: "cpp" },
            ]},
            java: { name: "Java", references: [
                { title: "String", description: "A core class for working with text, concatenation, and string methods." },
                { title: "ArrayList", description: "A resizable list type from the collections framework." },
                { title: "HashMap", description: "Use key-value storage when you need fast lookups." },
                { title: "Math", description: "Helpful numeric utilities such as max(), min(), sqrt(), and random()." },
            ], topics: [
                { id: "java-hello-world", title: "Java Hello World Program", description: "Java programs start inside a class, and the main method is the usual entry point.", syntax: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello");\n    }\n}', code: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from Cloud FaaS");\n    }\n}', output: "Hello from Cloud FaaS", language: "java" },
                { id: "java-variables", title: "Java Variables and Data Types", description: "Java uses explicit types, so every variable is declared with a data type before use.", syntax: 'int age = 21;\nString name = "Ava";\nboolean ready = true;', code: 'public class Main {\n    public static void main(String[] args) {\n        int age = 21;\n        String name = "Ava";\n        boolean ready = true;\n\n        System.out.println(name);\n        System.out.println(age);\n        System.out.println(ready);\n    }\n}', output: "Ava\n21\ntrue", language: "java" },
                { id: "java-if", title: "Java if Statement", description: "if statements let you branch based on true or false conditions.", syntax: 'if (score >= 50) {\n    System.out.println("Pass");\n} else {\n    System.out.println("Retry");\n}', code: 'public class Main {\n    public static void main(String[] args) {\n        int score = 72;\n\n        if (score >= 50) {\n            System.out.println("Pass");\n        } else {\n            System.out.println("Retry");\n        }\n    }\n}', output: "Pass", language: "java" },
                { id: "java-loop", title: "Java for Loop", description: "The for loop is great when you know the starting point, stopping point, and step.", syntax: "for (int i = 0; i < count; i++) {\n    // work\n}", code: 'public class Main {\n    public static void main(String[] args) {\n        for (int i = 1; i <= 10; i++) {\n            System.out.println(i);\n        }\n    }\n}', output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", language: "java" },
                { id: "java-arrays", title: "Java Arrays", description: "Arrays store fixed-size groups of values of the same type.", syntax: "int[] numbers = {1, 2, 3};", code: 'public class Main {\n    public static void main(String[] args) {\n        int[] numbers = {1, 2, 3};\n\n        for (int number : numbers) {\n            System.out.println(number);\n        }\n    }\n}', output: "1\n2\n3", language: "java" },
                { id: "java-methods", title: "Java Methods", description: "Methods define reusable behavior inside a class and can return values back to the caller.", syntax: "static int add(int a, int b) {\n    return a + b;\n}", code: 'public class Main {\n    static int add(int a, int b) {\n        return a + b;\n    }\n\n    public static void main(String[] args) {\n        System.out.println(add(4, 5));\n    }\n}', output: "9", language: "java" },
            ]},
            php: { name: "PHP", references: [
                { title: "echo and print", description: "The fastest way to send output to the browser or console." },
                { title: "Arrays", description: "PHP arrays can behave like ordered lists or associative maps." },
                { title: "String Functions", description: "Keep trim(), strlen(), explode(), and strtoupper() close by." },
                { title: "Form Handling", description: "Understand GET, POST, and server-side validation basics." },
            ], topics: [
                { id: "php-hello-world", title: "PHP Hello World Program", description: "PHP code usually starts with an opening tag and uses echo or print for output.", syntax: '<?php\necho "Hello";\n?>', code: '<?php\necho "Hello from Cloud FaaS\\n";\n?>', output: "Hello from Cloud FaaS", language: "php" },
                { id: "php-variables", title: "PHP Variables and Data Types", description: "PHP variables start with $, and the engine determines the type from the assigned value.", syntax: '$name = "Ava";\n$age = 21;\n$isReady = true;', code: '<?php\n$name = "Ava";\n$age = 21;\n$isReady = true;\n\necho $name . PHP_EOL;\necho $age . PHP_EOL;\necho ($isReady ? "true" : "false") . PHP_EOL;\n?>', output: "Ava\n21\ntrue", language: "php" },
                { id: "php-if", title: "PHP if Statement", description: "if statements help you run different code depending on a condition.", syntax: 'if ($score >= 50) {\n    echo "Pass";\n} else {\n    echo "Retry";\n}', code: '<?php\n$score = 72;\n\nif ($score >= 50) {\n    echo "Pass" . PHP_EOL;\n} else {\n    echo "Retry" . PHP_EOL;\n}\n?>', output: "Pass", language: "php" },
                { id: "php-loops", title: "PHP Loops", description: "A for loop is a simple way to repeat a block of code for a known number of steps.", syntax: "for ($i = 0; $i < $count; $i++) {\n    // work\n}", code: '<?php\nfor ($i = 1; $i <= 10; $i++) {\n    echo $i . PHP_EOL;\n}\n?>', output: "1\n2\n3\n4\n5\n6\n7\n8\n9\n10", language: "php" },
                { id: "php-arrays", title: "PHP Arrays", description: "PHP arrays are flexible and can hold ordered values or key-value pairs.", syntax: '$items = ["apple", "banana"];', code: '<?php\n$items = ["apple", "banana", "pear"];\n\nforeach ($items as $item) {\n    echo $item . PHP_EOL;\n}\n?>', output: "apple\nbanana\npear", language: "php" },
                { id: "php-functions", title: "PHP Functions", description: "Functions wrap reusable logic and can return a value with return.", syntax: 'function greet($name) {\n    return "Hello, $name";\n}', code: '<?php\nfunction greet($name) {\n    return "Hello, $name";\n}\n\necho greet("Cloud FaaS") . PHP_EOL;\n?>', output: "Hello, Cloud FaaS", language: "php" },
            ]},
        };

        const examples = {
            python: { name: "Python", references: [
                { title: "Practice Focus", description: "Conditionals, loops, math, and simple pattern printing." },
                { title: "Helpful Tools", description: "Use input(), int(), math.sqrt(), range(), and print()." },
                { title: "Common Pitfall", description: "Remember to convert user input from text with int() or float()." },
                { title: "Run Tip", description: "Examples that use input() can be continued with the interactive input box." },
            ], items: [
                { id: "python-odd-even", title: "Check odd/even number", description: "Read a number and use the remainder operator to decide whether it is even or odd.", syntax: 'if number % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")', code: 'number = int(input("Enter a number: "))\n\nif number % 2 == 0:\n    print("Even")\nelse:\n    print("Odd")', output: "Enter a number: 7\nOdd", language: "python" },
                { id: "python-quadratic", title: "Find roots of a quadratic equation", description: "Compute the discriminant first, then calculate the real roots when they exist.", syntax: "discriminant = b ** 2 - 4 * a * c", code: 'import math\n\na = 1\nb = -3\nc = 2\n\ndiscriminant = b ** 2 - 4 * a * c\nroot1 = (-b + math.sqrt(discriminant)) / (2 * a)\nroot2 = (-b - math.sqrt(discriminant)) / (2 * a)\n\nprint(root1)\nprint(root2)', output: "2.0\n1.0", language: "python" },
                { id: "python-patterns", title: "Print Pyramids and Patterns", description: "Nested loops help you print repeated shapes line by line.", syntax: 'for row in range(1, height + 1):\n    print("*" * row)', code: 'height = 5\n\nfor row in range(1, height + 1):\n    print("*" * row)', output: "*\n**\n***\n****\n*****", language: "python" },
                { id: "python-prime", title: "Check prime number", description: "Try dividing the number by every value from 2 up to its square root.", syntax: "for divisor in range(2, int(number ** 0.5) + 1):", code: 'number = 29\nis_prime = number > 1\n\nfor divisor in range(2, int(number ** 0.5) + 1):\n    if number % divisor == 0:\n        is_prime = False\n        break\n\nprint("Prime" if is_prime else "Not prime")', output: "Prime", language: "python" },
                { id: "python-fibonacci", title: "Print the Fibonacci series", description: "Keep track of the previous two values and update them each loop.", syntax: "a, b = 0, 1\nfor _ in range(count):", code: 'count = 7\na, b = 0, 1\n\nfor _ in range(count):\n    print(a)\n    a, b = b, a + b', output: "0\n1\n1\n2\n3\n5\n8", language: "python" },
                { id: "python-grayscale-image", title: "Turn an uploaded image into grayscale", description: "Upload an image file, let Pillow open it, convert it to grayscale, and return the transformed PNG back through Cloud FaaS.", syntax: 'gray_image = image.convert("L")', code: 'import base64\nimport io\nimport json\nfrom pathlib import Path\n\nfrom PIL import Image\n\nsupported_extensions = {".png", ".jpg", ".jpeg", ".bmp", ".gif", ".webp"}\ncurrent_dir = Path(".")\nimage_path = next(\n    (\n        path for path in current_dir.iterdir()\n        if path.is_file() and path.suffix.lower() in supported_extensions and path.name != "handler.py"\n    ),\n    None,\n)\n\nif image_path is None:\n    raise FileNotFoundError("Upload an image in the Optional input file field before running this example.")\n\nwith Image.open(image_path) as image:\n    grayscale_image = image.convert("L")\n    buffer = io.BytesIO()\n    grayscale_image.save(buffer, format="PNG")\n\npayload = {\n    "faas_download": {\n        "filename": f"{image_path.stem}-grayscale.png",\n        "content_type": "image/png",\n        "base64": base64.b64encode(buffer.getvalue()).decode("ascii"),\n        "output": f"Prepared {image_path.stem}-grayscale.png"\n    }\n}\n\nprint(json.dumps(payload))', output: "Prepared photo-grayscale.png", language: "python" },
            ]},
            javascript: { name: "JavaScript", references: [
                { title: "Practice Focus", description: "Conditionals, loops, math, arrays, and basic Node.js console input." },
                { title: "Helpful Tools", description: "Use Number(), Math.sqrt(), console.log(), and readline for interactive examples." },
                { title: "Common Pitfall", description: "Remember values from input start as strings until you convert them." },
                { title: "Run Tip", description: "Examples that use readline work with the shared interactive input panel." },
            ], items: [
                { id: "javascript-odd-even", title: "Check odd/even number", description: "Read a number from standard input and use remainder to decide even or odd.", syntax: 'if (number % 2 === 0) {\n  console.log("Even");\n} else {\n  console.log("Odd");\n}', code: 'const readline = require("readline");\nconst rl = readline.createInterface({ input: process.stdin, output: process.stdout });\n\nrl.question("Enter a number: ", (answer) => {\n  const number = Number(answer);\n\n  if (number % 2 === 0) {\n    console.log("Even");\n  } else {\n    console.log("Odd");\n  }\n\n  rl.close();\n});', output: "Enter a number: 7\nOdd", language: "javascript" },
                { id: "javascript-quadratic", title: "Find roots of a quadratic equation", description: "Use the discriminant and Math.sqrt to calculate the two real roots.", syntax: "const discriminant = b * b - 4 * a * c;", code: 'const a = 1;\nconst b = -3;\nconst c = 2;\n\nconst discriminant = b * b - 4 * a * c;\nconst root1 = (-b + Math.sqrt(discriminant)) / (2 * a);\nconst root2 = (-b - Math.sqrt(discriminant)) / (2 * a);\n\nconsole.log(root1);\nconsole.log(root2);', output: "2\n1", language: "javascript" },
                { id: "javascript-patterns", title: "Print Pyramids and Patterns", description: "A simple repeated-string pattern is a great way to practice loops in JavaScript.", syntax: "for (let row = 1; row <= height; row++) {", code: 'const height = 5;\n\nfor (let row = 1; row <= height; row++) {\n  console.log("*".repeat(row));\n}', output: "*\n**\n***\n****\n*****", language: "javascript" },
                { id: "javascript-prime", title: "Check prime number", description: "Test divisors up to the square root of the number, then print the result.", syntax: "for (let divisor = 2; divisor * divisor <= number; divisor++) {", code: 'const number = 29;\nlet isPrime = number > 1;\n\nfor (let divisor = 2; divisor * divisor <= number; divisor++) {\n  if (number % divisor === 0) {\n    isPrime = false;\n    break;\n  }\n}\n\nconsole.log(isPrime ? "Prime" : "Not prime");', output: "Prime", language: "javascript" },
                { id: "javascript-fibonacci", title: "Print the Fibonacci series", description: "Track the previous two numbers and update them after each printed term.", syntax: "let a = 0;\nlet b = 1;", code: 'const count = 7;\nlet a = 0;\nlet b = 1;\n\nfor (let i = 0; i < count; i++) {\n  console.log(a);\n  const next = a + b;\n  a = b;\n  b = next;\n}', output: "0\n1\n1\n2\n3\n5\n8", language: "javascript" },
            ]},
            c: { name: "C", references: [
                { title: "Practice Focus", description: "Build confidence with scanf, loops, math formulas, and printf." },
                { title: "Helpful Headers", description: "stdio.h handles input/output and math.h supports square roots." },
                { title: "Common Pitfall", description: "Use the correct format specifier like %d, %f, or %lf." },
                { title: "Run Tip", description: "Examples that use scanf can continue through the interactive input box." },
            ], items: [
                { id: "c-odd-even", title: "Check odd/even number", description: "Read an integer with scanf, then use remainder to check parity.", syntax: 'if (number % 2 == 0) {\n    printf("Even\\n");\n}', code: '#include <stdio.h>\n\nint main(void) {\n    int number;\n    scanf("%d", &number);\n\n    if (number % 2 == 0) {\n        printf("Even\\n");\n    } else {\n        printf("Odd\\n");\n    }\n\n    return 0;\n}', output: "7\nOdd", language: "c" },
                { id: "c-quadratic", title: "Find roots of a quadratic equation", description: "Compute the discriminant, then calculate both roots with sqrt from math.h.", syntax: "double discriminant = b * b - 4 * a * c;", code: '#include <stdio.h>\n#include <math.h>\n\nint main(void) {\n    double a = 1;\n    double b = -3;\n    double c = 2;\n    double discriminant = b * b - 4 * a * c;\n    double root1 = (-b + sqrt(discriminant)) / (2 * a);\n    double root2 = (-b - sqrt(discriminant)) / (2 * a);\n\n    printf("%.1f\\n", root1);\n    printf("%.1f\\n", root2);\n    return 0;\n}', output: "2.0\n1.0", language: "c" },
                { id: "c-patterns", title: "Print Pyramids and Patterns", description: "Use nested loops to print one extra star on each line.", syntax: "for (int row = 1; row <= height; row++) {", code: '#include <stdio.h>\n\nint main(void) {\n    int height = 5;\n\n    for (int row = 1; row <= height; row++) {\n        for (int col = 1; col <= row; col++) {\n            printf("*");\n        }\n        printf("\\n");\n    }\n\n    return 0;\n}', output: "*\n**\n***\n****\n*****", language: "c" },
                { id: "c-prime", title: "Check prime number", description: "Try every divisor up to the square root and stop once you find one that divides evenly.", syntax: "for (int divisor = 2; divisor * divisor <= number; divisor++) {", code: '#include <stdio.h>\n\nint main(void) {\n    int number = 29;\n    int isPrime = number > 1;\n\n    for (int divisor = 2; divisor * divisor <= number; divisor++) {\n        if (number % divisor == 0) {\n            isPrime = 0;\n            break;\n        }\n    }\n\n    printf("%s\\n", isPrime ? "Prime" : "Not prime");\n    return 0;\n}', output: "Prime", language: "c" },
                { id: "c-fibonacci", title: "Print the Fibonacci series", description: "Track the previous two values and update them each loop.", syntax: "int a = 0;\nint b = 1;", code: '#include <stdio.h>\n\nint main(void) {\n    int count = 7;\n    int a = 0;\n    int b = 1;\n\n    for (int i = 0; i < count; i++) {\n        printf("%d\\n", a);\n        int next = a + b;\n        a = b;\n        b = next;\n    }\n\n    return 0;\n}', output: "0\n1\n1\n2\n3\n5\n8", language: "c" },
            ]},
            cpp: { name: "C++", references: [
                { title: "Practice Focus", description: "Use cin, cout, loops, and small math-based programs." },
                { title: "Helpful Headers", description: "iostream for input/output and cmath for sqrt calculations." },
                { title: "Common Pitfall", description: "Remember to include the headers you use and return from main." },
                { title: "Run Tip", description: "Examples that use cin work with the same interactive input panel." },
            ], items: [
                { id: "cpp-odd-even", title: "Check odd/even number", description: "Read a number with cin and use remainder to decide whether it is odd or even.", syntax: 'if (number % 2 == 0) {\n    cout << "Even" << endl;\n}', code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int number;\n    cin >> number;\n\n    if (number % 2 == 0) {\n        cout << "Even" << endl;\n    } else {\n        cout << "Odd" << endl;\n    }\n\n    return 0;\n}', output: "7\nOdd", language: "cpp" },
                { id: "cpp-quadratic", title: "Find roots of a quadratic equation", description: "Use cmath and the quadratic formula to compute the two real roots.", syntax: "double discriminant = b * b - 4 * a * c;", code: '#include <cmath>\n#include <iostream>\nusing namespace std;\n\nint main() {\n    double a = 1;\n    double b = -3;\n    double c = 2;\n    double discriminant = b * b - 4 * a * c;\n    double root1 = (-b + sqrt(discriminant)) / (2 * a);\n    double root2 = (-b - sqrt(discriminant)) / (2 * a);\n\n    cout << root1 << endl;\n    cout << root2 << endl;\n    return 0;\n}', output: "2\n1", language: "cpp" },
                { id: "cpp-patterns", title: "Print Pyramids and Patterns", description: "Nested loops are the usual pattern-building tool in beginner C++ programs.", syntax: "for (int row = 1; row <= height; row++) {", code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int height = 5;\n\n    for (int row = 1; row <= height; row++) {\n        for (int col = 1; col <= row; col++) {\n            cout << "*";\n        }\n        cout << endl;\n    }\n\n    return 0;\n}', output: "*\n**\n***\n****\n*****", language: "cpp" },
                { id: "cpp-prime", title: "Check prime number", description: "Keep dividing until a factor is found or you prove the number is prime.", syntax: "for (int divisor = 2; divisor * divisor <= number; divisor++) {", code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int number = 29;\n    bool isPrime = number > 1;\n\n    for (int divisor = 2; divisor * divisor <= number; divisor++) {\n        if (number % divisor == 0) {\n            isPrime = false;\n            break;\n        }\n    }\n\n    cout << (isPrime ? "Prime" : "Not prime") << endl;\n    return 0;\n}', output: "Prime", language: "cpp" },
                { id: "cpp-fibonacci", title: "Print the Fibonacci series", description: "This is a good loop exercise because it updates several values each iteration.", syntax: "int a = 0;\nint b = 1;", code: '#include <iostream>\nusing namespace std;\n\nint main() {\n    int count = 7;\n    int a = 0;\n    int b = 1;\n\n    for (int i = 0; i < count; i++) {\n        cout << a << endl;\n        int next = a + b;\n        a = b;\n        b = next;\n    }\n\n    return 0;\n}', output: "0\n1\n1\n2\n3\n5\n8", language: "cpp" },
            ]},
            java: { name: "Java", references: [
                { title: "Practice Focus", description: "Use Scanner, loops, Math.sqrt(), and straightforward conditionals." },
                { title: "Helpful Classes", description: "Scanner for input and Math for square root calculations." },
                { title: "Common Pitfall", description: "Declare variables with explicit types and keep code inside Main." },
                { title: "Run Tip", description: "Interactive examples that use Scanner work with the shared input panel." },
            ], items: [
                { id: "java-odd-even", title: "Check odd/even number", description: "Use the modulus operator with an integer from Scanner to decide even or odd.", syntax: 'if (number % 2 == 0) {\n    System.out.println("Even");\n} else {\n    System.out.println("Odd");\n}', code: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int number = scanner.nextInt();\n\n        if (number % 2 == 0) {\n            System.out.println("Even");\n        } else {\n            System.out.println("Odd");\n        }\n    }\n}', output: "7\nOdd", language: "java" },
                { id: "java-quadratic", title: "Find roots of a quadratic equation", description: "Use the discriminant formula and Math.sqrt() for the two roots.", syntax: "double discriminant = b * b - 4 * a * c;", code: 'public class Main {\n    public static void main(String[] args) {\n        double a = 1;\n        double b = -3;\n        double c = 2;\n\n        double discriminant = b * b - 4 * a * c;\n        double root1 = (-b + Math.sqrt(discriminant)) / (2 * a);\n        double root2 = (-b - Math.sqrt(discriminant)) / (2 * a);\n\n        System.out.println(root1);\n        System.out.println(root2);\n    }\n}', output: "2.0\n1.0", language: "java" },
                { id: "java-patterns", title: "Print Pyramids and Patterns", description: "Nested loops make it easy to print a growing pattern one row at a time.", syntax: "for (int row = 1; row <= height; row++) {", code: 'public class Main {\n    public static void main(String[] args) {\n        int height = 5;\n\n        for (int row = 1; row <= height; row++) {\n            for (int col = 1; col <= row; col++) {\n                System.out.print("*");\n            }\n            System.out.println();\n        }\n    }\n}', output: "*\n**\n***\n****\n*****", language: "java" },
                { id: "java-prime", title: "Check prime number", description: "Test divisors from 2 upward until one divides evenly or the loop ends.", syntax: "for (int divisor = 2; divisor * divisor <= number; divisor++) {", code: 'public class Main {\n    public static void main(String[] args) {\n        int number = 29;\n        boolean isPrime = number > 1;\n\n        for (int divisor = 2; divisor * divisor <= number; divisor++) {\n            if (number % divisor == 0) {\n                isPrime = false;\n                break;\n            }\n        }\n\n        System.out.println(isPrime ? "Prime" : "Not prime");\n    }\n}', output: "Prime", language: "java" },
                { id: "java-fibonacci", title: "Print the Fibonacci series", description: "Keep two running values and update them after each printed term.", syntax: "int a = 0;\nint b = 1;", code: 'public class Main {\n    public static void main(String[] args) {\n        int count = 7;\n        int a = 0;\n        int b = 1;\n\n        for (int i = 0; i < count; i++) {\n            System.out.println(a);\n            int next = a + b;\n            a = b;\n            b = next;\n        }\n    }\n}', output: "0\n1\n1\n2\n3\n5\n8", language: "java" },
            ]},
            php: { name: "PHP", references: [
                { title: "Practice Focus", description: "Console input, conditionals, loops, math, and array-friendly thinking." },
                { title: "Helpful Tools", description: "Use fgets(STDIN), trim(), sqrt(), echo, and PHP_EOL." },
                { title: "Common Pitfall", description: "Remember user input arrives as text, so cast when needed." },
                { title: "Run Tip", description: "Examples that use fgets(STDIN) continue with the interactive input box." },
            ], items: [
                { id: "php-odd-even", title: "Check odd/even number", description: "Read a number from STDIN, then test the remainder after division by two.", syntax: 'if ($number % 2 == 0) {\n    echo "Even";\n}', code: '<?php\n$number = (int) trim(fgets(STDIN));\n\nif ($number % 2 == 0) {\n    echo "Even" . PHP_EOL;\n} else {\n    echo "Odd" . PHP_EOL;\n}\n?>', output: "7\nOdd", language: "php" },
                { id: "php-quadratic", title: "Find roots of a quadratic equation", description: "PHP can handle the quadratic formula directly with arithmetic and sqrt().", syntax: "$discriminant = $b * $b - 4 * $a * $c;", code: '<?php\n$a = 1;\n$b = -3;\n$c = 2;\n$discriminant = $b * $b - 4 * $a * $c;\n$root1 = (-$b + sqrt($discriminant)) / (2 * $a);\n$root2 = (-$b - sqrt($discriminant)) / (2 * $a);\n\necho $root1 . PHP_EOL;\necho $root2 . PHP_EOL;\n?>', output: "2\n1", language: "php" },
                { id: "php-patterns", title: "Print Pyramids and Patterns", description: "Nested loops and string repetition make quick pattern exercises in PHP.", syntax: "for ($row = 1; $row <= $height; $row++) {", code: '<?php\n$height = 5;\n\nfor ($row = 1; $row <= $height; $row++) {\n    echo str_repeat("*", $row) . PHP_EOL;\n}\n?>', output: "*\n**\n***\n****\n*****", language: "php" },
                { id: "php-prime", title: "Check prime number", description: "Loop through possible divisors and stop as soon as one works.", syntax: "for ($divisor = 2; $divisor * $divisor <= $number; $divisor++) {", code: '<?php\n$number = 29;\n$isPrime = $number > 1;\n\nfor ($divisor = 2; $divisor * $divisor <= $number; $divisor++) {\n    if ($number % $divisor == 0) {\n        $isPrime = false;\n        break;\n    }\n}\n\necho ($isPrime ? "Prime" : "Not prime") . PHP_EOL;\n?>', output: "Prime", language: "php" },
                { id: "php-fibonacci", title: "Print the Fibonacci series", description: "The Fibonacci example helps practice simultaneous variable updates.", syntax: "$a = 0;\n$b = 1;", code: '<?php\n$count = 7;\n$a = 0;\n$b = 1;\n\nfor ($i = 0; $i < $count; $i++) {\n    echo $a . PHP_EOL;\n    $next = $a + $b;\n    $a = $b;\n    $b = $next;\n}\n?>', output: "0\n1\n1\n2\n3\n5\n8", language: "php" },
            ]},
        };

        const interactiveMatchers = {
            python: /\binput\s*\(/,
            javascript: /\b(?:require\s*\(\s*["']readline["']\s*\)|readline\.createInterface\s*\(|rl\.question\s*\(|process\.stdin\b)/,
            c: /\b(scanf|getchar|fgets)\s*\(/,
            cpp: /(?:\bcin\s*>>|\bgetline\s*\(\s*cin\b|\bstd::cin\s*>>|\bstd::getline\s*\(\s*std::cin\b)/,
            java: /\b(?:new\s+Scanner\s*\(|scanner\s*\.\s*next(?:Line|Int|Double|Float|Long|Boolean|Short|Byte)\s*\(|System\.console\s*\(\)\s*\.\s*readLine\s*\()/,
            php: /\b(?:readline\s*\(|fgets\s*\(\s*STDIN\b)/,
        };

        function getLanguageLabel(language) {
            return languageLabels[language] || language.toUpperCase();
        }

        function getDeliveryModeLabel(value) {
            return deliveryModeLabels[value] || value;
        }

        function getSubmissionSourceLabel() {
            return mode === "upload" ? "Uploaded File" : "Pasted Code";
        }

        function scrollToRunner() {
            runnerView.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        function clearDownloadState() {
            downloadSection.classList.add("hidden");
            downloadFilename.textContent = "No artifact yet";
            downloadMeta.textContent = "";
            downloadPreview.classList.add("hidden");
            downloadPreviewImage.removeAttribute("src");
            downloadLink.href = "#";
            downloadOpenLink.href = "#";
            downloadLink.removeAttribute("download");
        }

        function showDownloadArtifact(artifact) {
            if (!artifact) {
                clearDownloadState();
                return;
            }

            downloadSection.classList.remove("hidden");
            downloadFilename.textContent = artifact.artifact_filename;
            downloadMeta.textContent = `${artifact.artifact_content_type} · ${artifact.artifact_size_bytes.toLocaleString()} bytes`;
            downloadLink.href = artifact.artifact_download_url;
            downloadLink.setAttribute("download", artifact.artifact_filename);
            downloadOpenLink.href = artifact.artifact_download_url;

            const isPreviewableImage = (artifact.artifact_content_type || "").startsWith("image/");
            downloadPreview.classList.toggle("hidden", !isPreviewableImage);
            if (isPreviewableImage) {
                downloadPreviewImage.src = artifact.artifact_download_url;
                downloadPreviewImage.alt = artifact.artifact_filename;
            } else {
                downloadPreviewImage.removeAttribute("src");
            }
        }

        function parseFilenameFromDisposition(disposition, fallback = "cloud-faas-download.bin") {
            if (!disposition) {
                return fallback;
            }

            const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
            if (utfMatch) {
                return decodeURIComponent(utfMatch[1]);
            }

            const basicMatch = disposition.match(/filename="?([^"]+)"?/i);
            return basicMatch ? basicMatch[1] : fallback;
        }

        async function parseErrorPayload(response) {
            const contentType = response.headers.get("content-type") || "";
            if (contentType.includes("application/json")) {
                const data = await response.json();
                return data.detail || data;
            }

            const text = await response.text();
            return { error: `Request failed with status ${response.status}`, details: text || response.statusText };
        }

        function triggerBrowserDownload(blob, filename) {
            const objectUrl = URL.createObjectURL(blob);
            const anchor = document.createElement("a");
            anchor.href = objectUrl;
            anchor.download = filename;
            document.body.appendChild(anchor);
            anchor.click();
            anchor.remove();
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        }

        function appendOptionalInputFile(formData) {
            if (inputFileInput.files.length) {
                formData.append("input_file", inputFileInput.files[0]);
            }
        }

        function setView(view) {
            currentView = view;
            const showRunner = view === "runner";
            runnerView.classList.toggle("hidden", !showRunner);
            tutorialsView.classList.toggle("hidden", showRunner);
            runnerNavButton.classList.toggle("active", showRunner);
            tutorialsNavButton.classList.toggle("active", !showRunner && learningMode === "tutorials");
            examplesNavButton.classList.toggle("active", !showRunner && learningMode === "examples");
        }

        function setRunnerLanguage(language, { applyTemplate = false } = {}) {
            languageSelect.value = language;
            if (applyTemplate && mode === "code") {
                codeInput.value = runnerTemplates[language];
            }
            updateInteractiveVisibility();
        }

        function openRunnerWithCode(language, code) {
            setView("runner");
            setMode("code");
            setRunnerLanguage(language);
            codeInput.value = code;
            scrollToRunner();
            codeInput.focus();
        }

        function getActiveLibrary() {
            return learningMode === "tutorials" ? tutorials : examples;
        }

        function getCurrentLibraryItems() {
            const languageData = getActiveLibrary()[activeTutorialLanguage];
            const query = tutorialSearchInput.value.trim().toLowerCase();
            const items = languageData.items || languageData.topics;

            if (!query) {
                return items;
            }

            return items.filter((item) => {
                return [item.title, item.description, item.syntax, item.code].join(" ").toLowerCase().includes(query);
            });
        }

        function getActiveItem() {
            const languageData = getActiveLibrary()[activeTutorialLanguage];
            const items = languageData.items || languageData.topics;
            return items.find((item) => item.id === activeTutorialId) || null;
        }

        function escapeHtml(text) {
            return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
        }

        function buildExpandedDetailMarkup(item) {
            return `
                <div class="detail-meta">
                    <span class="pill">${getLanguageLabel(item.language)}</span>
                    <span class="pill">Beginner Friendly</span>
                </div>
                <div class="detail-block">
                    <strong>Syntax Example</strong>
                    <pre>${escapeHtml(item.syntax)}</pre>
                </div>
                <div class="detail-block">
                    <strong>Full Working Code</strong>
                    <pre>${escapeHtml(item.code)}</pre>
                </div>
                <div class="detail-block">
                    <strong>Expected Output</strong>
                    <pre>${escapeHtml(item.output)}</pre>
                </div>
                <div class="inline-actions">
                    <button class="run-button" type="button" data-run-item="${item.id}">Try this in Code Runner</button>
                </div>
            `;
        }

        function renderLanguageList() {
            languageList.innerHTML = Object.entries(getActiveLibrary()).map(([key, value]) => `
                <button class="language-chip ${key === activeTutorialLanguage ? "active" : ""}" type="button" data-language="${key}">
                    ${value.name}
                </button>
            `).join("");

            languageList.querySelectorAll("[data-language]").forEach((button) => {
                button.addEventListener("click", () => {
                    activeTutorialLanguage = button.dataset.language;
                    const library = getActiveLibrary()[activeTutorialLanguage];
                    const items = library.items || library.topics;
                    activeTutorialId = items[0].id;
                    tutorialSearchInput.value = "";
                    renderLearningView();
                });
            });
        }

        function renderTopicList() {
            const items = getCurrentLibraryItems();
            const label = learningMode === "tutorials" ? "tutorials" : "examples";

            if (!items.length) {
                activeTutorialId = "";
                topicList.innerHTML = `<div class="empty-state">No ${label} match this search yet. Try a broader keyword.</div>`;
                return false;
            }

            topicList.innerHTML = items.map((item) => `
                <article class="topic-card ${item.id === activeTutorialId ? "active" : ""}" data-topic-id="${item.id}">
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    ${item.id === activeTutorialId ? buildExpandedDetailMarkup(item) : ""}
                </article>
            `).join("");

            topicList.querySelectorAll("[data-topic-id]").forEach((card) => {
                card.addEventListener("click", () => {
                    activeTutorialId = activeTutorialId === card.dataset.topicId ? "" : card.dataset.topicId;
                    renderTopicList();
                });
            });

            topicList.querySelectorAll("[data-run-item]").forEach((button) => {
                button.addEventListener("click", (event) => {
                    event.stopPropagation();
                    const item = items.find((entry) => entry.id === button.dataset.runItem);
                    if (item) {
                        openRunnerWithCode(item.language, item.code);
                    }
                });
            });

            return true;
        }

        function renderReferenceList() {
            const languageData = getActiveLibrary()[activeTutorialLanguage];
            referenceList.innerHTML = languageData.references.map((reference) => `
                <article class="reference-card">
                    <h3>${reference.title}</h3>
                    <p>${reference.description}</p>
                </article>
            `).join("");
        }

        function updateLearningMeta() {
            const isTutorials = learningMode === "tutorials";
            tutorialsNavButton.classList.toggle("active", currentView === "tutorials" && isTutorials);
            examplesNavButton.classList.toggle("active", currentView === "tutorials" && !isTutorials);
            learningEyebrow.textContent = isTutorials ? "Tutorials" : "Examples";
            learningHeading.textContent = isTutorials
                ? "Learn the same languages you can run in Cloud FaaS."
                : "Practice real runnable examples for every Cloud FaaS language.";
            learningDescription.textContent = isTutorials
                ? "Browse beginner-friendly lessons, scan quick references, and send examples straight into the code runner when you are ready to experiment."
                : "Open hands-on examples, study common programming patterns, and push working code straight into the runner when you want to test it.";
            libraryListTitle.textContent = isTutorials ? "Popular Tutorials" : "Popular Examples";
            libraryListDescription.textContent = isTutorials
                ? "Search within the active language and choose a lesson to expand it right here."
                : "Search within the active language and choose a runnable example to expand it right here.";
            referenceTitle.textContent = isTutorials ? "Reference Materials" : "Example Notes";
            referenceDescription.textContent = isTutorials
                ? "Small lookup notes for the active language while you study."
                : "Helpful reminders and practice notes for the active language examples.";
            tutorialSearchInput.placeholder = isTutorials ? "Search tutorials" : "Search examples";
        }

        function renderLearningView() {
            updateLearningMeta();
            renderLanguageList();
            renderTopicList();
            renderReferenceList();
        }

        function openLearningMode(nextMode) {
            learningMode = nextMode;
            const activeLibrary = getActiveLibrary()[activeTutorialLanguage];
            const items = activeLibrary.items || activeLibrary.topics;
            activeTutorialId = items[0].id;
            tutorialSearchInput.value = "";
            setView("tutorials");
            renderLearningView();
            tutorialsView.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        function updateInteractiveVisibility() {
            const activeLanguageLabel = getLanguageLabel(languageSelect.value);
            interactiveTitle.textContent = `Interactive ${activeLanguageLabel} Input`;
            interactiveDescription.innerHTML = `Run ${activeLanguageLabel} from the main button above. If the program pauses for input, reply here and the shared output box will continue updating.`;
            interactiveHint.innerHTML = `Use the same <code>${activeLanguageLabel}</code> language selected in <code>Run a function</code>. The output appears in the single <code>Execution result</code> box above.`;
            updateInteractiveControlsState();
        }

        function setMode(nextMode) {
            mode = nextMode;
            const isCode = mode === "code";
            codeSection.classList.toggle("hidden", !isCode);
            uploadSection.classList.toggle("hidden", isCode);
            codeModeButton.classList.toggle("active", isCode);
            uploadModeButton.classList.toggle("active", !isCode);
            updateInteractiveVisibility();
        }

        function formatResult(data) {
            if (data.error) {
                resultOutput.classList.add("result-error");
                return `Error: ${data.error}\n\nDetails:\n${data.details || "No details returned."}`;
            }
            resultOutput.classList.remove("result-error");
            return data.output || "(No output)";
        }

        function isResultPlaceholder() {
            return ["Waiting for a run...", "Executing function...", "Running Python code..."].includes(resultOutput.textContent);
        }

        function setResultMessage(message, { isError = false } = {}) {
            resultOutput.classList.toggle("result-error", isError);
            resultOutput.textContent = message;
        }

        function appendResultOutput(text) {
            resultOutput.classList.remove("result-error");
            if (isResultPlaceholder()) {
                resultOutput.textContent = "";
            }
            resultOutput.textContent += text;
            resultOutput.scrollTop = resultOutput.scrollHeight;
        }

        function codeNeedsInteractiveInput(language, code) {
            const matcher = interactiveMatchers[language];
            return matcher ? matcher.test(code) : false;
        }

        function updateInteractiveControlsState() {
            const sessionActive = Boolean(interactiveSessionId);
            const activeLanguageLabel = getLanguageLabel(languageSelect.value);
            interactiveInput.disabled = !sessionActive;
            interactiveSendButton.disabled = !sessionActive;
            interactiveStopButton.disabled = !sessionActive;

            if (!sessionActive) {
                interactiveInput.placeholder = `Run ${activeLanguageLabel} code that waits for input to reply here.`;
            } else {
                interactiveInput.placeholder = `Type a ${activeLanguageLabel} input reply and press Send or Enter`;
            }
        }

        async function loadStatus() {
            try {
                const response = await fetch("/api/status");
                const data = await response.json();
                const supported = data.supported_languages.map(getLanguageLabel).join(", ");
                statusBadge.innerHTML = `<span class="status-dot"></span><span>${data.message} Supported: ${supported}. Downloads: ${data.artifact_delivery_modes.join(", ")}</span>`;
            } catch (error) {
                statusBadge.innerHTML = `<span class="status-dot" style="background: var(--error);"></span><span>API status unavailable</span>`;
            }
        }

        async function loadHistory() {
            try {
                const response = await fetch("/history?limit=2");
                const data = await response.json();

                if (!Array.isArray(data) || data.length === 0) {
                    historyList.innerHTML = '<div class="history-empty">No executions yet.</div>';
                    return;
                }

                historyList.innerHTML = data.map((item) => {
                    const title = `${getLanguageLabel(item.language)}`;
                    const subtitle = item.request_source || "Inline Result";
                    const fileLabel = item.submitted_file ? `<div class="meta">${item.submitted_file}</div>` : "";
                    const preview = item.output_preview || "(No output preview)";
                    return `
                        <div class="history-item">
                            <strong>${title}</strong>
                            <div class="meta">${subtitle}</div>
                            ${fileLabel}
                            <div class="meta">${new Date(item.timestamp).toLocaleString()}</div>
                            <div class="meta">${preview}</div>
                        </div>
                    `;
                }).join("");
            } catch (error) {
                historyList.innerHTML = '<div class="history-empty">History could not be loaded.</div>';
            }
        }

        codeModeButton.addEventListener("click", () => setMode("code"));
        uploadModeButton.addEventListener("click", () => setMode("upload"));
        runnerNavButton.addEventListener("click", () => {
            setView("runner");
            scrollToRunner();
        });
        tutorialsNavButton.addEventListener("click", () => openLearningMode("tutorials"));
        examplesNavButton.addEventListener("click", () => openLearningMode("examples"));
        tutorialBackButton.addEventListener("click", () => {
            setView("runner");
            scrollToRunner();
        });
        tutorialSearchInput.addEventListener("input", () => {
            renderTopicList();
        });

        function resetInteractiveState({ preserveOutput = false, message = "Waiting for a run..." } = {}) {
            if (interactivePollHandle) {
                clearInterval(interactivePollHandle);
                interactivePollHandle = null;
            }

            interactiveSessionId = null;
            interactiveInput.value = "";

            if (!preserveOutput) {
                setResultMessage(message);
            } else if (isResultPlaceholder()) {
                setResultMessage("(No output)");
            }

            updateInteractiveControlsState();
        }

        async function stopInteractiveSession({ preserveOutput = false } = {}) {
            if (!interactiveSessionId) {
                resetInteractiveState({ preserveOutput });
                return false;
            }

            const sessionId = interactiveSessionId;
            resetInteractiveState({ preserveOutput });

            try {
                await fetch(`/interactive/stop/${sessionId}`, { method: "POST" });
            } catch (error) {
                if (!preserveOutput) {
                    setResultMessage("Interactive session stopped locally.");
                }
            }

            return true;
        }

        async function pollInteractiveOutput() {
            if (!interactiveSessionId) {
                return;
            }

            try {
                const response = await fetch(`/interactive/output/${interactiveSessionId}`);
                const data = await response.json();

                if (!data.found) {
                    resetInteractiveState({
                        preserveOutput: !isResultPlaceholder(),
                        message: "[interactive session not found]",
                    });
                    return;
                }

                for (const chunk of data.chunks) {
                    appendResultOutput(chunk);
                }

                if (!data.active) {
                    resetInteractiveState({ preserveOutput: true });
                }
            } catch (error) {
                resetInteractiveState({
                    preserveOutput: !isResultPlaceholder(),
                    message: "[interactive polling failed]",
                });
            }
        }

        async function startInteractiveSession(code) {
            const language = languageSelect.value;
            if (!code) {
                setResultMessage(`Provide ${getLanguageLabel(language)} code before starting interactive input.`);
                return;
            }

            await stopInteractiveSession({ preserveOutput: true });
            setResultMessage(`Running ${getLanguageLabel(language)} code...`);

            const response = await fetch("/interactive/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ language, code }),
            });

            const data = await response.json();

            if (data.error || !data.session_id) {
                setResultMessage(
                    `Error: ${data.error || "Could not start session"}\n\n${data.details || ""}`,
                    { isError: true }
                );
                return;
            }

            interactiveSessionId = data.session_id;
            updateInteractiveControlsState();
            interactiveInput.focus();
            interactivePollHandle = setInterval(pollInteractiveOutput, 500);
            await pollInteractiveOutput();
        }

        async function sendInteractiveLine() {
            if (!interactiveSessionId) {
                setResultMessage(`Run ${getLanguageLabel(languageSelect.value)} code that waits for input first.`);
                return;
            }

            const text = interactiveInput.value;
            const response = await fetch(`/interactive/input/${interactiveSessionId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text }),
            });

            const data = await response.json();
            if (!data.sent) {
                appendResultOutput("\n[interactive input could not be sent]\n");
                return;
            }

            interactiveInput.value = "";
            interactiveInput.focus();
            await pollInteractiveOutput();
        }

        languageSelect.addEventListener("change", () => {
            if (mode === "code") {
                codeInput.value = runnerTemplates[languageSelect.value];
            }
            updateInteractiveVisibility();
        });

        interactiveStopButton.addEventListener("click", async () => {
            const stopped = await stopInteractiveSession({ preserveOutput: true });
            if (stopped) {
                appendResultOutput("\n[interactive session stopped]\n");
            }
        });

        interactiveSendButton.addEventListener("click", () => {
            sendInteractiveLine().catch((error) => {
                setResultMessage(error.message, { isError: true });
            });
        });

        interactiveInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                sendInteractiveLine().catch((error) => {
                    setResultMessage(error.message, { isError: true });
                });
            }
        });

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            runButton.disabled = true;
            runButton.textContent = "Running...";

            try {
                let response;
                let uploadedCode = null;
                const shouldUseInteractive =
                    mode === "code" &&
                    codeNeedsInteractiveInput(languageSelect.value, codeInput.value);

                if (mode === "upload" && !fileInput.files.length) {
                    throw new Error("Choose a file before running upload mode.");
                }

                if (mode === "upload" && fileInput.files.length) {
                    uploadedCode = await fileInput.files[0].text();
                }

                const shouldUseUploadedInteractive =
                    uploadedCode !== null && codeNeedsInteractiveInput(languageSelect.value, uploadedCode);

                if (shouldUseInteractive) {
                    await startInteractiveSession(codeInput.value);
                    await loadHistory();
                    return;
                }

                if (shouldUseUploadedInteractive) {
                    await startInteractiveSession(uploadedCode);
                    await loadHistory();
                    return;
                }

                await stopInteractiveSession({ preserveOutput: true });
                clearDownloadState();
                resultOutput.classList.remove("result-error");
                resultOutput.textContent = "Executing function...";

                const deliveryMode = deliveryModeSelect.value;

                if (deliveryMode === "direct-download") {
                    if (mode === "code") {
                        if (inputFileInput.files.length) {
                            const formData = new FormData();
                            formData.append("language", languageSelect.value);
                            formData.append("code", codeInput.value);
                            formData.append("submission_source", getSubmissionSourceLabel());
                            appendOptionalInputFile(formData);

                            response = await fetch("/run/with-input/download", {
                                method: "POST",
                                body: formData,
                            });
                        } else {
                            response = await fetch("/run/download", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                    language: languageSelect.value,
                                    code: codeInput.value,
                                    submission_source: getSubmissionSourceLabel(),
                                }),
                            });
                        }
                    } else {
                        const formData = new FormData();
                        formData.append("language", languageSelect.value);
                        formData.append("file", fileInput.files[0]);
                        appendOptionalInputFile(formData);

                        response = await fetch("/run/upload/download", {
                            method: "POST",
                            body: formData,
                        });
                    }

                    if (!response.ok) {
                        const payload = await parseErrorPayload(response);
                        setResultMessage(formatResult(payload), {
                            isError: Boolean(payload.error),
                        });
                        return;
                    }

                    const blob = await response.blob();
                    const filename = parseFilenameFromDisposition(
                        response.headers.get("content-disposition"),
                        response.headers.get("X-Cloud-FaaS-Filename") || `${languageSelect.value}-download.bin`
                    );
                    triggerBrowserDownload(blob, filename);
                    setResultMessage(response.headers.get("X-Cloud-FaaS-Output-Preview") || `Downloaded ${filename}`);
                    await loadHistory();
                    return;
                }

                if (mode === "code") {
                    if (inputFileInput.files.length) {
                        const formData = new FormData();
                        formData.append("language", languageSelect.value);
                        formData.append("code", codeInput.value);
                        formData.append("request_source", getDeliveryModeLabel(deliveryMode));
                        formData.append("submission_source", getSubmissionSourceLabel());
                        appendOptionalInputFile(formData);

                        response = await fetch("/run/with-input", {
                            method: "POST",
                            body: formData,
                        });
                    } else {
                        response = await fetch("/run", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                language: languageSelect.value,
                                code: codeInput.value,
                                request_source: getDeliveryModeLabel(deliveryMode),
                                submission_source: getSubmissionSourceLabel(),
                            }),
                        });
                    }
                } else {
                    const formData = new FormData();
                    formData.append("language", languageSelect.value);
                    formData.append("file", fileInput.files[0]);
                    formData.append("request_source", getDeliveryModeLabel(deliveryMode));
                    formData.append("submission_source", getSubmissionSourceLabel());
                    appendOptionalInputFile(formData);

                    response = await fetch("/run/upload", {
                        method: "POST",
                        body: formData,
                    });
                }

                const data = await response.json();
                setResultMessage(formatResult(data.detail || data), {
                    isError: Boolean((data.detail || data).error),
                });
                const payload = data.detail || data;
                if (payload.artifact) {
                    showDownloadArtifact(payload.artifact);
                }
                await loadHistory();
            } catch (error) {
                setResultMessage(error.message, { isError: true });
            } finally {
                runButton.disabled = false;
                runButton.textContent = "Run Function";
            }
        });

        setView("runner");
        renderLearningView();
        setMode("code");
        clearDownloadState();
        loadStatus();
        loadHistory();
    
