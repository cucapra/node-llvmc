import * as llvmc from './src/wrapped';
import * as readline from 'readline';

///////////////////////////////////////
// Setup
///////////////////////////////////////
let mod = llvmc.Module.create('calculator_module');
let builder = llvmc.Builder.create();
let NamedValues:{[id:string] : llvmc.Value} = {};

let prog: string; // program to run
let idx: number = 0; // where we are in program
let EOF: string = ''; 

///////////////////////////////////////
// Tokens
///////////////////////////////////////
interface Token {
	id : string;
};

/// Token representing end of file
class Tok_Eof implements Token {
	public id: string = 'Tok_Eof';
};

/// Token representing variable declaration 
class Tok_Def implements Token {
	public id: string = 'Tok_Def';
};

/// Token representing extern
class Tok_Ext implements Token {
	public id: string = 'Tok_Ext'
}

/// Token representing number
class Tok_Number implements Token {
	public id: string = 'Tok_Number';
};

/// Token representing variable identifier
class Tok_Id implements Token {
	public id: string = 'Tok_Id';
};

/// Token representing other things (e.g. parens and operators)
class Tok_Other implements Token {
	public id: string;

	public constructor(id: string) {this.id = id;}
};

///////////////////////////////////////
// Lexer
///////////////////////////////////////
let numVal: number; // filled with last number seen
let idStr: string;  // filled with last variable id seen

/// Read and return next char of program (return EOF if at end of program)
function getChar() : string {
	if (idx < prog.length) {
		let result: string = prog.charAt(idx);
		idx += 1;
		return result;
	}
	return EOF;
};

/// Check if str is a single alphabetic character
function isAlpha(str : string) : boolean {
  return str.length === 1 && str.match(/[a-z]/i) !== null;
};

/// Check if str is a single alphanumeric character
function isAlNum(str : string) : boolean {
	return str.length === 1 && str.match(/[a-z0-9]/i) !== null;
};

/// Check if str is one character and a digit
function isDigit(str : string) : boolean {
	return str.length === 1 && str.match(/[0-9]/i) !== null;
};


/// Retrive the next token
let lastChar: string = ' ';
function getTok() : Token {
	// skip whitespace
	while (lastChar === ' ') 
		lastChar = getChar();
	
	// identifier: [a-zA-Z][a-zA-Z0-9]*
	if (isAlpha(lastChar)) { 
	  idStr = lastChar;
	  while (isAlNum((lastChar = getChar())))
	    idStr += lastChar;

	  if (idStr === "def")
	    return new Tok_Def();
		if (idStr === "extern")
			return new Tok_Ext();
	  return new Tok_Id();
	} 

	// number: [0-9.]+
	let seenDecimal: boolean = false;
	if (isDigit(lastChar) || lastChar === '.') {
  		let numStr : string = '';
  		do {
  			seenDecimal = (lastChar === '.') ? true : seenDecimal;
    		numStr += lastChar;
    		lastChar = getChar();
    		if (lastChar === '.' && seenDecimal) {throw 'Too many decimal points';}
  		} while (isDigit(lastChar) || lastChar === '.');

  		// we have seen a number token, so set numVal
  		numVal = parseFloat(numStr);
  		return new Tok_Number();
	}
	
	// check for end of file
	if (lastChar === EOF)
		return new Tok_Eof();

	// Otherwise, just return the character as its ascii value
	let thisChar : string = lastChar;
	lastChar = getChar();
	return new Tok_Other(thisChar);
};

/////////////////////////////////////
// AST
////////////////////////////////////
interface ASTNode {
	id: string; // type of node
	codegen(): any;
}

interface ExprAST extends ASTNode{
	id: string; 
	codegen() : llvmc.Value; 
};

/// VariableExprAST - Expression class for referencing a variable, like "a".
class VariableExprAST implements ExprAST {
	public id: string = 'NumberExprAST';
  	public name: string;

	public constructor(name: string) {this.name = name;}

