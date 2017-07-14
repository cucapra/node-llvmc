import * as llvmc from '../../lib/wrapped';
import * as readline from 'readline';
import * as ast from './ast';
import * as lexer from './lexer';

/**
 * Holds the precedence for each binary operator.
 */
const BinopPrecedence: { [op: string]: number } = {
  '+': 20,
  '-': 20,
  '*': 40,
};

/**
 * Parses calculator expressions.
 */
export class Parser {
  /**
   * The lexer state.
   */
  lex = new lexer.Lexer();

  /**
   * CurTok/getNextToken - Provide a simple token buffer.  CurTok is the current
   * token the parser is looking at.  getNextToken reads another token from the
   * lexer and updates CurTok with its results.
   */
  curTok: lexer.Token;
  getNextToken(): lexer.Token {
    this.curTok = this.lex.getTok();
    return this.curTok;
  };

  /**
   * Retrieve the id of the current token
   */
  getCurTokID(): string {
    return this.curTok.id;
  }

  /*
  * numberexpr ::= number
  */
  parseNumberExpr(): ast.ExprAST | null {
    let result: ast.ExprAST = new ast.NumberExprAST(this.lex.getNumVal());
    this.getNextToken(); // consume the number
    return result;
  };

  /*
  * parenexpr ::= '(' expression ')'
  */
  parseParenExpr(): ast.ExprAST | null {
    this.getNextToken(); // eat (.

    let v: ast.ExprAST|null = this.parseExpression();
    if (!v)
        return null;

    if (this.curTok.id !== ')')
        throw 'mismatch parens';

    this.getNextToken(); // eat ).
    return v;
  };

  /*
  * identifierexpr
  *   ::= identifier
  *   ::= identifier '(' expression* ')'
  */
  parseIdentifierExpr(): ast.ExprAST | null {
    let idName: string = this.lex.getIdStr();

    this.getNextToken();  // eat identifier.

    if (this.curTok.id !== '(') // Simple variable ref.
      return new ast.VariableExprAST(idName);

    // Call.
    this.getNextToken();  // eat (
    let args: ast.ExprAST[] = [];

    if (this.curTok.id !== '(') {
      while (true) {
        let arg: ast.ExprAST|null = this.parseExpression();

        if (arg)
          args.push(arg);
        else
          return null;

        if (this.curTok.id == ')')
          break;

        if (this.curTok.id != ',')
          throw "Expected ')' or ',' in argument list";

        this.getNextToken();
      }
    }

    // Eat the ')'.
    this.getNextToken();
    return new ast.CallExprAST(idName, args);
  };

  /*
  * primary
  *   ::= identifierexpr
  *   ::= numberexpr
  *   ::= parenexpr
  */
  parsePrimary(): ast.ExprAST | null {
    switch (this.curTok.id) {
      case 'Tok_Id':
        return this.parseIdentifierExpr();
      case 'Tok_Number':
        return this.parseNumberExpr();
      case '(':
        return this.parseParenExpr();
      default:
        throw 'unknown token';
      }
  };


  /*
  * GetTokPrecedence - Get the precedence of the pending binary operator token.
  */
  getTokPrecedence(): number {
    if (this.curTok instanceof lexer.Tok_Eof)
      return -1;

    // Make sure it's a declared binop.
    if (BinopPrecedence.hasOwnProperty(this.curTok.id))
      return Number(BinopPrecedence[this.curTok.id]);
    return -1;
  }

  /*
  * binoprhs
  *   ::= ('+' primary)*
  */
  parseBinOpRHS(exprPrec: number, left: ast.ExprAST) : ast.ExprAST | null  {
    // If this is a binop, find its precedence.
    while (true) {
      let tokPrec: number = this.getTokPrecedence();

      // If this is a binop that binds at least as tightly as the current binop,
      // consume it, otherwise we are done.
      if (tokPrec < exprPrec)
        return left;

      // Okay, we know this is a binop.
      let binOp: string = this.curTok.id;
      this.getNextToken(); // eat binop

      // Parse the primary expression after the binary operator.
      let right: ast.ExprAST | null = this.parsePrimary();
      if (!right)
        return null;

      // If BinOp binds less tightly with RHS than the operator after RHS, let
      // the pending operator take RHS as its LHS.
      let nextPrec: number = this.getTokPrecedence();
      if (tokPrec < nextPrec) {
        right = this.parseBinOpRHS(tokPrec + 1, right);
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
  parseExpression(): ast.ExprAST | null {
    let left: ast.ExprAST | null = this.parsePrimary();
    if (!left)
      return null;

    return this.parseBinOpRHS(0, left);
  }

  /*
  * prototype
  *   ::= id '(' id* ')'
  */
  parsePrototype(): ast.PrototypeAST | null {
    if (!(this.curTok instanceof lexer.Tok_Id))
      throw "Expected function name in prototype";

    let fnName: string = this.lex.getIdStr();
    this.getNextToken();

    if (this.curTok.id !== '(')
      throw "Expected '(' in prototype";

    // Read the list of argument names.
    let argNames: string[] = [];
    while (this.getNextToken() instanceof lexer.Tok_Id)
      argNames.push(this.lex.getIdStr());

    if (this.curTok.id !== ')')
      throw "Expected ')' in prototype";

    // success.
    this.getNextToken();  // eat ')'.

    return new ast.PrototypeAST(fnName, argNames);
  }

  /*
  * definition ::= 'def' prototype expression
  */
  parseDefinition(): ast.FunctionAST|null {
    this.getNextToken();  // eat def.
    let proto: ast.PrototypeAST | null = this.parsePrototype();
    if (!proto)
      return null;

    let exp: ast.ExprAST | null = this.parseExpression();
    if (exp)
      return new ast.FunctionAST(proto, exp);
    return null;
  }

  /*
  * external ::= 'extern' prototype
  */
  parseExtern(): ast.PrototypeAST | null {
    this.getNextToken();  // eat extern.
    return this.parsePrototype();
  }

  /*
  * toplevelexpr ::= expression
  */
  parseTopLevelExpr(): ast.FunctionAST | null {
    let exp: ast.ExprAST | null = this.parseExpression();
    if (exp) {
      // Make an anonymous proto.
      let proto: ast.PrototypeAST = new ast.PrototypeAST("", []);
      return new ast.FunctionAST(proto, exp);
    }
    return null;
  }

}
