import * as llvmc from '../lib/wrapped';
import * as readline from 'readline';
import * as ast from './ast';
import * as parser from './parser';
import * as lexer from './lexer';

/////////////////////////////////////////////////
// Top Level
/////////////////////////////////////////////////

/*
 * Wrapper for various constructs that must be passed around
 */
export class Context {
  public mod: llvmc.Module;
  public builder: llvmc.Builder;
  public namedValues: {[id:string] : llvmc.Value};

  constructor(mod: llvmc.Module, builder: llvmc.Builder, namedValues: {[id:string] : llvmc.Value} = {}) {
    this.mod = mod;
    this.builder = builder;
    this.namedValues = namedValues;
  }

  public free() {
    this.builder.free();
    this.mod.free();
  }
}

function handleDefinition(context: Context) : void {
  let funcAST: ast.FunctionAST|null = parser.parseDefinition();
  if (funcAST) {
    let funcIR: llvmc.Function = funcAST.codegen(context);
    console.log("Read function definition:");
    console.log(context.mod.toString());
    console.log("\n");
  } else {
    // Skip token for error recovery.
    parser.getNextToken();
  }
}

function handleExtern(context: Context) : void {
  let protoAST: ast.PrototypeAST|null = parser.parseExtern();
  if (protoAST) {
    let funcIR: llvmc.Function = protoAST.codegen(context);
    console.log("Read extern:");
    console.log(context.mod.toString());
    console.log("\n");
  } else {
    // Skip token for error recovery.
    parser.getNextToken();
  }
}

function handleTopLevelExpression(context: Context) : void {
  // Evaluate a top-level expression into an anonymous function.
  let funcAST: ast.FunctionAST|null = parser.parseTopLevelExpr();
  if (funcAST) {
    let funcIR: llvmc.Function = funcAST.codegen(context);
    console.log("Read top-level expression:");
    console.log(context.mod.toString());
    console.log("\n");
  } else {
    // Skip token for error recovery.
    parser.getNextToken();
  }
}

/*
 * Read line from cmd line and produce LLVM IR
 */
function read() : void {
  let context: Context = new Context(llvmc.Module.create('calculator_module'), llvmc.Builder.create());
  let rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
  });

  rl.setPrompt('Ready> ');
  rl.prompt();
  rl.on('line', function(line) {
    if (line === "quit") {
      rl.close();
    }
    else if (line !== "") {
      lexer.reset(line);
      parser.getNextToken();
      mainLoop(context);
    }
    rl.prompt();
  }).on('close',function(){
    context.free();
    process.exit(0);
  });
}

/// top ::= definition | external | expression | ';'
function mainLoop(context: Context) : void {
  switch (parser.getCurTokID()) {
    case 'Tok_Eof':
      return;
    case ';': // ignore top-level semicolons.
      parser.getNextToken();
      break;
    case 'Tok_Def':
      handleDefinition(context);
      break;
    case 'Tok_Ext':
      handleExtern(context);
      break;
    default:
      handleTopLevelExpression(context);
      break;
  }
}

read();