	public codegen() : llvmc.Value {
  		// Look this variable up in the function.
  		if (!NamedValues.hasOwnProperty(this.name))
    		throw 'unknown variable access'
  		return NamedValues[this.name];
	}
};

/// NumberExprAST - Expression class for numeric literals like "1.0".
class NumberExprAST implements ExprAST {
	public id: string = 'NumberExprAST';
  	public val: number;
	
	public constructor(val: number) {this.val = val;}

	public codegen() : llvmc.Value {
		return llvmc.constFloat(this.val, llvmc.Type.float());
	}
};

/// BinaryExprAST - Expression class for a binary operator.
class BinaryExprAST implements ExprAST {
		public id: string = 'BinaryExprAST';
  	public op: string;
  	public left: ExprAST;
  	public right: ExprAST;

	public constructor(op: string, left: ExprAST, right: ExprAST) {
		this.op = op;
		this.left = left;
		this.right = right;
	}

	public codegen() : llvmc.Value {
		let lVal: llvmc.Value = this.left.codegen();
		let rVal: llvmc.Value = this.right.codegen();

    if (lVal.ref.isNull() || rVal.ref.isNull())
      throw "null exception"

		switch (this.op) {
			case '+':
				return builder.addf(lVal, rVal, 'addtmp');
			case '-':
		   	return builder.subf(lVal, rVal, 'subtmp');
		  case '*':
		   	return builder.mulf(lVal, rVal, 'multmp');
		  default:
		    throw "invalid binary operator";
		}
	}
};

/// CallExprAST - Expression class for function calls.
class CallExprAST implements ExprAST {
	public id: string = 'CallExprAST';
  public callee: string;
  public args: ExprAST[];

	public constructor(callee: string, args: ExprAST[]) {
    this.callee = callee;
    this.args = args;
	}

	public codegen() : llvmc.Value {
		// Look up the name in the global module table.
  	let calleeFunc: llvmc.Function = mod.getFunction(this.callee);
  	if (calleeFunc.ref.isNull())
    	throw "unknown function referenced";

  	// If argument mismatch error.
  	if (calleeFunc.countParams() != this.args.length)
     	throw "Incorrect # arguments passed";

  	let argsV: llvmc.Value[] = [];
  	for (let i = 0; i != this.args.length; ++i) {
    	argsV.push(this.args[i].codegen());
    	if (argsV[argsV.length - 1].ref.isNull())
      	throw "null exception"
  	}

  	return builder.buildCall(calleeFunc, argsV, "calltmp");
	}
};

/// PrototypeAST - This class represents the "prototype" for a function,
/// which captures its name, and its argument names (thus implicitly the number
/// of arguments the function takes).
class PrototypeAST implements ASTNode {
	public id: string = 'PrototypeAST';
  public name: string;
  public args: string[];

	public constructor(name: string, args: string[]) {
		this.name = name;
		this.args = args;
	}

	public codegen() : llvmc.Function {
		// Make the function type:  double(double,double) etc.
		let floats: llvmc.Type[] = [];
		for (let i = 0; i < this.args.length; i++)
			floats.push(llvmc.Type.float());
  	let ft: llvmc.FunctionType = llvmc.FunctionType.create(llvmc.Type.float(), floats, false);

  	let func: llvmc.Function = mod.addFunction(this.name, ft);

  	// Set names for all arguments.
    let i = 0;
    for (let param of func.params()) {
  		param.setName(this.args[i]);
      ++i;
  	}

  	return func;
	}
};

/// FunctionAST - This class represents a function definition itself.
class FunctionAST implements ASTNode {
	public id: string = 'FunctionAST';
  public proto: PrototypeAST;
  public body: ExprAST;

	public constructor(proto: PrototypeAST, body: ExprAST) {
		this.proto = proto;
		this.body = body;
	}

