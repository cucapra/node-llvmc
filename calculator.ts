import * as llvmc from './src/wrapped';

let mod = llvmc.Module.create('some_module');
let builder = llvmc.Builder.create();

// static LLVMContext TheContext;
// static IRBuilder<> Builder(TheContext);
// static std::unique_ptr<Module> TheModule;
// static std::map<std::string, Value *> NamedValues;

// program
let prog: string;
let idx: number = 0;
let EOF: string = '';

function getChar() : string {
	if (idx < prog.length) {
		let result: string = prog.charAt(idx);
		idx += 1;
		return result;
	}
	return '';
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

// commands
// class Tok_Def implements Token {
// 	public id: string = 'Tok_Def';
// };

//class Tok_Extern implements Token {
//	public id: string = 'Tok_Extern';
//};

// primary
// class Tok_Identifier implements Token {
// 	public id: string = 'Tok_Identifier';
// };

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

	// identifier: [a-zA-Z][a-zA-Z0-9]*
	// if (isAlpha(lastChar)) { 
	//   idStr = lastChar;
	//   while (isAlNum((lastChar = getChar())))
	//     idStr += lastChar;

	//   if (idStr === "def")
	//     return new Tok_Def();
	//    if (idStr == "extern")
	//      return new Tok_Extern();
	//   return new Tok_Identifier();
	// } 
	
	// number: [0-9.]+
	if (isDigit(lastChar) || lastChar === '.') { 
  		let numStr : string = '';
  		do {
    		numStr += lastChar;
    		lastChar = getChar();
  		} while (isDigit(lastChar) || lastChar === '.');

  		let numVal = parseFloat(numStr);
  		return new Tok_Number();
	}
	
	// handle comments
	if (lastChar === '#') {
	  // Comment goes to end of line.
	  do {
	    lastChar = getChar();
	  } while (lastChar !== EOF && lastChar != '\n' && lastChar != '\r');
	  	
	  	if (lastChar !== EOF)
	    	return getTok();
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

/// VariableExprAST - Expression class for referencing a variable, like "a".
// class VariableExprAST implements ExprAST {
// 	public id: string = 'NumberExprAST';
//   	public name: string;

// 	public constructor(name: string) {this.name = name;}
// };

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
				return builder.addf(lVal, rVal, 'sum');
			case '-':
		   		return builder.subf(L, R, "subtmp");
		  	case '*':
		   		return builder.mulf(L, R, "multmp");
		  	// case '<':
		   //  	L = Builder.CreateFCmpULT(L, R, "cmptmp");
		   //  	// Convert bool 0/1 to double 0.0 or 1.0
		   //  	return Builder.CreateUIToFP(L, Type::getDoubleTy(TheContext), "booltmp");
		  	default:
		    	throw "invalid binary operator";
		}
	}
};

// /// CallExprAST - Expression class for function calls.
// class CallExprAST implements ExprAST {
// 	public id: string = 'CallExprAST';
//   	public callee: string;
//   	public args: ExprAST[];

// 	public constructor(callee: string, args: ExprAST[]) {
// 		this.callee = callee;
// 		this.args = args;
// 	}
// };

// /// PrototypeAST - This class represents the "prototype" for a function,
// /// which captures its name, and its argument names (thus implicitly the number
// /// of arguments the function takes).
// class PrototypeAST implements ExprAST {
//   	public id: string = 'PrototypeAST'
//   	public name: string;
//   	public args: string[];

// 	public constructor(name: string, args: string[]) {
// 		this.name = name;
// 		this.args = args;
// 	}
// };

// /// FunctionAST - This class represents a function definition itself.
// class FunctionAST implements ExprAST {
// 	public id: string = 'FunctionAST';
//   	public proto: PrototypeAST;
//   	public body: ExprAST;

// 	public constructor(proto: PrototypeAST, body: ExprAST) {
// 		this.proto = proto;
// 		this.body = body;
// 	}
// };

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

/// identifierexpr
///   ::= identifier
///   ::= identifier '(' expression* ')'
// function parseIdentifierExpr() : ExprAST {
// 	let idName: string = idStr;

// 	getNextToken();  // eat identifier.

// 	if (curTok.id !== '(') // Simple variable ref.
// 	   	return new VariableExprAST(idName);
// 	throw 'error';
// 	Call.
// 	getNextToken();  // eat (
// 	std::vector<std::unique_ptr<ExprAST>> Args;
// 	if (CurTok != ')') {
// 	    while (1) {
// 		    if (auto Arg = ParseExpression())
// 	    	    Args.push_back(std::move(Arg));
// 	      	else
// 	        	return nullptr;

// 	     	if (CurTok == ')')
// 	        	break;

// 	      	if (CurTok != ',')
// 	        	return LogError("Expected ')' or ',' in argument list");
// 	      	getNextToken();
// 	    }
// 	}

// 	// Eat the ')'.
// 	getNextToken();

// 	return llvm::make_unique<CallExprAST>(IdName, std::move(Args));
// };

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
let BinopPrecedence = {
	//'<': 10,
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
  		return BinopPrecedence[curTok.id];
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

// /// prototype
// ///   ::= id '(' id* ')'
// static std::unique_ptr<PrototypeAST> ParsePrototype() {
//   if (CurTok != tok_identifier)
//     return LogErrorP("Expected function name in prototype");

//   std::string FnName = IdentifierStr;
//   getNextToken();

//   if (CurTok != '(')
//     return LogErrorP("Expected '(' in prototype");

//   // Read the list of argument names.
//   std::vector<std::string> ArgNames;
//   while (getNextToken() == tok_identifier)
//     ArgNames.push_back(IdentifierStr);
//   if (CurTok != ')')
//     return LogErrorP("Expected ')' in prototype");

//   // success.
//   getNextToken();  // eat ')'.

//   return llvm::make_unique<PrototypeAST>(FnName, std::move(ArgNames));
// }

// /// definition ::= 'def' prototype expression
// static std::unique_ptr<FunctionAST> ParseDefinition() {
//   getNextToken();  // eat def.
//   auto Proto = ParsePrototype();
//   if (!Proto) return nullptr;

//   if (auto E = ParseExpression())
//     return llvm::make_unique<FunctionAST>(std::move(Proto), std::move(E));
//   return nullptr;
// }

// /// external ::= 'extern' prototype
// static std::unique_ptr<PrototypeAST> ParseExtern() {
//   getNextToken();  // eat extern.
//   return ParsePrototype();
// }

// /// toplevelexpr ::= expression
// static std::unique_ptr<FunctionAST> ParseTopLevelExpr() {
//   if (auto E = ParseExpression()) {
//     // Make an anonymous proto.
//     auto Proto = llvm::make_unique<PrototypeAST>("", std::vector<std::string>());
//     return llvm::make_unique<FunctionAST>(std::move(Proto), std::move(E));
//   }
//   return nullptr;
// }

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
// main
/////////////////////////////////////////////////

/// top ::= definition | external | expression | ';'
function mainLoop() : void {
  while (1) {
    console.log("ready> ");
    switch (curTok.id) {
	    case 'Tok_EOF':
	      return;
	    case ';': // ignore top-level semicolons.
	      getNextToken();
	      break;
	    // case tok_def:
	    //   handleDefinition();
	    //   break;
	    // case tok_extern:
	    //   handleExtern();
	    //   break;
	    // default:
	    //   handleTopLevelExpression();
	    //   break;
    }
  };

  function main() : void {
  	console.log("ready>");
  	getNextToken();
  	mainLoop();
  };

  main();
}





















