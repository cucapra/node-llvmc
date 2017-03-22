Calculator Example
==================

This is an example usage of node-llvmc based on the first three chapters of the [LLVM Kaleidoscope Tutorial]. 

Our implementation is very similar to theirs minus trivial differences (e.g. they support comments, but we do not; wecheck whether numbers have too many decimal points, but they do not). As such, taking a look at the tutorial linked above should give you a good idea of what the calculator can do and how it works. We will give a brief overview here as well though.

Usage
-----
If you followed the node-llvmc's set-up instructions, you should be able to run the calculator by navigating to the build folder and using the following command: 

```shell
node example/calculator.js
```

You should now be prompted to enter commands. Our calculator currently supports supports arithmetic operation (except division), function definitions, function calls, and externs. Below we give some example programs. Note that after each command, the calculator will print the entire current LLVM IR you've created thus far.

To exit the calculator, just type `quit` into the prompt.

### Arithmetic
We support addition, subtraction, multiplication, and parentheses. All numbers are treated as floating point values.

```shell
Ready> (2+5)*(7-1)
Read top-level expression:
; ModuleID = 'calculator_module'

define float @0() {
entry:
  ret float 4.200000e+01
}
```
### Function Definitions/Calls
Functions are defined using the keyword `def`. In function definition, arguments are separated by a space. The function body must be a single line, and whatever that line produces is what gets returned. When calling a function, however, arguments must be separated by a comma.

```shell
Ready> def adder(a b) a+b
Read function definition:
; ModuleID = 'calculator_module'

define float @adder(float %a, float %b) {
entry:
  %addtmp = fadd float %a, %b
  ret float %addtmp
}



Ready> adder(1,2)
Read top-level expression:
; ModuleID = 'calculator_module'

define float @adder(float %a, float %b) {
entry:
  %addtmp = fadd float %a, %b
  ret float %addtmp
}

define float @0() {
entry:
  %calltmp = call float @adder(float 1.000000e+00, float 2.000000e+00)
  ret float %calltmp
}
```

### Externs
Externs are declared and called just like functions. The only difference is that they are declared using the `extern` keyword instead the `def` keyword, and they do not have a function body.

```shell
Ready> extern cos(a)
Read extern:
; ModuleID = 'calculator_module'

declare float @cos(float)



Ready> cos(1)
Read top-level expression:
; ModuleID = 'calculator_module'

declare float @cos(float)

define float @0() {
entry:
  %calltmp = call float @cos(float 1.000000e+00)
  ret float %calltmp
}
```

In This Repo
------------
Here we provide a short description of the files in this folder.

### lexer.ts and parser.ts
The lexer.ts file contains the tokens and lexer that the calculator uses. The parser.ts file contains the parser. Neither of these files make use of node-llvmc. Both are based on the lexer and parser given in the [LLVM Kaleidoscope Tutorial], so for more information we recommend taking a look there

### ast.ts
This file constains the Abstract Syntax Tree. The majority of our use of node-llvmc is located here, so to see examples of node-llvmc, this is probably the best place to look. 

To keep our example similar to the [LLVM Kaleidoscope Tutorial], we also do not use the visitor pattern for code generation. Instead, each AST Node contains a `codegen()` method which generates code through node-llvmc. 

The main difference between our version and the Kaleidoscope tutorial is that some of our LLVM function calls are a bit different than theirs (i.e. different names or different parameters); however, they are similar enough that the reader shouldn't have too much trouble rectifying these minor differences.

### calculator.ts
This is the driver for the calculator. 

It is also where the `Context` class is defined (which you will see being quite often inside of ast.ts). A `Context` object is merely a wrapper around the following: an node-llvmc `Module` object, an node-llvmc `Builder` object, and map that maps identifiers to node-llvmc `Value` object. See wrapped.ts for more information on the aforementioned node-llvmc objects.

[LLVM Kaleidoscope Tutorial]: http://llvm.org/docs/tutorial/LangImpl01.html