	public codegen() : llvmc.Function {
		// First, check for an existing function from a previous 'extern' declaration.
		let func: llvmc.Function = mod.getFunction(this.proto.name);

  	if (func.ref.isNull())
    	func = this.proto.codegen();

  	if (func.ref.isNull())
    	throw "null exception";

  	// Create a new basic block to start insertion into.
  	let bb: llvmc.BasicBlock = func.appendBasicBlock("entry");
  	builder.positionAtEnd(bb);

  	// Record the function arguments in the NamedValues map.

  	NamedValues = {};
    for (let param of func.params()) {
  		NamedValues[param.getName()] = param;
  	}

  	let retVal: llvmc.Value = this.body.codegen();
  	if (!retVal.ref.isNull()) {
    	// Finish off the function.
    	builder.ret(retVal);
    	return func;
  	}

  	// Error reading body, remove function.
  	func.deleteFromParent();
		throw "null exception"
	}
};

////////////////////////////////////////////////
// Parser
////////////////////////////////////////////////

/// CurTok/getNextToken - Provide a simple token buffer.  CurTok is the current
/// token the parser is looking at.  getNextToken reads another token from the
/// lexer and updates CurTok with its results.
let curTok: Token;
function getNextToken() : Token {
	curTok = getTok();
  	return curTok;
};

/// numberexpr ::= number
function parseNumberExpr(): ExprAST|null {
  let result: ExprAST = new NumberExprAST(numVal);
  getNextToken(); // consume the number
  return result;
};

/// parenexpr ::= '(' expression ')'
function parseParenExpr() : ExprAST|null {
	getNextToken(); // eat (.
	  
	let v: ExprAST|null = parseExpression();
	if (!v)
	  	return null;

	if (curTok.id !== ')')
	   	throw 'mismatch parens';

	getNextToken(); // eat ).
	return v;
};

/// identifierexpr
///   ::= identifier
function parseIdentifierExpr() : ExprAST|null {
	let idName: string = idStr;

  getNextToken();  // eat identifier.
  
  if (curTok.id !== '(') // Simple variable ref.
    return new VariableExprAST(idName);

  // Call.
  getNextToken();  // eat (
  let args: ExprAST[] = [];

  if (curTok.id !== '(') {
    while (true) {
    	let arg: ExprAST|null = parseExpression();
      
      if (arg)
        args.push(arg);
      else
        return null;

      if (curTok.id == ')')
        break;

      if (curTok.id != ',')
        throw "Expected ')' or ',' in argument list";
      
      getNextToken();
    }
  }

  // Eat the ')'.
  getNextToken();
  return new CallExprAST(idName, args);
};

/// primary
///   ::= numberexpr
///   ::= parenexpr
function parsePrimary() : ExprAST|null {
  	switch (curTok.id) {
  		case 'Tok_Id':
    		return parseIdentifierExpr();
  		case 'Tok_Number':
   			return parseNumberExpr();
  		case '(':
    		return parseParenExpr();
    	default:
    		throw 'unknown token';
  	}
};

/// BinopPrecedence - This holds the precedence for each binary operator that is
/// defined.
let BinopPrecedence:{ [op:string] : number } = {
	'+': 20,
	'-': 20,
	'*': 40,
};

/// GetTokPrecedence - Get the precedence of the pending binary operator token.
function getTokPrecedence() : number {
	if (curTok instanceof Tok_Eof)
		return -1;

  // Make sure it's a declared binop.
  if (BinopPrecedence.hasOwnProperty(curTok.id))
  	return Number(BinopPrecedence[curTok.id]);
  return -1;
}

/// binoprhs
///   ::= ('+' primary)*
function parseBinOpRHS (exprPrec: number, left: ExprAST) : ExprAST|null  {
  // If this is a binop, find its precedence.
  while (true) {
    let tokPrec: number = getTokPrecedence();

    // If this is a binop that binds at least as tightly as the current binop,
    // consume it, otherwise we are done.
    if (tokPrec < exprPrec)
      return left;

    // Okay, we know this is a binop.
    let binOp: string = curTok.id;
    getNextToken(); // eat binop

    // Parse the primary expression after the binary operator.
    let right: ExprAST|null = parsePrimary();
    if (!right)
      return null;

    // If BinOp binds less tightly with RHS than the operator after RHS, let
    // the pending operator take RHS as its LHS.
    let nextPrec: number = getTokPrecedence();
    if (tokPrec < nextPrec) {
      right = parseBinOpRHS(tokPrec + 1, right);
      if (!right)
        return null;
    }

    // Merge LHS/RHS.
    left = new BinaryExprAST(binOp, left, right);
  }
}

