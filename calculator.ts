import * as llvmc from './src/wrapped';
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
}

interface ExprAST extends ASTNode{
	id: string; 
	codegen() : llvmc.Value; 
};

class NullExprAST implements ExprAST {
	public id: string = 'NullExprAST';
	public codegen() : llvmc.Value { 
		throw "null exception"
	}
}

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
		throw "not implemented yet"
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
};

/// FunctionAST - This class represents a function definition itself.
class FunctionAST implements ASTNode {
	public id: string = 'FunctionAST';
  public proto: PrototypeAST;
  public body: ExprAST;

	public constructor(proto: PrototypeAST, body: ExprAST) {
		this.proto = name;
		this.body = body;
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
function parseNumberExpr(): ExprAST {
  let result: ExprAST = new NumberExprAST(numVal);
  getNextToken(); // consume the number
  return result;
};

/// parenexpr ::= '(' expression ')'
function parseParenExpr() : ExprAST {
	getNextToken(); // eat (.
	  
	let v: ExprAST = parseExpression();
	if (v instanceof NullExprAST)
	  	return new NullExprAST();

	if (curTok.id !== ')')
	   	throw 'mismatch parens';

	getNextToken(); // eat ).
	return v;
};

/// identifierexpr
///   ::= identifier
function parseIdentifierExpr() : ExprAST {
	// let idName: string = idStr;
	// getNextToken();  // eat identifier.
	// return new VariableExprAST(idName);

	let idName: string = idStr;

  getNextToken();  // eat identifier.
  
  if (curTok.id !== '(') // Simple variable ref.
    return new VariableExprAST(idName);

  // Call.
  getNextToken();  // eat (
  let args: ExprAST[] = [];

  if (curTok.id !== '(') {
    while (true) {
    	let arg = parseExpression();
      
      if (!(arg instanceof NullExprAST))
        args.concat(arg);
      else
        return new NullExprAST;

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
function parsePrimary() : ExprAST {
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
function parseBinOpRHS (exprPrec: number, left: ExprAST) : ExprAST  {
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
    let right: ExprAST = parsePrimary();
    if (right instanceof NullExprAST)
      return new NullExprAST();

    // If BinOp binds less tightly with RHS than the operator after RHS, let
    // the pending operator take RHS as its LHS.
    let nextPrec: number = getTokPrecedence();
    if (tokPrec < nextPrec) {
      right = parseBinOpRHS(tokPrec + 1, right);
      if (right instanceof NullExprAST)
        return new NullExprAST();
    }

    // Merge LHS/RHS.
    left = new BinaryExprAST(binOp, left, right);
  }
}

/// expression
///   ::= primary binoprhs
///
function parseExpression() : ExprAST {
	let left : ExprAST = parsePrimary();
  if (left instanceof NullExprAST)
		return new NullExprAST();

  return parseBinOpRHS(0, left);
};

/// prototype
///   ::= id '(' id* ')'
function parsePrototype() : PrototypeAST {
  if (!(curTok instanceof Tok_Id))
    throw "Expected function name in prototype";

  let fnName: string = idStr;
  getNextToken();

  if (curTok.id !== '(')
    throw "Expected '(' in prototype";

  // Read the list of argument names.
 	let argNames: string[] = [];
  while (getNextToken() instanceof Tok_Id)
    argNames.concat(idStr);
  
  if (curTok.id !== ')')
    throw "Expected ')' in prototype";

  // success.
  getNextToken();  // eat ')'.

  return new PrototypeAST(fnName, argNames);
};

/// definition ::= 'def' prototype expression
function parseDefinition() : FunctionAST {
  getNextToken();  // eat def.
  let proto: PrototypeAST = parsePrototype();
  //if (!proto) return nullptr;

  let exp: ExprAST = parseExpression();
  if (!(exp instanceof NullExprAST))
    return new FunctionAST(proto, exp);
  //return nullptr;
 	throw "handle nullptrs better"
};

/// external ::= 'extern' prototype
function ParseExtern() : PrototypeAST {
  getNextToken();  // eat extern.
  return parsePrototype();
};

/// toplevelexpr ::= expression
function parseTopLevelExpr() : FunctionAST {
	let exp: ExprAST = parseExpression();
  if (!(exp instanceof NullExprAST)) {
    // Make an anonymous proto.
    let proto: PrototypeAST = new PrototypeAST("", []);
    return new FunctionAST(proto, exp);
  }
  throw "handle nullptrs better"
}

/////////////////////////////////////////////////
// Top Level
/////////////////////////////////////////////////

function handleExpression() : llvmc.Value {
	let expr : ExprAST = parseExpression();
	return expr.codegen();
}

/// top ::= definition | external | expression | ';'
// function MainLoop() : void {
//   while (1) {
//     fprintf(stderr, "ready> ");
//     switch (CurTok) {
//     	case tok_eof:
//       	return;
//     	case ';': // ignore top-level semicolons.
//       	getNextToken();
//       	break;
//     	case tok_def:
//       	HandleDefinition();
//       	break;
//     	case tok_extern:
//       	HandleExtern();
//       	break;
//     	default:
//       	HandleTopLevelExpression();
//       	break;
//     }
//   }
// }

function main() : void {
 	prog = process.argv[2];
  	console.log('program: ' + prog);

  	// create func
	let funcType = llvmc.FunctionType.create(llvmc.Type.float(), []);
	let func = mod.addFunction("func", funcType);

	// position builder inside function
	let entry = func.appendBasicBlock("entry");
	builder.positionAtEnd(entry);
  	
  	// run calculator and set func's return value to the result
  	getNextToken();
  	let retVal: llvmc.Value = handleExpression();
	builder.ret(retVal);

  	// Dump the IR as bitcode to disk.
	let err = mod.writeBitcodeToFile("out.bc");
	if (err) {
  		console.error("write failed", err);
	}

	// Write the IR as text to the console.
	console.log(mod.toString());
};
main();
builder.free();
mod.free();






















