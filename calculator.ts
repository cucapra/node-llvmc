import * as llvmc from './src/wrapped';
let mod = llvmc.Module.create('calculator_module');
let builder = llvmc.Builder.create();

let prog: string; // program to run
let idx: number = 0; // where we are in program
let EOF: string = ''; 

/*
 * Read and return next char of program (return EOF if at end of program)
 */
function getChar() : string {
	if (idx < prog.length) {
		let result: string = prog.charAt(idx);
		idx += 1;
		return result;
	}
	return EOF;
};

///////////////////////////////////////
// Tokens
///////////////////////////////////////
interface Token {
	id : string;
};

class Tok_Eof implements Token {
	public id: string = 'Tok_Eof';
};

class Tok_Number implements Token {
	public id: string = 'Tok_Number';
};

// other
class Tok_Other implements Token {
	public id: string;

	public constructor(id: string) {this.id = id;}
};

///////////////////////////////////////
// Lexer
///////////////////////////////////////
let idStr: string; // filled in if tok_identifier
let numVal: number; // filled in if tok_number

function isAlpha(str : string) : boolean {
  return str.length === 1 && str.match(/[a-z]/i) !== null;
};

function isAlNum(str : string) : boolean {
	return str.length === 1 && str.match(/[a-z0-9]/i) !== null;
};

function isDigit(str : string) : boolean {
	return str.length === 1 && str.match(/[0-9]/i) !== null;
};

function getTok() : Token {
	let lastChar : string = ' ';

	// skip whitespace
	while (lastChar === ' ') 
		lastChar = getChar();
	
	// number: [0-9.]+
	if (isDigit(lastChar) || lastChar === '.') { 
  		let numStr : string = '';
  		do {
    		numStr += lastChar;
    		lastChar = getChar();
  		} while (isDigit(lastChar) || lastChar === '.');

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
interface ExprAST{
	id: string;
	codegen() : llvmc.Value;
};

class NullExprAST implements ExprAST {
	public id: string = 'NullExprAST';
	public codegen() : llvmc.Value { return llvmc.constInt(0, llvmc.Type.int1());}
}

/// NumberExprAST - Expression class for numeric literals like "1.0".
class NumberExprAST implements ExprAST {
	public id: string = 'NumberExprAST';
  	public val: number;
	
	public constructor(val: number) {this.val = val;}

	public codegen() : llvmc.Value {
		return llvmc.constFloat(this.val, llvmc.Type.double());
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

  		//if (!L || !R)
    	//	return nullptr;

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
	if (v.id === 'NullExprAST')
	  	return new NullExprAST();

	if (curTok.id !== ')')
	   	throw 'mismatch parens';

	getNextToken(); // eat ).
	return v;
};

/// primary
///   ::= identifierexpr
///   ::= numberexpr
///   ::= parenexpr
function parsePrimary() : ExprAST {
  	switch (curTok.id) {
  		//case 'Tok_Identifier':
    	//	return parseIdentifierExpr();
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
	if (!(curTok instanceof Tok_Other))
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
    if (right.id === 'NullExprAST')
      return new NullExprAST();

    // If BinOp binds less tightly with RHS than the operator after RHS, let
    // the pending operator take RHS as its LHS.
    let nextPrec: number = getTokPrecedence();
    if (tokPrec < nextPrec) {
      right = parseBinOpRHS(tokPrec + 1, right);
      if (right.id === 'NullExprAST')
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
  	if (left.id === 'NullExprAST')
		return new NullExprAST();

  	return parseBinOpRHS(0, left);
};

/////////////////////////////////////////////////
// Top Level
/////////////////////////////////////////////////

function handleExpression() : llvmc.Value {
	let expr : ExprAST = parseExpression();
	if (expr.id !== 'NullExprID') {
		return expr.codegen();
	}
	else {
		getNextToken();
		return llvmc.constFloat(0, llvmc.Type.float());
	}
}

function main() : void {
 	prog = process.argv[2];
  	console.log('program: ' + prog);

	let funcType = llvmc.FunctionType.create(llvmc.Type.float(), []);
	let mainFunc = mod.addFunction("main", funcType);

	let entry = mainFunc.appendBasicBlock("entry");
	builder.positionAtEnd(entry);
  	
  	getNextToken();
  	//mainLoop();
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






