/// expression
///   ::= primary binoprhs
///
function parseExpression() : ExprAST|null {
	let left : ExprAST|null = parsePrimary();
  if (!left)
		return null;

  return parseBinOpRHS(0, left);
};

/// prototype
///   ::= id '(' id* ')'
function parsePrototype() : PrototypeAST|null {
  if (!(curTok instanceof Tok_Id))
    throw "Expected function name in prototype";

  let fnName: string = idStr;
  getNextToken();

  if (curTok.id !== '(')
    throw "Expected '(' in prototype";

  // Read the list of argument names.
 	let argNames: string[] = [];
  while (getNextToken() instanceof Tok_Id)
    argNames.push(idStr);
  
  if (curTok.id !== ')')
    throw "Expected ')' in prototype";

  // success.
  getNextToken();  // eat ')'.

  return new PrototypeAST(fnName, argNames);
};

/// definition ::= 'def' prototype expression
function parseDefinition() : FunctionAST|null {
  getNextToken();  // eat def.
  let proto: PrototypeAST|null = parsePrototype();
  if (!proto) 
    return null;

  let exp: ExprAST|null = parseExpression();
  if (exp)
    return new FunctionAST(proto, exp);
  return null;
};

/// external ::= 'extern' prototype
function parseExtern() : PrototypeAST|null {
  getNextToken();  // eat extern.
  return parsePrototype();
};

/// toplevelexpr ::= expression
function parseTopLevelExpr() : FunctionAST|null {
	let exp: ExprAST|null = parseExpression();
  if (exp) {
    // Make an anonymous proto.
    let proto: PrototypeAST = new PrototypeAST("", []);
    return new FunctionAST(proto, exp);
  }
  return null;
}

/////////////////////////////////////////////////
// Top Level
/////////////////////////////////////////////////

function handleDefinition() : void {
	let funcAST: FunctionAST|null = parseDefinition();
  if (funcAST) {
  	let funcIR: llvmc.Function = funcAST.codegen();
    console.log("Read function definition:");
    console.log(mod.toString());
    console.log("\n");
  } else {
    // Skip token for error recovery.
    getNextToken();
  }
}

function handleExtern() : void {
	let protoAST: PrototypeAST|null = parseExtern();
  if (protoAST) {
  	let funcIR: llvmc.Function = protoAST.codegen();
    console.log("Read extern:");
    console.log(mod.toString());
    console.log("\n");
  } else {
    // Skip token for error recovery.
    getNextToken();
  }
}

function handleTopLevelExpression() : void {
  // Evaluate a top-level expression into an anonymous function.
  let funcAST: FunctionAST|null = parseTopLevelExpr();
  if (funcAST) {
  	let funcIR: llvmc.Function = funcAST.codegen();
    console.log("Read top-level expression:");
    console.log(mod.toString());
    console.log("\n");
  } else {
    // Skip token for error recovery.
    getNextToken();
  }
}

/// Reader line from cmd line
function read() : void {
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
      lastChar = ' ';
      idx = 0;
    	prog = line;
    	console.log("Program: " + prog + "\n");
    	getNextToken();
    	mainLoop();
    }
    rl.prompt();
	}).on('close',function(){
    builder.free();
    mod.free();
    process.exit(0);
	});
}

/// top ::= definition | external | expression | ';'
function mainLoop() : void {
    switch (curTok.id) {
    	case 'Tok_Eof':
      	return;
    	case ';': // ignore top-level semicolons.
      	getNextToken();
      	break;
    	case 'Tok_Def':
      	handleDefinition();
      	break;
    	case 'Tok_Extern':
      	handleExtern();
      	break;
    	default:
      	handleTopLevelExpression();
      	break;
    }
}

read();





















