fibonacci-indent
================

A Visual Studio Code plugin that helps you indent code according to the Fibonacci sequence.
The first 2 numbers of the sequence will be

## How it works

It binds itself to the `tab` key and adds enough indent so it matches the next number in Fibonacci sequence.
It also detects autoindent on newline and tries to fix that.

I honestly don't like this approach but it seemed to be the only way I could achieve this. If someone has a better idea I'll be really happy.

## TODO

- Fix indenting multiple lines at once
- Somehow get the format document command to follow this without overriding other language rules.
- Stop myself from writing stupid extensions for a chuckle

## Idea

Some Twitter screenshot on Reddit... can't remember which one is the first I saw.