import * as llvmc from '../../lib/wrapped';
import * as readline from 'readline';
import * as ast from './ast';
import * as lexer from './lexer';

////////////////////////////////////////////////
// Parser
////////////////////////////////////////////////

/*
 * CurTok/getNextToken - Provide a simple token buffer.  CurTok is the current
 * token the parser is looking at.  getNextToken reads another token from the
 * lexer and updates CurTok with its results.
 */
let curTok: lexer.Token;
export function getNextToken() : lexer.Token {
  curTok = lexer.getTok();
  return curTok;
};

/*
 * Retrieve the id of the current token
 */
export function getCurTokID() : string {
  return curTok.id;
}

/*
 * numberexpr ::= number
 */
export function parseNumberExpr(): ast.ExprAST|null {
  let result: ast.ExprAST = new ast.NumberExprAST(lexer.getNumVal());
  getNextToken(); // consume the number
  return result;
};

/*
 * parenexpr ::= '(' expression ')'
 */
export function parseParenExpr() : ast.ExprAST|null {
  getNextToken(); // eat (.

  let v: ast.ExprAST|null = parseExpression();
  if (!v)
      return null;

  if (curTok.id !== ')')
      throw 'mismatch parens';

  getNextToken(); // eat ).
  return v;
};

/*
 * identifierexpr
 *   ::= identifier
 *   ::= identifier '(' expression* ')'
 */
export function parseIdentifierExpr() : ast.ExprAST|null {
  let idName: string = lexer.getIdStr();

  getNextToken();  // eat identifier.

  if (curTok.id !== '(') // Simple variable ref.
    return new ast.VariableExprAST(idName);

  // Call.
  getNextToken();  // eat (
  let args: ast.ExprAST[] = [];

  if (curTok.id !== '(') {
    while (true) {
      let arg: ast.ExprAST|null = parseExpression();

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
  return new ast.CallExprAST(idName, args);
};

/*
 * primary
 *   ::= identifierexpr
 *   ::= numberexpr
 *   ::= parenexpr
*/
export function parsePrimary() : ast.ExprAST|null {
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

/*
 * BinopPrecedence - This holds the precedence for each binary operator that is
 * defined.
 */
let BinopPrecedence:{ [op:string] : number } = {
  '+': 20,
  '-': 20,
  '*': 40,
};

/*
 * GetTokPrecedence - Get the precedence of the pending binary operator token.
 */
function getTokPrecedence() : number {
  if (curTok instanceof lexer.Tok_Eof)
    return -1;

  // Make sure it's a declared binop.
  if (BinopPrecedence.hasOwnProperty(curTok.id))
    return Number(BinopPrecedence[curTok.id]);
  return -1;
}

/*
 * binoprhs
 *   ::= ('+' primary)*
 */
export function parseBinOpRHS (exprPrec: number, left: ast.ExprAST) : ast.ExprAST|null  {
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
    let right: ast.ExprAST|null = parsePrimary();
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
    left = new ast.BinaryExprAST(binOp, left, right);
  }
}

/*
 * expression
 *   ::= primary binoprhs
 */
export function parseExpression() : ast.ExprAST|null {
  let left : ast.ExprAST|null = parsePrimary();
  if (!left)
    return null;

  return parseBinOpRHS(0, left);
};

/*
 * prototype
 *   ::= id '(' id* ')'
 */
export function parsePrototype() : ast.PrototypeAST|null {
  if (!(curTok instanceof lexer.Tok_Id))
    throw "Expected function name in prototype";

  let fnName: string = lexer.getIdStr();
  getNextToken();

  if (curTok.id !== '(')
    throw "Expected '(' in prototype";

  // Read the list of argument names.
  let argNames: string[] = [];
  while (getNextToken() instanceof lexer.Tok_Id)
    argNames.push(lexer.getIdStr());

  if (curTok.id !== ')')
    throw "Expected ')' in prototype";

  // success.
  getNextToken();  // eat ')'.

  return new ast.PrototypeAST(fnName, argNames);
};

/*
 * definition ::= 'def' prototype expression
 */
export function parseDefinition() : ast.FunctionAST|null {
  getNextToken();  // eat def.
  let proto: ast.PrototypeAST|null = parsePrototype();
  if (!proto)
    return null;

  let exp: ast.ExprAST|null = parseExpression();
  if (exp)
    return new ast.FunctionAST(proto, exp);
  return null;
};

/*
 * external ::= 'extern' prototype
 */
export function parseExtern() : ast.PrototypeAST|null {
  getNextToken();  // eat extern.
  return parsePrototype();
};

/*
 * toplevelexpr ::= expression
 */
export function parseTopLevelExpr() : ast.FunctionAST|null {
  let exp: ast.ExprAST|null = parseExpression();
  if (exp) {
    // Make an anonymous proto.
    let proto: ast.PrototypeAST = new ast.PrototypeAST("", []);
    return new ast.FunctionAST(proto, exp);
  }
  return null;
}
