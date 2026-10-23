# How to use the launch loop

Works on any of your apps. Nothing in it is specific to one product.

## 1. Put it in your project
Unzip this into the TOP folder of your app's project (the folder Claude Code is working in).
You'll now have a `launch/` folder and a `.claude/agents/` folder next to your code.

## 2. Tell it your real numbers (2 minutes)
Open `launch/LAUNCH_LOOP.md`. If your expected launch-day traffic is not 5,000 users in a day,
change that number near the top. Everything else it works out by itself.

## 3. Start it. Pick one way.

**Easy way (you watch, it asks permission):**
Open your project in Claude Code and type:

    Read launch/LAUNCH_LOOP.md and run it. Keep going until you need me.

When that session ends, start a new session and type the same thing. It picks up where it left off.

**Walk-away way (runs by itself, session after session):**
In the Terminal, inside your project folder, type:

    bash launch/run-loop.sh

Try a short run first to see how much it uses:  `MAX_SESSIONS=2 bash launch/run-loop.sh`

## 4. What to read (in this order)
1. `launch/MANUAL_TASKS.md`: what only you can do. Start on these right away, in parallel.
2. `launch/SCORECARD.md`: red/green for every area of the company.
3. `launch/LAUNCH_REPORT.md`: the final GO / NO-GO, written when it's done.

## What it will never do
Deploy, push code, touch your live database, use live payment keys, send real emails or texts,
or load-test your live site. All of its work stays on a separate branch called `launch/readiness`.
Have someone technical look over that branch before it is merged and released.
