Calculator Example
==================

This example uses node-llvmc to implement the first three chapters of the [LLVM Kaleidoscope Tutorial][kaleidoscope]. There are a few cosmetic differences (e.g., we do not support comments or check whether numbers have too many decimal points). The tutorial should give you an idea of what the calculator can do and how it works.

[kaleidoscope]: http://llvm.org/docs/tutorial/index.html

Usage
-----

Compile the examples by running `tsc` in the `examples` directory. Then, type:

    $ node build/example/kaleidoscope/calculator.js

to run the calculator. The program will prompt you to enter programs. The calculator supports supports arithmetic operations, function definitions, function calls, and externs. There are some example programs below.

After each command, the calculator will print the entire current LLVM IR you've created thus far.

To exit the calculator, type `quit` at the prompt.

### Arithmetic

The language supports addition, subtraction, multiplication, and parentheses. All numbers are treated as floating-point values.

    Ready> (2+5)*(7-1)

### Functions

Functions are defined using the keyword `def`. In function definition, arguments are separated by a space. The function body must be a single line, and whatever that line produces is what gets returned. When calling a function, however, arguments are separated by a comma.

    Ready> def adder(a b) a+b
    Ready> adder(1,2)

### Externs

Externs are declared and called just like functions. The only difference is that they are declared using the `extern` keyword instead the `def` keyword, and they do not have a function body.

    Ready> extern cos(a)
    Ready> cos(1)


The Code
--------

Here's what each file does.

### Lexer & Parser

`lexer.ts` contains the tokens and lexer that the calculator uses. `parser.ts` contains the parser. Neither uses node-llvmc. Both are based on the lexer and parser given in [Kaleidoscope][].

### AST

`ast.ts` defines the abstract syntax tree for the calculator language. The majority of our use of node-llvmc happens here. As in [Kaleidoscope][], each AST node has a `codegen()` that generates LLVM IR.

Our node-llvmc function names are sometimes a bit different from the C++ LLVM function calls in the Kaleidoscope tutorials (i.e., different names or different parameters), but they shouldn't be too hard to decipher.

### Main Driver

`calculator.ts` is the driver for the calculator.

It is also where the `Context` class is defined, which you will see being used a lot in `ast.ts`. A `Context` object is a wrapper around an node-llvmc `Module` object, an node-llvmc `Builder` object, and a map that maps identifiers to node-llvmc `Value` objects. See `wrapped.ts` in the library for more information on these node-llvmc objects.
