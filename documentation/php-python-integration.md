# Integrating PHP with Python

If you need PHP and Python to work together, choose the approach that fits your runtime and performance needs. This guide covers the most common patterns with runnable examples.

## 1) Call Python from PHP with `shell_exec()`

This is the simplest approach: PHP spawns a Python process and reads its output.

**PHP (`index.php`)**

```php
<?php
$pythonScript = escapeshellcmd('python3 myscript.py "Hello from PHP"');
$output = shell_exec($pythonScript);

if ($output === null) {
    echo "Error running Python script.";
} else {
    echo "Python says: " . htmlspecialchars($output, ENT_QUOTES, 'UTF-8');
}
```

**Python (`myscript.py`)**

```python
import sys

if len(sys.argv) > 1:
    message = sys.argv[1]
else:
    message = "No message received"

print(f"Received: {message}")
```

**Pros**
- Easy to implement.
- Works on most hosting environments.

**Cons**
- Slower for frequent calls (each request launches Python).
- Requires careful input sanitization.

## 2) Exchange structured data via JSON

Pass JSON into Python and return JSON back to PHP for structured data.

**PHP (`index.php`)**

```php
<?php
$data = ["name" => "Alice", "age" => 30];
$jsonData = escapeshellarg(json_encode($data));

$command = "python3 process_data.py $jsonData";
$output = shell_exec($command);

$result = json_decode($output, true);
print_r($result);
```

**Python (`process_data.py`)**

```python
import json
import sys

data = json.loads(sys.argv[1])
data["processed"] = True

print(json.dumps(data))
```

## 3) Run Python as a local API (Flask + PHP client)

For high-frequency or real-time interactions, run Python as a service and call it from PHP.

**Python (Flask API)**

```python
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route("/process", methods=["POST"])
def process():
    data = request.json
    data["processed"] = True
    return jsonify(data)

if __name__ == "__main__":
    app.run(port=5000)
```

**PHP client**

```php
<?php
$url = "http://127.0.0.1:5000/process";
$data = ["name" => "Bob", "age" => 25];

$options = [
    "http" => [
        "header" => "Content-Type: application/json\r\n",
        "method" => "POST",
        "content" => json_encode($data),
    ],
];
$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

print_r(json_decode($result, true));
```

**Pros**
- Fast for repeated calls.
- Language-agnostic and easy to scale.

**Cons**
- Requires running and monitoring a Python service.
- Adds network overhead.

## 4) Use a PHP-Python bridge library

Libraries like `php-py` can execute Python within PHP without shelling out.

```php
<?php
require "vendor/autoload.php";

use PhpPy\Python;

$py = new Python();
$result = $py->run('print("Hello from Python inside PHP")');
echo $result;
```

## Recommendation

- **One-off calls:** `shell_exec()` with JSON input/output.
- **High-performance apps:** a local API (Flask/FastAPI) called from PHP.
- **Tight integration:** a bridge library like `php-py`.

If you want a full working example for XAMPP or WAMP, build a small Flask API and use the PHP client above to call it.
