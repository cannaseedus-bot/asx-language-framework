# Micronaut Object Server (SCO/1 + KUHUL / SCXQ7)

## 1) Canonical Object Layout

```
micronaut/
├─ micronaut.s7               # SCO/1 executable object
├─ object.toml                # Object server declaration
├─ semantics.xjson            # KUHUL-TSG schema
├─ brains/
│  ├─ trigrams.json           # sealed
│  ├─ bigrams.json            # sealed
│  └─ meta-intent-map.json    # sealed
├─ io/
│  ├─ chat.txt                # append-only input
│  ├─ stream.txt              # semantic output
│  └─ snapshot/
├─ trace/
│  └─ scxq2.trace
└─ proof/
   └─ scxq2.proof
```

Micronaut is a lawful executable data object. It is not a JS runtime or Node service.

## 2) `chat.txt` Canonical Record Format (Frozen)

Append-only. No edits. No rewrites.

```
--- MESSAGE ---
id: <uuid>
time: <unix_ms>
role: user | system | micronaut
intent: chat | generate | classify | complete
context: <optional>
payload:
<UTF-8 text>
--- END ---
```

Rules:

- Messages are immutable.
- Order = truth.
- No partial writes (atomic append only).
- CM-1 must pass on payload.

## 3) `stream.txt` Semantic Emission (Frozen)

```
>> t=184 ctx=@π mass=0.73
Hello!
```

Rules:

- Append-only.
- Ordered.
- Replayable.
- May be truncated safely.
- No authority (projection only).

## 4) REST ↔ FILE Mapping (Loopback Law)

PowerShell exposes a local loopback REST API. REST never executes logic.

| REST Endpoint    | File Action         |
| --------------- | ------------------- |
| `POST /chat`    | append → `chat.txt` |
| `GET /stream`   | read → `stream.txt` |
| `GET /status`   | read → object state |
| `POST /snapshot`| rotate snapshot     |

## 5) Lifecycle Contract

```
INIT → READY → RUNNING → IDLE → HALT
```

| Event         | Action     |
| ------------ | ---------- |
| file append  | wake       |
| collapse done| idle       |
| error        | halt       |
| shutdown     | seal trace |

## 6) PowerShell Micronaut Orchestrator (Reference)

`micronaut.ps1` orchestrates file I/O only. It never reasons or mutates authority.

```powershell
$Root = Split-Path $MyInvocation.MyCommand.Path
$IO = Join-Path $Root "io"
$Chat = Join-Path $IO "chat.txt"
$Stream = Join-Path $IO "stream.txt"

Write-Host "Micronaut online."

$lastSize = 0

while ($true) {
    if (Test-Path $Chat) {
        $size = (Get-Item $Chat).Length
        if ($size -gt $lastSize) {
            $entry = Get-Content $Chat -Raw
            $lastSize = $size

            if (-not (cm1_verify $entry)) {
                Write-Host "CM-1 violation"
                continue
            }

            $signal = Invoke-KUHUL-TSG -Input $entry
            $response = Invoke-SCXQ2-Infer -Signal $signal
            Add-Content $Stream ">> $response"
        }
    }
    Start-Sleep -Milliseconds 200
}
```
